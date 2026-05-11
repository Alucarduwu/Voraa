import { db } from '../firebase/firebase';
import { doc, updateDoc, Timestamp, writeBatch, collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import type { ActiveBill, BillItem, AppliedCoupon } from '../types';

export const calculateBill = (items: BillItem[], coupons: AppliedCoupon[]): Partial<ActiveBill> => {
  const originalTotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  
  // Calculate discounts
  let discountTotal = 0;
  const processedCoupons = coupons.map(c => {
    let amount = 0;
    if (c.discountType === 'percentage') {
      amount = originalTotal * (c.discountValue / 100);
    } else if (c.discountType === 'fixed') {
      amount = c.discountValue;
    }
    // Note: 'two_for_one' logic could be added here if product context is available
    
    discountTotal += amount;
    return { ...c, discountAmount: amount };
  });

  const finalTotal = Math.max(0, originalTotal - discountTotal);
  
  return {
    items,
    appliedCoupons: processedCoupons,
    originalTotal,
    discountTotal,
    finalTotal,
    suggestedTip10: originalTotal * 0.10,
    suggestedTip12: originalTotal * 0.12,
    suggestedTip15: originalTotal * 0.15,
    savings: discountTotal,
    updatedAt: Timestamp.now()
  };
};

export const billService = {
  async addItem(billId: string, currentBill: ActiveBill, newItem: BillItem) {
    try {
      const existingIndex = currentBill.items.findIndex(i => i.productId === newItem.productId);
      const newItems = [...currentBill.items];
      
      if (existingIndex > -1) {
        newItems[existingIndex].quantity += newItem.quantity;
        newItems[existingIndex].total = newItems[existingIndex].quantity * newItems[existingIndex].price;
      } else {
        newItems.push({ ...newItem, total: newItem.quantity * newItem.price });
      }

      const updates = calculateBill(newItems, currentBill.appliedCoupons);
      await updateDoc(doc(db, 'activeBills', billId), updates);
    } catch (error) {
      console.error("❌ VORAA_BILL_SERVICE_ADD_ITEM_ERROR:", error);
      throw error;
    }
  },

  async updateQuantity(billId: string, currentBill: ActiveBill, productId: string, delta: number) {
    try {
      const newItems = currentBill.items.map(it => {
        if (it.productId === productId) {
          const newQty = Math.max(0, it.quantity + delta);
          return { ...it, quantity: newQty, total: newQty * it.price };
        }
        return it;
      }).filter(it => it.quantity > 0);

      const updates = calculateBill(newItems, currentBill.appliedCoupons);
      await updateDoc(doc(db, 'activeBills', billId), updates);
    } catch (error) {
      console.error("❌ VORAA_BILL_SERVICE_UPDATE_QTY_ERROR:", error);
      throw error;
    }
  },

  async closeBill(billId: string, isPositive: boolean) {
    const batch = writeBatch(db);
    const billRef = doc(db, 'activeBills', billId);
    
    // 1. Update Bill
    batch.update(billRef, {
      status: isPositive ? 'waiting_client_feedback' : 'reported',
      restaurantFeedback: isPositive ? 'positive' : 'negative',
      updatedAt: Timestamp.now()
    });

    // 2. If it's a report, create the report document
    if (!isPositive) {
      const reportRef = doc(collection(db, 'reports'));
      // We'll get the current bill data to populate the report
      // Since this is a service, we'd ideally have the bill object passed in.
      // For now, we'll use a placeholder and expect the UI to provide details if possible, 
      // or we just use what we have in the billId.
      // To be safe, we'll let the UI call a separate report creation if they want details, 
      // or we can just fetch it here.
      // Let's assume we want a basic report created automatically.
      
      // Fetching bill data to get names
      const billSnap = await getDoc(billRef);
      const billData = billSnap.data() as ActiveBill;

      batch.set(reportRef, {
        id: reportRef.id,
        billId: billId,
        userId: billData?.userId || 'unknown',
        userName: billData?.userName || 'Cliente',
        venueId: billData?.venueId || 'demo-venue-1',
        venueName: billData?.venueName || 'Restaurante',
        origin: 'restaurant',
        type: 'other',
        description: 'La cuenta fue marcada como REPORTE por el staff.',
        status: 'open',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    try {
      await batch.commit();
    } catch (error) {
      console.error("❌ VORAA_BILL_SERVICE_CLOSE_BILL_ERROR:", error);
      throw error;
    }
  },

  async cancelBill(billId: string, userId: string) {
    const batch = writeBatch(db);
    
    // 1. Cancel bill
    batch.update(doc(db, 'activeBills', billId), {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });

    // 2. Return coupons to 'saved' status
    const q = query(collection(db, 'savedCoupons'), 
      where('userId', '==', userId), 
      where('status', 'in', ['accepted', 'requested'])
    );
    const snapshots = await getDocs(q);
    snapshots.forEach(d => {
      batch.update(d.ref, { 
        status: 'saved',
        selectedForNextBill: false 
      });
    });

    await batch.commit();
  }
};
