import React, { useEffect, useState } from 'react';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Coupon } from '../types';
import { Plus, Tag, Edit, Power, PowerOff } from 'lucide-react';

type CouponFormState = {
  title: string;
  description: string;
  discountType: Coupon['discountType'];
  discountValue: number;
};

const initialCouponState: CouponFormState = {
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
};

const VenueCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState<CouponFormState>(initialCouponState);

  const venueId = 'venue1';
  const venueName = 'La Parrilla Argentina';

  useEffect(() => {
    const couponsQuery = query(collection(db, 'coupons'), where('venueId', '==', venueId));
    const unsubscribe = onSnapshot(couponsQuery, (snap) => {
      setCoupons(
        snap.docs.map((couponDoc) => ({ id: couponDoc.id, ...couponDoc.data() }) as Coupon),
      );
    });

    return () => unsubscribe();
  }, [venueId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = Timestamp.now();
    const validUntil = Timestamp.fromDate(new Date(2026, 11, 31));

    await addDoc(collection(db, 'coupons'), {
      venueId,
      venueName,
      title: newCoupon.title,
      description: newCoupon.description,
      discountType: newCoupon.discountType,
      discountValue: newCoupon.discountValue,
      imageUrl: '',
      combinable: false,
      active: true,
      validFrom: now,
      validUntil,
      createdAt: now,
      updatedAt: now,
    });

    setNewCoupon(initialCouponState);
    setShowAdd(false);
  };

  const toggleStatus = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'coupons', id), {
      active: !current,
      updatedAt: Timestamp.now(),
    });
  };

  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Mis Cupones</h2>
          <p className="text-text-muted">Gestiona las ofertas activas de {venueName}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="primary flex items-center gap-2">
          <Plus size={20} /> Crear Cupon
        </button>
      </header>

      {showAdd && (
        <div className="card mb-8 bg-purple-50 border-primary/20">
          <h3 className="font-bold mb-4">Nuevo Cupon</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="px-4 py-2 rounded-xl border"
              placeholder="Titulo (ej: 20% OFF)"
              value={newCoupon.title}
              onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
              required
            />
            <input
              className="px-4 py-2 rounded-xl border"
              placeholder="Descripcion corta"
              value={newCoupon.description}
              onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
              required
            />
            <select
              className="px-4 py-2 rounded-xl border"
              value={newCoupon.discountType}
              onChange={(e) =>
                setNewCoupon({
                  ...newCoupon,
                  discountType: e.target.value as Coupon['discountType'],
                })
              }
            >
              <option value="percentage">Porcentaje</option>
              <option value="fixed">Monto Fijo</option>
              <option value="two_for_one">2x1</option>
            </select>
            <input
              type="number"
              className="px-4 py-2 rounded-xl border"
              placeholder="Valor"
              value={newCoupon.discountValue}
              onChange={(e) =>
                setNewCoupon({
                  ...newCoupon,
                  discountValue: Number.parseFloat(e.target.value) || 0,
                })
              }
              required
            />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="primary">
                Guardar Cupon
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`card border-l-4 ${coupon.active ? 'border-l-success' : 'border-l-gray-300'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-100 rounded-lg text-primary">
                <Tag size={20} />
              </div>
              <button
                onClick={() => toggleStatus(coupon.id, coupon.active)}
                className={coupon.active ? 'text-success' : 'text-text-muted'}
              >
                {coupon.active ? <Power size={20} /> : <PowerOff size={20} />}
              </button>
            </div>
            <h4 className="font-bold text-lg">{coupon.title}</h4>
            <p className="text-sm text-text-muted mb-4">{coupon.description}</p>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-xs font-bold uppercase text-primary">
                {coupon.discountType === 'two_for_one' ? '2X1' : coupon.discountType}
              </span>
              <button className="text-text-muted hover:text-primary">
                <Edit size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VenueCoupons;
