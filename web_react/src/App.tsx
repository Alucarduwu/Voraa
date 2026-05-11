import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import {
  AlertCircle,
  ChefHat,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Receipt,
  ShieldCheck,
  Store,
  Ticket,
  Users,
  UtensilsCrossed,
  X,
  Zap,
} from 'lucide-react';
import RestaurantDashboard from './pages/RestaurantDashboard';
import Scanner from './pages/Scanner';
import AllBills from './pages/AllBills';
import BillDetail from './pages/BillDetail';
import Reports from './pages/Reports';
import Products from './pages/Products';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { seedFirestore } from './firebase/seedFirestore';

type Role = 'restaurant' | 'admin';

const getPageTitle = (pathname: string, role: Role) => {
  if (pathname.startsWith('/bill/')) return 'Cuenta en servicio';
  if (pathname === '/dashboard') return 'Panel del staff';
  if (pathname === '/scanner') return 'Recepcion de clientes';
  if (pathname === '/bills') return 'Cuentas activas';
  if (pathname === '/products') return 'Menu digital';
  if (pathname === '/reports') return role === 'admin' ? 'Incidentes y friccion' : 'Mis reportes';
  if (pathname === '/admin/users') return 'Usuarios';
  if (pathname === '/admin/venues') return 'Restaurantes';
  if (pathname === '/admin/coupons') return 'Beneficios';
  return role === 'admin' ? 'Inteligencia de red' : 'Operacion VORAA';
};

const SidebarLink = ({
  to,
  label,
  icon: Icon,
  onClick,
  end = false,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  end?: boolean;
}) => (
  <NavLink
    end={end}
    to={to}
    onClick={onClick}
    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
  >
    <Icon size={20} />
    <span className="flex-1">{label}</span>
  </NavLink>
);

const Sidebar = ({
  role,
  onLogout,
  isOpen,
  onClose,
}: {
  role: Role;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}) => (
  <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
    <div className="mb-10 flex items-center gap-4 px-1">
      <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_18px_36px_rgba(108,77,255,0.38)]">
        <ChefHat size={30} />
      </div>
      <div>
        <h1 className="text-2xl font-black italic tracking-tight text-white">VORAA</h1>
        <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/45">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]"></span>
          {role === 'admin' ? 'Control maestro' : 'Floor service'}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="ml-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 lg:hidden"
      >
        <X size={18} />
      </button>
    </div>

    <div className="mb-6 rounded-[28px] border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-primary">
        <UtensilsCrossed size={16} />
        <span className="text-[10px] font-black uppercase tracking-[0.25em]">
          Cocina + sala
        </span>
      </div>
      <p className="text-sm font-medium leading-relaxed text-white/70">
        Opera tickets, beneficios y friccion desde una sola vista con look premium de
        restaurante.
      </p>
    </div>

    <nav className="flex-1 space-y-2">
      <p className="mb-3 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/35">
        Navegacion
      </p>
      {role === 'restaurant' && (
        <>
          <SidebarLink to="/dashboard" label="Panel staff" icon={LayoutDashboard} onClick={onClose} />
          <SidebarLink to="/scanner" label="Escanear cliente" icon={QrCode} onClick={onClose} />
          <SidebarLink to="/bills" label="Cuentas activas" icon={Receipt} onClick={onClose} />
          <SidebarLink to="/products" label="Menu digital" icon={Database} onClick={onClose} />
          <SidebarLink to="/reports" label="Mis reportes" icon={AlertCircle} onClick={onClose} />
        </>
      )}

      {role === 'admin' && (
        <>
          <SidebarLink to="/admin" label="Global dashboard" icon={Zap} onClick={onClose} end />
          <SidebarLink to="/admin/users" label="Usuarios" icon={Users} onClick={onClose} />
          <SidebarLink to="/admin/venues" label="Restaurantes" icon={Store} onClick={onClose} />
          <SidebarLink to="/admin/coupons" label="Cupones globales" icon={Ticket} onClick={onClose} />
          <SidebarLink to="/reports" label="Gestion de friccion" icon={ShieldCheck} onClick={onClose} />
        </>
      )}
    </nav>

    <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
      <button
        onClick={seedFirestore}
        className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-white/10"
      >
        <Database size={14} /> Reset demo
      </button>

      <button
        onClick={onLogout}
        className="sidebar-link w-full justify-center border border-rose-400/10 bg-rose-400/5 text-rose-200 hover:bg-rose-400/10 hover:text-white"
      >
        <LogOut size={18} /> Cerrar sesion
      </button>
    </div>
  </aside>
);

const AppShell = ({ role, onLogout }: { role: Role; onLogout: () => void }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <Sidebar
        role={role}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <header className="mobile-topbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
              <ChefHat size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                {role === 'admin' ? 'Admin VORAA' : 'Staff VORAA'}
              </p>
              <p className="truncate text-sm font-bold text-text">
                {getPageTitle(location.pathname, role)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary/10 bg-primary/5 text-primary"
          >
            <Menu size={20} />
          </button>
        </header>

        <div className="pointer-events-none absolute inset-x-4 top-0 h-48 rounded-b-[48px] bg-[radial-gradient(circle_at_top_left,rgba(108,77,255,0.16),transparent_45%),radial-gradient(circle_at_top_right,rgba(183,157,255,0.14),transparent_42%)] sm:inset-x-6 lg:inset-x-8 xl:inset-x-10"></div>

        <div className="content-shell">
          <Routes>
            <Route path="/" element={<Navigate to={role === 'admin' ? '/admin' : '/dashboard'} />} />
            <Route path="/dashboard" element={<RestaurantDashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/bills" element={<AllBills />} />
            <Route path="/bill/:id" element={<BillDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard activeTab="users" />} />
            <Route path="/admin/venues" element={<AdminDashboard activeTab="venues" />} />
            <Route path="/admin/coupons" element={<AdminDashboard activeTab="coupons" />} />
            <Route path="*" element={<Navigate to={role === 'admin' ? '/admin' : '/dashboard'} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const getStoredRole = (): Role | null => {
    const storedRole = localStorage.getItem('userRole');
    return storedRole === 'restaurant' || storedRole === 'admin' ? storedRole : null;
  };

  const [role, setRole] = useState<Role | null>(() => getStoredRole());

  const handleLogin = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('userRole');
  };

  return (
    <Router>
      {!role ? (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <AppShell role={role} onLogout={handleLogout} />
      )}
    </Router>
  );
};

export default App;
