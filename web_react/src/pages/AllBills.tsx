import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { AlertCircle, ArrowRight, CheckCircle, Receipt } from 'lucide-react';
import type { ActiveBill } from '../types';

const AllBills: React.FC = () => {
  const [bills, setBills] = useState<ActiveBill[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'waiting_client_feedback' | 'closed' | 'reported'>('all');
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const venueId = 'demo-venue-1';

  useEffect(() => {
    const billsQuery = query(collection(db, 'activeBills'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(billsQuery, (snapshot) => {
      const billsData = snapshot.docs.map((billDoc) => ({ id: billDoc.id, ...billDoc.data() } as ActiveBill));
      setBills(billsData);
    });

    return () => unsubscribe();
  }, []);

  const filteredBills = bills.filter((bill) => {
    if (!isAdmin && bill.venueId !== venueId) return false;
    if (filter === 'all') return true;
    return bill.status === filter;
  });

  const filterOptions = (['all', 'open', 'waiting_client_feedback', 'closed', 'reported'] as const).filter(
    (value) => isAdmin || value !== 'reported',
  );

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="space-y-4">
          <span className="page-kicker">
            <Receipt size={14} /> Auditoria de tickets
          </span>
          <div className="space-y-3">
            <h1 className="page-title">Cuentas activas y cerradas</h1>
            <p className="page-copy">
              Vista global de consumo, ahorro y estado de cada cuenta. Ahora la lectura tambien
              funciona bien en telefono y tablet.
            </p>
          </div>
        </div>

        <div className="panel-shell w-full sm:w-auto">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                  filter === value
                    ? 'bg-primary text-white shadow-[0_14px_28px_rgba(108,77,255,0.25)]'
                    : 'bg-white text-text-muted hover:bg-primary/6 hover:text-primary'
                }`}
              >
                {value === 'all'
                  ? 'Todas'
                  : value === 'open'
                    ? 'Abiertas'
                    : value === 'waiting_client_feedback'
                      ? 'Pendientes'
                      : value === 'closed'
                        ? 'Cerradas'
                        : 'Friccion'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="space-y-4">
        {filteredBills.map((bill) => (
          <button
            key={bill.id}
            onClick={() => navigate(`/bill/${bill.id}`)}
            className="card flex w-full flex-col gap-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 sm:gap-6 xl:flex-row xl:items-center xl:justify-between"
          >
            <div className="flex items-start gap-4 sm:items-center">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] ${
                  bill.status === 'open'
                    ? 'bg-primary/10 text-primary'
                    : bill.status === 'reported'
                      ? 'bg-rose-100 text-danger'
                      : bill.status === 'waiting_client_feedback'
                        ? 'bg-amber-100 text-warning'
                        : 'bg-emerald-100 text-success'
                }`}
              >
                <Receipt size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-xl font-black italic tracking-tight text-text">
                  {bill.userName}
                </h3>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
                  {bill.venueName}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-primary/70">
                  #{bill.id.split('_').pop()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:min-w-[580px]">
              <div className="rounded-[22px] bg-primary/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Estado
                </p>
                <span
                  className={`mt-3 w-fit ${
                    bill.status === 'open'
                      ? 'badge badge-warning'
                      : bill.status === 'reported'
                        ? isAdmin
                          ? 'badge badge-error'
                          : 'badge badge-success'
                        : bill.status === 'waiting_client_feedback'
                          ? 'badge badge-warning'
                          : 'badge badge-success'
                  }`}
                >
                  {bill.status === 'reported' && !isAdmin
                    ? 'closed'
                    : bill.status.replaceAll('_', ' ')}
                </span>
              </div>

              <div className="rounded-[22px] bg-primary/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Total
                </p>
                <p className="mt-3 text-xl font-black italic text-text">${bill.finalTotal}</p>
              </div>

              <div className="rounded-[22px] bg-primary/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Ahorro
                </p>
                <p className="mt-3 text-xl font-black italic text-success">${bill.savings}</p>
              </div>

              <div className="rounded-[22px] bg-primary/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Auditoria
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <CheckCircle
                    size={18}
                    className={bill.status === 'closed' ? 'text-success' : 'text-gray-300'}
                  />
                  <AlertCircle
                    size={18}
                    className={bill.hasReport ? 'text-danger' : 'text-gray-300'}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end xl:justify-start">
              <span className="secondary w-full sm:w-auto">
                Detalles <ArrowRight size={16} />
              </span>
            </div>
          </button>
        ))}

        {filteredBills.length === 0 && (
          <div className="card border-dashed border-primary/15 bg-primary/5 py-20 text-center">
            <Receipt size={54} className="mx-auto mb-5 text-primary/30" />
            <p className="text-2xl font-black italic text-text">
              Sin cuentas registradas en esta categoria.
            </p>
            <p className="mt-3 text-sm font-medium text-text-muted">
              Cambia el filtro o abre una nueva cuenta desde el scanner.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AllBills;
