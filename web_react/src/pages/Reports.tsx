import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, Timestamp, updateDoc } from 'firebase/firestore';
import {
  Check,
  CheckCircle,
  MessageSquare,
  Receipt,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Report, Venue } from '../types';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [originFilter, setOriginFilter] = useState<'all' | 'client' | 'restaurant'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubReports = onSnapshot(
      query(collection(db, 'reports'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setReports(snapshot.docs.map((reportDoc) => ({ id: reportDoc.id, ...reportDoc.data() } as Report)));
      },
    );

    const unsubVenues = onSnapshot(collection(db, 'venues'), (snapshot) => {
      setVenues(snapshot.docs.map((venueDoc) => ({ id: venueDoc.id, ...venueDoc.data() } as Venue)));
    });

    return () => {
      unsubReports();
      unsubVenues();
    };
  }, []);

  const handleResolve = async (id: string) => {
    await updateDoc(doc(db, 'reports', id), { status: 'resolved', updatedAt: Timestamp.now() });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Eliminar este reporte permanentemente?')) {
      await deleteDoc(doc(db, 'reports', id));
    }
  };

  const handleSaveNote = async () => {
    if (!editingReport) return;
    await updateDoc(doc(db, 'reports', editingReport.id), {
      adminNotes: adminNote,
      updatedAt: Timestamp.now(),
    });
    setEditingReport(null);
    setAdminNote('');
  };

  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const staffVenueId = 'demo-venue-1';

  const filteredReports = reports.filter((report) => {
    if (!isAdmin) {
      if (report.venueId !== staffVenueId || report.origin !== 'restaurant') return false;
    } else if (selectedVenue !== 'all' && report.venueId !== selectedVenue) {
      return false;
    }

    const matchesStatus = filter === 'all' || report.status === filter;
    const matchesOrigin = originFilter === 'all' || report.origin === originFilter;
    const lowered = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      report.description?.toLowerCase().includes(lowered) ||
      report.userName?.toLowerCase().includes(lowered) ||
      report.venueName?.toLowerCase().includes(lowered) ||
      report.billId?.toLowerCase().includes(lowered);

    return matchesStatus && matchesOrigin && matchesSearch;
  });

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="space-y-4">
          <span className="page-kicker">
            <ShieldCheck size={14} /> Friccion y resolucion
          </span>
          <div className="space-y-3">
            <h1 className="page-title">Gestion de incidentes</h1>
            <p className="page-copy">
              Centraliza conflictos, notas internas y seguimiento por local desde una interfaz mas
              limpia y responsive.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar reporte, cliente o local..."
              className="input-premium pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="panel-shell">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-wrap gap-2">
                {(['all', 'open', 'resolved'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      filter === value
                        ? 'bg-primary text-white shadow-[0_14px_28px_rgba(108,77,255,0.25)]'
                        : 'bg-white text-text-muted hover:bg-primary/6 hover:text-primary'
                    }`}
                  >
                    {value === 'all' ? 'Todos' : value === 'open' ? 'Pendientes' : 'Resueltos'}
                  </button>
                ))}
              </div>

              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value as 'all' | 'client' | 'restaurant')}
                  className="input-premium !py-3"
                >
                  <option value="all">Todos los origenes</option>
                  <option value="client">Clientes</option>
                  <option value="restaurant">Staff</option>
                </select>

                {isAdmin && (
                  <select
                    value={selectedVenue}
                    onChange={(e) => setSelectedVenue(e.target.value)}
                    className="input-premium !py-3"
                  >
                    <option value="all">Todos los locales</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {filteredReports.map((report) => (
          <article
            key={report.id}
            className={`card ${
              report.status === 'open'
                ? 'border-t-[10px] border-t-danger'
                : 'border-t-[10px] border-t-success'
            }`}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${
                    report.origin === 'client' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-warning'
                  }`}
                >
                  {report.origin === 'client' ? <User size={24} /> : <Store size={24} />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Iniciado por
                  </p>
                  <p className="mt-2 text-lg font-black italic text-text">
                    {report.origin.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                <span className={report.status === 'open' ? 'badge badge-error' : 'badge badge-success'}>
                  {report.status}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  {new Date(report.createdAt?.toDate()).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/70">
                Incidente
              </p>
              <h3 className="mt-2 text-2xl font-black italic tracking-tight text-text">
                {report.userName || 'Usuario anonimo'}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-text-muted">
                <Store size={14} className="text-primary" />
                <span>{report.venueName || 'Establecimiento'}</span>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-primary/5 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                Descripcion del caso
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-text">
                "{report.description}"
              </p>
            </div>

            {report.adminNotes && (
              <div className="mt-5 rounded-[24px] border border-primary/10 bg-primary/6 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                  Resolucion administrativa
                </p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-text">
                  "{report.adminNotes}"
                </p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white p-4 shadow-[0_10px_26px_rgba(37,19,91,0.04)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Folio
                </p>
                <p className="mt-2 text-lg font-black italic text-text">
                  #{(report.billId || '').split('-').pop()}
                </p>
              </div>
              <div className="rounded-[22px] bg-white p-4 shadow-[0_10px_26px_rgba(37,19,91,0.04)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                  Tipo
                </p>
                <p className="mt-2 text-sm font-black italic text-primary">
                  {(report.type || 'general')
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate(`/bill/${report.billId}`)}
                className="secondary flex-1 !justify-center"
              >
                <Receipt size={16} /> Auditoria
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setEditingReport(report);
                      setAdminNote(report.adminNotes || '');
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary/5 text-primary"
                    title="Editar nota"
                  >
                    <MessageSquare size={18} />
                  </button>
                  {report.status === 'open' ? (
                    <button
                      onClick={() => handleResolve(report.id)}
                      className="primary flex-1 !justify-center !bg-emerald-600 hover:!bg-emerald-700"
                    >
                      <Check size={16} /> Resolver
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-rose-50 text-danger"
                      title="Eliminar registro"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </>
              )}
            </div>
          </article>
        ))}

        {filteredReports.length === 0 && (
          <div className="card col-span-full border-dashed border-primary/15 bg-primary/5 py-20 text-center">
            <CheckCircle size={54} className="mx-auto mb-5 text-success/35" />
            <p className="text-2xl font-black italic text-text">No hay incidentes reportados.</p>
            <p className="mt-3 text-sm font-medium text-text-muted">
              Cuando aparezcan casos nuevos los veras aqui sin perder legibilidad en movil.
            </p>
          </div>
        )}
      </section>

      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6">
          <div className="card w-full max-w-xl">
            <button
              onClick={() => setEditingReport(null)}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary/5 text-primary"
            >
              <X size={18} />
            </button>

            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                Resolucion interna
              </p>
              <h3 className="mt-2 text-3xl font-black italic tracking-tight text-text">
                Nota administrativa
              </h3>
              <p className="mt-2 text-sm font-medium text-text-muted">
                Agrega observaciones para el seguimiento del caso.
              </p>
            </div>

            <textarea
              className="input-premium min-h-[180px] resize-none"
              placeholder="Ej: se hablo con el staff y se dara seguimiento en la siguiente visita..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />

            <button onClick={handleSaveNote} className="primary mt-6 w-full">
              Guardar observacion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
