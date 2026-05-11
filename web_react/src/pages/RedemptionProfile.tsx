import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Coupon, UserProfile } from '../types';
import { User as UserIcon, Star, Ticket, Info, CheckCircle } from 'lucide-react';

const RedemptionProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [originalTotal, setOriginalTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data() as Omit<UserProfile, 'uid'> & Partial<Pick<UserProfile, 'uid'>>;
          setUser({ ...data, uid: data.uid ?? userDoc.id });
        }

        const couponsQuery = query(collection(db, 'coupons'), where('active', '==', true));
        const couponDocs = await getDocs(couponsQuery);
        setCoupons(couponDocs.docs.map((couponDoc) => ({ id: couponDoc.id, ...couponDoc.data() }) as Coupon));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const discountAmount = useMemo(() => {
    if (!selectedCoupon) return 0;
    if (selectedCoupon.discountType === 'percentage') {
      return (originalTotal * selectedCoupon.discountValue) / 100;
    }
    if (selectedCoupon.discountType === 'fixed') {
      return selectedCoupon.discountValue;
    }
    return originalTotal * 0.5;
  }, [originalTotal, selectedCoupon]);

  const finalTotal = Math.max(0, originalTotal - discountAmount);
  const tip10 = originalTotal * 0.1;
  const tip12 = originalTotal * 0.12;
  const tip15 = originalTotal * 0.15;

  const handleConfirm = async () => {
    if (!user || !selectedCoupon || originalTotal <= 0) return;

    try {
      await addDoc(collection(db, 'redemptions'), {
        userId: user.uid,
        userName: user.name,
        venueId: selectedCoupon.venueId,
        venueName: selectedCoupon.venueName,
        couponId: selectedCoupon.id,
        originalTotal,
        discountAmount,
        finalTotal,
        suggestedTip10: tip10,
        suggestedTip12: tip12,
        suggestedTip15: tip15,
        savings: discountAmount,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        confirmedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', user.uid), {
        totalSavings: increment(discountAmount),
        completedVisits: increment(1),
      });

      setIsSuccess(true);
      window.setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-20">Cargando perfil...</div>;
  if (!user) return <div className="text-center py-20">Usuario no encontrado</div>;

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-20 animate-fade-in">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Redencion Exitosa</h2>
        <p className="text-text-muted mb-8">El descuento ha sido aplicado correctamente.</p>
        <button onClick={() => navigate('/dashboard')} className="secondary w-full">
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <header className="mb-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <UserIcon size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1 text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              <Star size={14} fill="currentColor" /> {user.frequentLevel}
            </span>
            <span className="text-sm text-text-muted">
              Ahorro total: <strong>${user.totalSavings}</strong>
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Ticket className="text-primary" size={20} /> Seleccionar Cupon
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  onClick={() => setSelectedCoupon(coupon)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    selectedCoupon?.id === coupon.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <p className="font-bold text-lg">{coupon.title}</p>
                  <p className="text-xs text-text-muted mb-2">{coupon.description}</p>
                  <div className="text-xs font-bold text-primary uppercase">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% OFF`
                      : coupon.discountType === 'fixed'
                        ? `$${coupon.discountValue} OFF`
                        : '2x1'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h3 className="font-bold mb-4">Ingresar Cuenta</h3>
            <div className="input-group">
              <label>Monto Total Original (Antes de descuento)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">
                  $
                </span>
                <input
                  type="number"
                  className="pl-8 text-xl font-bold"
                  placeholder="0.00"
                  value={originalTotal || ''}
                  onChange={(e) => setOriginalTotal(Number(e.target.value))}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="card border-2 border-primary/20 bg-white sticky top-8">
            <h3 className="font-bold mb-4 pb-4 border-b">Resumen de Redencion</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total Original:</span>
                <span className="font-semibold">${originalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-success font-medium">
                <span>Descuento:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t">
                <span>Total Final:</span>
                <span className="text-primary">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl mb-6">
              <div className="flex items-start gap-2 mb-3">
                <Info size={16} className="text-primary mt-0.5" />
                <p className="text-[11px] leading-tight text-purple-900 font-medium">
                  <strong>IMPORTANTE:</strong> La propina sugerida se calcula sobre el total
                  original para asegurar una compensacion justa al staff.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span>Sugerida 10%</span>
                  <span className="font-bold">${tip10.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>Sugerida 12%</span>
                  <span className="font-bold">${tip12.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>Sugerida 15%</span>
                  <span className="font-bold">${tip15.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedCoupon || originalTotal <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                !selectedCoupon || originalTotal <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'primary'
              }`}
            >
              Confirmar Redencion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedemptionProfile;
