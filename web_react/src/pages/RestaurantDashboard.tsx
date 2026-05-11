import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
  ArrowRight,
  BarChart3,
  Clock,
  PlusCircle,
  QrCode,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ActiveBill } from '../types';

const RestaurantDashboard: React.FC = () => {
  const [activeBills, setActiveBills] = useState<ActiveBill[]>([]);
  const navigate = useNavigate();
  const venueId = 'demo-venue-1';

  useEffect(() => {
    const billsQuery = query(collection(db, 'activeBills'), where('venueId', '==', venueId));

    const unsubscribe = onSnapshot(billsQuery, (snapshot) => {
      const bills = snapshot.docs.map((billDoc) => ({ id: billDoc.id, ...billDoc.data() } as ActiveBill));
      bills.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setActiveBills(bills);
    });

    return () => unsubscribe();
  }, [venueId]);

  const stats = [
    {
      label: 'Cuentas abiertas',
      value: activeBills.filter((bill) => bill.status === 'open').length,
      icon: Clock,
      color: 'text-primary',
    },
    {
      label: 'Cuentas cerradas',
      value: activeBills.filter((bill) => bill.status === 'closed' || bill.status === 'reported').length,
      icon: Receipt,
      color: 'text-success',
    },
    {
      label: 'Ahorro generado',
      value: `$${activeBills.reduce((acc, bill) => acc + (bill.savings || 0), 0)}`,
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      label: 'Tickets en sala',
      value: activeBills.length,
      icon: BarChart3,
      color: 'text-warning',
    },
  ];

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="space-y-4">
          <span className="page-kicker">
            <BarChart3 size={14} /> Operacion en piso
          </span>
          <div className="space-y-3">
            <h1 className="page-title">Panel del Staff</h1>
            <p className="page-copy">
              Monitorea tickets, ahorro, friccion y movimiento del local en una vista clara y
              lista para movil.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="badge badge-success">Servicio activo</span>
            <span className="badge badge-warning">Cafe Central</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button onClick={() => navigate('/bills')} className="secondary w-full sm:w-auto">
            Ver historial
          </button>
          <button onClick={() => navigate('/scanner')} className="primary w-full sm:w-auto">
            <PlusCircle size={18} /> Nueva cuenta
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card group">
            <div className="mb-5 flex items-start justify-between">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-[22px] bg-primary/6 ${stat.color} transition-all duration-300 group-hover:bg-primary group-hover:text-white`}
              >
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-text-muted">
                Hoy
              </span>
            </div>
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="card space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">
                Sala en movimiento
              </p>
              <h2 className="mt-2 text-2xl font-black italic tracking-tight text-text sm:text-3xl">
                Actividad reciente
              </h2>
            </div>
            <button
              onClick={() => navigate('/bills')}
              className="text-sm font-black text-primary transition-colors hover:text-primary-dark"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-4">
            {activeBills.slice(0, 5).map((bill) => (
              <button
                key={bill.id}
                onClick={() => navigate(`/bill/${bill.id}`)}
                className="flex w-full flex-col gap-5 rounded-[28px] border border-primary/8 bg-primary/5 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-white hover:shadow-[0_18px_40px_rgba(108,77,255,0.08)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${
                      bill.status === 'open'
                        ? 'bg-amber-100 text-warning'
                        : 'bg-emerald-100 text-success'
                    }`}
                  >
                    <Receipt size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black italic text-text">{bill.userName}</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
                      {bill.userCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:min-w-[320px] sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      Estado
                    </p>
                    <span className={`mt-2 ${bill.status === 'open' ? 'badge badge-warning' : 'badge badge-success'}`}>
                      {bill.status === 'reported' ? 'Closed' : bill.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      Total
                    </p>
                    <p className="mt-2 text-lg font-black italic text-text">${bill.finalTotal}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      Ahorro
                    </p>
                    <p className="mt-2 text-lg font-black italic text-success">${bill.savings}</p>
                  </div>
                </div>

                <ArrowRight className="hidden text-primary sm:block" size={20} />
              </button>
            ))}

            {activeBills.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-primary/15 bg-primary/5 px-6 py-14 text-center">
                <Receipt size={46} className="mx-auto mb-4 text-primary/35" />
                <p className="text-xl font-black italic text-text">No hay actividad reciente.</p>
                <p className="mt-2 text-sm font-medium text-text-muted">
                  Abre una cuenta nueva para empezar a operar desde este panel.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card overflow-hidden bg-[#170f2e] text-white">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-[24px] bg-white/10 text-white">
              <QrCode size={28} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">
              Atajo del staff
            </p>
            <h3 className="mt-3 text-3xl font-black italic tracking-tight">
              Escanea y abre una mesa en segundos.
            </h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-white/72">
              Flujo rapido para recepcion, validacion del pase y aplicacion de beneficios sin
              perder ritmo de servicio.
            </p>
            <button onClick={() => navigate('/scanner')} className="primary mt-8 w-full !bg-white !text-primary hover:!bg-primary-soft">
              <QrCode size={18} /> Ir al scanner
            </button>
          </div>

          <div className="panel-shell">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
              Nota operativa
            </p>
            <p className="mt-3 text-sm font-medium leading-relaxed text-text-muted">
              La interfaz ahora se adapta mejor a telefono y tablet para que puedas operar en
              pasillo, barra o caja sin zoom ni scroll lateral.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default RestaurantDashboard;
