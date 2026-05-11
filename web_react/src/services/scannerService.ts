import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, doc, writeBatch, Timestamp, getDoc } from 'firebase/firestore';
import type { UserProfile, Coupon, SavedCoupon, ActiveBill } from '../types';

const isCouponActiveNow = (coupon: Coupon) => {
  if (!coupon.active) return false;

  const now = new Date();
  const validFrom = coupon.validFrom?.toDate?.();
  const validUntil = coupon.validUntil?.toDate?.();

  if (validFrom && validFrom > now) return false;
  if (validUntil && validUntil < now) return false;

  return true;
};

export const scannerService = {
  async findUserByCode(code: string): Promise<UserProfile | null> {
    const q = query(collection(db, 'users'), where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { uid: doc.id, ...doc.data() } as UserProfile;
  },

  async getActiveCoupons(userId: string, venueId: string): Promise<{savedId: string, coupon: Coupon}[]> {
    const q = query(collection(db, 'savedCoupons'), 
      where('userId', '==', userId),
      where('venueId', '==', venueId),
      where('status', '==', 'requested')
    );
    const snapshot = await getDocs(q);
    
    const results: { savedId: string; coupon: Coupon }[] = [];
    for (const d of snapshot.docs) {
      const data = d.data() as SavedCoupon;
      const couponSnap = await getDoc(doc(db, 'coupons', data.couponId));
      if (couponSnap.exists()) {
        const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon;
        if (isCouponActiveNow(coupon)) {
          results.push({
            savedId: d.id,
            coupon,
          });
        }
      }
    }
    return results;
  },

  async getRequestedCoupons(userId: string, venueId: string): Promise<{savedId: string, coupon: Coupon}[]> {
    return scannerService.getActiveCoupons(userId, venueId);
  },

  async openBill(user: UserProfile, venue: {id: string, name: string}, coupons: {savedId: string, coupon: Coupon}[]) {
    const batch = writeBatch(db);
    const billId = `bill_${user.uid}_${Date.now()}`;
    const billRef = doc(db, 'activeBills', billId);

    // 1. Create the bill
    const newBill: Partial<ActiveBill> = {
      id: billId,
      userId: user.uid,
      userCode: user.code,
      userName: user.name,
      venueId: venue.id,
      venueName: venue.name,
      status: 'open',
      items: [],
      appliedCoupons: coupons.map(c => ({
        couponId: c.coupon.id,
        title: c.coupon.title,
        discountType: c.coupon.discountType,
        discountValue: c.coupon.discountValue,
        discountAmount: 0 // Will be calculated when items are added
      })),
      originalTotal: 0,
      discountTotal: 0,
      finalTotal: 0,
      suggestedTip10: 0,
      suggestedTip12: 0,
      suggestedTip15: 0,
      savings: 0,
      restaurantFeedback: 'pending',
      clientFeedback: 'pending',
      hasReport: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    batch.set(billRef, newBill);

    // 2. Update status of coupons to 'accepted'
    for (const c of coupons) {
      batch.update(doc(db, 'savedCoupons', c.savedId), {
        status: 'accepted',
        acceptedAt: Timestamp.now()
      });
    }

    await batch.commit();
    return billId;
  }
};
