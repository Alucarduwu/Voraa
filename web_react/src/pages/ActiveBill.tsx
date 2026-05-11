import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Send,
  CheckCircle,
  Info,
  Tag,
  ReceiptText,
  MessageCircle,
} from 'lucide-react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type {
  ActiveBill,
  AppliedCoupon,
  BillItem,
  Coupon,
  UserProfile,
} from '../types';

const ActiveBillPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [activeBill, setActiveBill] = useState<ActiveBill | null>(null);
  const [newItem, setNewItem] = useState({ name: '', price: '' });

  const venueId = 'demo-venue-1';
  const venueName = 'Cafe Central';

  useEffect(() => {
    if (!userId) return;

    getDoc(doc(db, 'users', userId)).then((snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as Omit<UserProfile, 'uid'> & Partial<Pick<UserProfile, 'uid'>>;
      setUser({ ...data, uid: data.uid ?? snap.id });
    });

    const couponsQuery = query(
      collection(db, 'coupons'),
      where('active', '==', true),
      where('venueId', '==', venueId),
    );

    getDocs(couponsQuery).then((snap) => {
      setCoupons(
        snap.docs.map((couponDoc) => ({ id: couponDoc.id, ...couponDoc.data() }) as Coupon),
      );
    });

    const billsQuery = query(
      collection(db, 'activeBills'),
      where('userId', '==', userId),
      where('venueId', '==', venueId),
    );

    const unsubscribe = onSnapshot(billsQuery, (snap) => {
      const currentBills = snap.docs
        .map(
          (billDoc) =>
            ({
              ...(billDoc.data() as Omit<ActiveBill, 'id'>),
              id: billDoc.id,
            }) as ActiveBill,
        )
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));

      const currentBill = currentBills[0] ?? null;
      setActiveBill(currentBill);
      if (currentBill?.items?.length) {
        setItems(currentBill.items);
      }
    });

    return () => unsubscribe();
  }, [userId, venueId]);

  const subtotalOriginal = useMemo(
    () => items.reduce((acc, item) => acc + item.total, 0),
    [items],
  );

  const selectedCouponData = useMemo(
    () => coupons.find((coupon) => coupon.id === selectedCoupon) ?? null,
    [coupons, selectedCoupon],
  );

  const { couponTitle, discountAmount } = useMemo(() => {
    if (!selectedCouponData) {
      return { couponTitle: '', discountAmount: 0 };
    }

    if (selectedCouponData.discountType === 'percentage') {
      return {
        couponTitle: selectedCouponData.title,
        discountAmount: subtotalOriginal * (selectedCouponData.discountValue / 100),
      };
    }

    if (selectedCouponData.discountType === 'fixed') {
      return {
        couponTitle: selectedCouponData.title,
        discountAmount: selectedCouponData.discountValue,
      };
    }

    return {
      couponTitle: selectedCouponData.title,
      discountAmount: subtotalOriginal * 0.5,
    };
  }, [selectedCouponData, subtotalOriginal]);

  const appliedCoupons = useMemo<AppliedCoupon[]>(
    () =>
      selectedCouponData
        ? [
            {
              couponId: selectedCouponData.id,
              title: selectedCouponData.title,
              discountType: selectedCouponData.discountType,
              discountValue: selectedCouponData.discountValue,
              discountAmount,
            },
          ]
        : [],
    [discountAmount, selectedCouponData],
  );

  const finalTotal = Math.max(0, subtotalOriginal - discountAmount);
  const tip10 = subtotalOriginal * 0.1;
  const tip12 = subtotalOriginal * 0.12;
  const tip15 = subtotalOriginal * 0.15;

  const addItem = () => {
    const name = newItem.name.trim();
    const price = Number.parseFloat(newItem.price);

    if (!name || !Number.isFinite(price) || price <= 0) return;

    setItems((currentItems) => [
      ...currentItems,
      {
        productId: `manual-${Date.now()}`,
        name,
        price,
        quantity: 1,
        total: price,
      },
    ]);
    setNewItem({ name: '', price: '' });
  };

  const removeItem = (index: number) => {
    setItems((currentItems) => currentItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const sendToUser = async () => {
    if (!userId || !user) return;

    const billId = activeBill?.id ?? `bill_${userId}_${Date.now()}`;
    const billData = {
      id: billId,
      userId,
      userCode: user.code,
      userName: user.name,
      venueId,
      venueName,
      status: 'waiting_client_feedback' as const,
      items,
      appliedCoupons,
      originalTotal: subtotalOriginal,
      discountTotal: discountAmount,
      finalTotal,
      suggestedTip10: tip10,
      suggestedTip12: tip12,
      suggestedTip15: tip15,
      savings: discountAmount,
      restaurantFeedback: 'pending' as const,
      clientFeedback: 'pending' as const,
      hasReport: false,
      createdAt: activeBill?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'activeBills', billId), billData);
  };

  const closeFinal = async (status: 'closed' | 'reported') => {
    if (!activeBill || !userId) return;

    if (status === 'closed') {
      await updateDoc(doc(db, 'users', userId), {
        completedVisits: increment(1),
        positiveInteractions: increment(1),
        totalSavings: increment(activeBill.discountTotal),
      });

      await addDoc(collection(db, 'redemptions'), {
        billId: activeBill.id,
        userId,
        userName: activeBill.userName,
        venueId,
        venueName,
        originalTotal: activeBill.originalTotal,
        discountAmount: activeBill.discountTotal,
        finalTotal: activeBill.finalTotal,
        suggestedTip10: activeBill.suggestedTip10,
        suggestedTip12: activeBill.suggestedTip12,
        suggestedTip15: activeBill.suggestedTip15,
        savings: activeBill.savings,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        confirmedAt: serverTimestamp(),
      });
    }

    await updateDoc(doc(db, 'activeBills', activeBill.id), {
      status,
      hasReport: status === 'reported',
      clientFeedback: status === 'closed' ? 'positive' : 'negative',
      updatedAt: serverTimestamp(),
      closedAt: serverTimestamp(),
    });

    navigate('/bills');
  };

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <header className="flex items-center gap-4">
          <div className="p-3 bg-lavender text-primary rounded-2xl">
            <ReceiptText size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Cuenta Activa</h2>
            <p className="text-text-muted">
              Gestionando mesa de <strong>{user?.name || 'Cliente'}</strong>
            </p>
          </div>
        </header>

        <section className="card">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Plus size={20} className="text-primary" /> Agregar Productos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Nombre del producto"
                className="w-full p-4 border rounded-xl"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Precio ($)"
                className="w-full p-4 border rounded-xl"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              />
            </div>
            <button onClick={addItem} className="primary flex items-center justify-center gap-2">
              <Plus size={20} /> Agregar
            </button>
          </div>

          <div className="overflow-hidden border rounded-2xl">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase">Producto</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase">Precio</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase text-right">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, idx) => (
                  <tr key={`${item.productId}-${idx}`} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4 font-bold">${item.total.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-danger hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-text-muted italic">
                      No hay productos agregados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Tag size={20} className="text-primary" /> Aplicar Cupon
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                onClick={() => setSelectedCoupon(selectedCoupon === coupon.id ? null : coupon.id)}
                className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  selectedCoupon === coupon.id
                    ? 'border-primary bg-lavender/30'
                    : 'border-gray-100 hover:border-primary/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{coupon.title}</p>
                    <p className="text-xs text-text-muted">{coupon.description}</p>
                  </div>
                  {selectedCoupon === coupon.id && (
                    <CheckCircle className="text-primary" size={20} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <div className="card sticky top-8 bg-white shadow-2xl border-t-8 border-primary">
          <h3 className="font-bold text-xl mb-6">Resumen de Cuenta</h3>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-text-muted font-medium">
              <span>Subtotal Original</span>
              <span>${subtotalOriginal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-success font-bold">
              <span>Descuento Aplicado</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-bold">Total Final</span>
              <span className="text-3xl font-black text-primary">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-5 bg-lavender rounded-2xl mb-8">
            <div className="flex items-center gap-2 text-primary font-bold mb-3 text-sm">
              <Info size={16} /> Propina Sugerida
            </div>
            <p className="text-[10px] text-primary/70 leading-tight mb-4 uppercase font-black tracking-widest">
              Calculada sobre subtotal original (${subtotalOriginal.toFixed(2)})
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                <p className="text-[10px] font-bold text-text-muted">10%</p>
                <p className="font-bold text-primary">${tip10.toFixed(2)}</p>
              </div>
              <div className="bg-white p-3 rounded-xl text-center shadow-sm border-2 border-primary">
                <p className="text-[10px] font-bold text-text-muted">12%</p>
                <p className="font-bold text-primary">${tip12.toFixed(2)}</p>
              </div>
              <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                <p className="text-[10px] font-bold text-text-muted">15%</p>
                <p className="font-bold text-primary">${tip15.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={sendToUser}
              disabled={items.length === 0}
              className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                items.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'primary shadow-lg shadow-primary/20'
              }`}
            >
              <Send size={20} /> Enviar a Cliente
            </button>

            {activeBill?.status === 'waiting_client_feedback' && (
              <button
                onClick={() => closeFinal('closed')}
                className="w-full bg-success text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} /> Cerrar Cuenta
              </button>
            )}

            {activeBill &&
              activeBill.status !== 'closed' &&
              activeBill.status !== 'reported' &&
              activeBill.status !== 'cancelled' && (
                <button
                  onClick={() => closeFinal('reported')}
                  className="w-full border-2 border-danger/20 text-danger py-3 rounded-2xl font-bold hover:bg-danger/5 transition-colors"
                >
                  Reportar Problema
                </button>
              )}
          </div>

          {activeBill?.status === 'waiting_client_feedback' && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
              <div className="animate-pulse w-2 h-2 rounded-full bg-orange-500 mt-1"></div>
              <p className="text-xs text-orange-800 font-medium leading-relaxed">
                Esperando confirmacion de <strong>{user?.name}</strong> desde su aplicacion
                movil...
              </p>
            </div>
          )}
        </div>

        <div className="card bg-slate-900 text-white border-none">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="text-primary" size={24} />
            <h4 className="font-bold">Chat de Asistencia</h4>
          </div>
          <p className="text-xs opacity-60">
            {couponTitle
              ? `Beneficio actual: ${couponTitle}.`
              : 'Soporte directo con el administrador en caso de reportes de friccion.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActiveBillPage;
