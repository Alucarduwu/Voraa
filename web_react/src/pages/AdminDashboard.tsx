import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users,
  Store,
  Zap,
  ShieldCheck,
  Search,
  Trash2,
  Edit3,
  ArrowRight,
  ChevronRight,
  Calendar,
  Receipt,
  ArrowUpRight,
  Heart
} from 'lucide-react';
import type { UserProfile, Venue, Coupon, ActiveBill, Report } from '../types';

interface AdminDashboardProps {
  activeTab?: 'overview' | 'users' | 'venues' | 'coupons';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab = 'overview' }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [bills, setBills] = useState<ActiveBill[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile)));
    });
    const unsubVenues = onSnapshot(collection(db, 'venues'), (snap) => {
      setVenues(snap.docs.map(d => ({ ...d.data(), id: d.id } as Venue)));
    });
    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snap) => {
      setCoupons(snap.docs.map(d => ({ ...d.data(), id: d.id } as Coupon)));
    });
    const unsubBills = onSnapshot(collection(db, 'activeBills'), (snap) => {
      setBills(snap.docs.map(d => ({ ...d.data(), id: d.id } as ActiveBill)));
    });
    const unsubReps = onSnapshot(collection(db, 'reports'), (snap) => {
      setReports(snap.docs.map(d => ({ ...d.data(), id: d.id } as Report)));
    });

    return () => {
      unsubUsers(); unsubVenues(); unsubCoupons(); unsubBills(); unsubReps();
    };
  }, []);

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm('¿Eliminar este usuario permanentemente?')) {
      await deleteDoc(doc(db, 'users', uid));
    }
  };

  const handleToggleVenue = async (id: string, active: boolean) => {
    await updateDoc(doc(db, 'venues', id), { active });
  };

  const renderOverview = () => (
    <div className="page-enter space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="stat-card group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
            <ArrowUpRight className="text-success opacity-0 group-hover:opacity-100 transition-all" size={20} />
          </div>
          <p className="stat-label">Ahorro en Red</p>
          <p className="stat-value text-primary">${bills.reduce((acc, b) => acc + (b.savings || 0), 0).toLocaleString()}</p>
        </div>

        <div className="stat-card group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-success/10 text-success rounded-2xl flex items-center justify-center">
              <Zap size={28} />
            </div>
            <ArrowUpRight className="text-success opacity-0 group-hover:opacity-100 transition-all" size={20} />
          </div>
          <p className="stat-label">Redenciones</p>
          <p className="stat-value text-success">{bills.length}</p>
        </div>

        <div className="stat-card group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
          </div>
          <p className="stat-label">Usuarios Activos</p>
          <p className="stat-value text-orange-600">{users.length}</p>
        </div>

        <div className="stat-card group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-danger/10 text-danger rounded-2xl flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
          </div>
          <p className="stat-label">Tasa de Fricción</p>
          <p className="stat-value text-danger">
            {bills.length > 0 ? (reports.length / bills.length * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 card">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black italic tracking-tighter">KPIs de Inteligencia</h3>
            <button className="text-[10px] font-black uppercase text-primary tracking-widest border-b-2 border-primary/20 hover:border-primary transition-all pb-1">Ver Reporte Completo</button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[32px] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5 group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                  <Receipt size={20} />
                </div>
                <div>
                  <p className="font-black text-sm text-text">Ticket Promedio</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Global en Red</p>
                </div>
              </div>
              <span className="text-2xl font-black text-primary italic">${bills.length > 0 ? (bills.reduce((acc, b) => acc + b.finalTotal, 0) / bills.length).toFixed(0) : 0}</span>
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[32px] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5 group">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-success group-hover:text-white transition-all">
                  <Heart size={20} />
                </div>
                <div>
                  <p className="font-black text-sm text-text">Lealtad del Cliente</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Redenciones Totales</p>
                </div>
              </div>
              <span className="text-2xl font-black text-success italic">{(bills || []).filter(b => (b.appliedCoupons || []).length > 0).length} Redenciones</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F1A] rounded-[48px] p-10 flex flex-col relative overflow-hidden group shadow-[0_40px_80px_rgba(108,77,255,0.15)]">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center shadow-2xl shadow-primary/40 mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-tight italic">Estado Operativo Maestro</h3>
            <p className="text-gray-400 font-medium leading-relaxed mb-10">Infraestructura VORAA Cloud operando al 100%. Sincronización bidireccional estable entre React y Flutter.</p>
            <div className="flex items-center gap-4 py-4 px-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
              <span className="text-xs font-black text-success uppercase tracking-[0.2em]">Sistemas Online</span>
            </div>
          </div>
          <Zap size={240} className="absolute -right-20 -bottom-20 text-white/[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="page-enter card p-0 overflow-hidden">
      <div className="p-10 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white">
        <div>
          <h3 className="text-3xl font-black italic tracking-tighter">Directorio de Usuarios</h3>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Gestión de Clientes y Staff de Red</p>
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o código..." 
            className="input-premium pl-16"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50/50">
              <th className="px-10 py-6">Usuario Maestro</th>
              <th className="px-10 py-6">Identificador / Rol</th>
              <th className="px-10 py-6">Nivel</th>
              <th className="px-10 py-6">Impacto Generado</th>
              <th className="px-10 py-6">Status Operativo</th>
              <th className="px-10 py-6 text-right">Comandos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.code.includes(searchTerm)).map(user => (
              <tr key={user.uid} className="hover:bg-gray-50/80 transition-all duration-300 group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 text-primary rounded-[20px] flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-110 transition-transform">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-lg italic text-text group-hover:text-primary transition-colors">{user.name}</p>
                      <p className="text-xs text-text-muted font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <p className="text-primary text-sm font-black tracking-[0.2em]">{user.code}</p>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{user.role}</span>
                </td>
                <td className="px-10 py-8">
                  <span className={`badge-premium ${user.frequentLevel === 'frequent' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                    {user.frequentLevel}
                  </span>
                </td>
                <td className="px-10 py-8">
                  <p className="font-black text-success text-lg italic">${(user.totalSavings || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{user.completedVisits || 0} visitas completadas</p>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-success rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">En Línea</span>
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end gap-3 opacity-100 transition-all duration-300">
                    <button
                      type="button"
                      aria-label={`Editar usuario ${user.name}`}
                      className="p-3 bg-white text-gray-400 hover:text-primary hover:shadow-xl rounded-2xl transition-all border border-gray-100"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Eliminar usuario ${user.name}`}
                      onClick={() => handleDeleteUser(user.uid)}
                      className="p-3 bg-white text-gray-400 hover:text-danger hover:shadow-xl rounded-2xl transition-all border border-gray-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVenues = () => (
    <div className="page-enter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {venues.map(venue => (
        <div key={venue.id} className="card group hover:border-primary/20 relative overflow-hidden">
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="w-20 h-20 bg-primary/5 text-primary rounded-[32px] flex items-center justify-center shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Store size={40} />
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`badge-premium px-5 py-2.5 ${venue.active ? 'bg-success text-white shadow-lg shadow-success/20' : 'bg-danger text-white'}`}>
                {venue.active ? 'OPERATIVO' : 'SUSPENDIDO'}
              </span>
              <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic">
                <Calendar size={12} />
                {venue.city}
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-black mb-1 italic tracking-tighter group-hover:text-primary transition-colors">{venue.name}</h3>
          <p className="text-xs text-text-muted font-bold uppercase tracking-[0.3em] mb-10 italic">{venue.type}</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-gray-50/50 p-6 rounded-[28px] border border-gray-50 transition-all group-hover:bg-white group-hover:shadow-lg group-hover:shadow-black/5">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Staff Activo</p>
              <p className="font-black text-2xl italic">{venue.ownerUid ? 1 : 0}</p>
            </div>
            <div className="bg-gray-50/50 p-6 rounded-[28px] border border-gray-50 transition-all group-hover:bg-white group-hover:shadow-lg group-hover:shadow-black/5">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Transacciones</p>
              <p className="font-black text-2xl italic">{(bills || []).filter(b => b.venueId === venue.id).length}</p>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <button 
              onClick={() => handleToggleVenue(venue.id, !venue.active)}
              className={`flex-1 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                venue.active ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white hover:shadow-xl hover:shadow-orange-600/20' : 'bg-success/10 text-success hover:bg-success hover:text-white'
              }`}
            >
              {venue.active ? 'Suspender Sucursal' : 'Activar Sucursal'}
            </button>
            <button className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
              Configuración
            </button>
          </div>
          <Store size={200} className="absolute -right-20 -bottom-20 text-text opacity-[0.02] rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>
      ))}
    </div>
  );

  const renderCouponsHierarchical = () => {
    if (selectedVenueId) {
      const venue = venues.find(v => v.id === selectedVenueId);
      const venueCoupons = coupons.filter(c => c.venueId === selectedVenueId);
      
      return (
        <div className="page-enter space-y-12">
          <button 
            onClick={() => setSelectedVenueId(null)}
            className="flex items-center gap-3 text-text-muted font-black uppercase text-[10px] tracking-[0.2em] hover:text-primary transition-all bg-white px-8 py-4 rounded-2xl shadow-xl shadow-black/5 border border-gray-50 group"
          >
            <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-2 transition-transform" /> Volver al Listado Maestro
          </button>

          <header>
            <div className="flex items-center gap-4 mb-3">
              <span className="w-12 h-1 bg-primary rounded-full"></span>
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Editor de Beneficios</span>
            </div>
            <h3 className="text-5xl font-black italic tracking-tighter mb-4">{venue?.name}</h3>
            <p className="text-text-muted font-medium text-lg italic">Optimizando la propuesta de valor para esta sucursal.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {venueCoupons.map(coupon => {
              const validUntil = coupon.validUntil?.toDate ? coupon.validUntil.toDate() : new Date();
              const validFrom = coupon.validFrom?.toDate ? coupon.validFrom.toDate() : new Date();
              const isExpired = validUntil < new Date();
              return (
                <div key={coupon.id} className="card p-0 overflow-hidden group hover:-translate-y-4 transition-all duration-500">
                  <div className="h-56 relative overflow-hidden">
                    <img src={coupon.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 transition-opacity ${isExpired ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">Ventana de Validez</p>
                      <div className="flex items-center gap-2 text-white font-black text-xs italic">
                        <Calendar size={14} className="text-primary" />
                        {validFrom.toLocaleDateString()} — {validUntil.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="absolute top-6 right-6">
                      <span className={`badge-premium px-6 py-3 shadow-2xl ${isExpired ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                        {isExpired ? 'EXPIRADO' : 'ACTIVO'}
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h4 className="font-black text-2xl mb-3 italic tracking-tight group-hover:text-primary transition-colors">{coupon.title}</h4>
                    <p className="text-sm text-text-muted font-medium mb-10 line-clamp-2 leading-relaxed">{coupon.description}</p>
                    <div className="flex justify-between items-center border-t border-gray-50 pt-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Beneficio</span>
                        <span className="text-3xl font-black text-primary italic leading-none">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : coupon.discountType === 'fixed'
                              ? `$${coupon.discountValue}`
                              : '2x1'}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button className="p-4 bg-gray-50 rounded-[20px] text-gray-400 hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"><Edit3 size={20} /></button>
                        <button className="p-4 bg-gray-50 rounded-[20px] text-gray-400 hover:bg-red-50 hover:text-danger hover:shadow-xl transition-all duration-300"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="page-enter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {venues.map(venue => (
          <div 
            key={venue.id} 
            className="card p-10 flex items-center justify-between cursor-pointer hover:border-primary transition-all duration-500 group relative overflow-hidden"
            onClick={() => setSelectedVenueId(venue.id)}
          >
            <div className="flex items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-[28px] flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:shadow-2xl group-hover:shadow-primary/30 transition-all duration-500 group-hover:rotate-6">
                <Store size={40} />
              </div>
              <div>
                <h4 className="text-3xl font-black italic mb-2 tracking-tighter group-hover:text-primary transition-colors">{venue.name}</h4>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic">
                    {coupons.filter(c => c.venueId === venue.id).length} Cupones Activos
                  </p>
                </div>
              </div>
            </div>
            <ChevronRight className="text-gray-200 group-hover:text-primary transition-all group-hover:translate-x-4 duration-500" size={40} />
            <div className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors"></div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-16 pb-32">
      <header className="page-enter flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <div className="flex items-center gap-4 mb-4 text-primary">
            <div className="w-12 h-0.5 bg-primary rounded-full"></div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">Centro de Control Maestro</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter italic text-text leading-none">
            {activeTab === 'overview' && 'Inteligencia de Red'}
            {activeTab === 'users' && 'Gestión de Usuarios'}
            {activeTab === 'venues' && 'Red de Restaurantes'}
            {activeTab === 'coupons' && 'Gestión de Beneficios'}
          </h1>
        </div>
        <div className="flex gap-4">
          {activeTab === 'venues' && <button className="primary shadow-2xl">AGREGAR SUCURSAL</button>}
          {activeTab === 'users' && <button className="secondary">EXPORTAR INTELIGENCIA</button>}
        </div>
      </header>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'venues' && renderVenues()}
      {activeTab === 'coupons' && renderCouponsHierarchical()}
    </div>
  );
};

export default AdminDashboard;
