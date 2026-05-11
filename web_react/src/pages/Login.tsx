import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Lock, Sparkles, User, Zap } from 'lucide-react';

const Login: React.FC<{ onLogin: (role: 'restaurant' | 'admin') => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<'restaurant' | 'admin'>('restaurant');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role);
    navigate('/');
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,77,255,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(186,162,255,0.18),transparent_28%)]"></div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="card border-primary/10 bg-white/88 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3 text-primary">
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-primary text-white shadow-[0_18px_40px_rgba(108,77,255,0.35)]">
              <ChefHat size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/70">
                White + purple hospitality
              </p>
              <h1 className="text-3xl font-black italic tracking-tight text-text sm:text-4xl">
                Smart Redemption
              </h1>
            </div>
          </div>

          <div className="mb-8 max-w-xl space-y-4">
            <span className="page-kicker">
              <Sparkles size={14} /> Food service control
            </span>
            <h2 className="page-title !text-4xl sm:!text-5xl">
              Gestiona la experiencia del comensal desde una sola vista.
            </h2>
            <p className="page-copy">
              Una operacion premium para restaurantes: cuentas activas, cupones, friccion y
              seguimiento del servicio con una interfaz clara, luminosa y lista para movil.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Servicio', value: 'Tiempo real' },
              { label: 'Beneficios', value: 'Cupones vivos' },
              { label: 'Ambiente', value: 'Blanco + morado' },
            ].map((item) => (
              <div key={item.label} className="panel-shell">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/60">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-black italic text-text">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card mx-auto w-full max-w-xl border-primary/10 bg-white/94">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary/10 text-primary">
              <ChefHat size={28} />
            </div>
            <h3 className="text-3xl font-black italic tracking-tight text-text">Entrar al panel</h3>
            <p className="mt-2 text-sm font-medium text-text-muted">
              Elige el contexto de acceso para continuar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="input-group">
              <label>Tipo de cuenta</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole('restaurant')}
                  className={`flex items-center justify-center gap-2 rounded-[22px] border px-4 py-4 text-sm font-black transition-all ${
                    role === 'restaurant'
                      ? 'border-primary/20 bg-primary text-white shadow-[0_16px_30px_rgba(108,77,255,0.28)]'
                      : 'border-primary/10 bg-primary/5 text-primary'
                  }`}
                >
                  <Zap size={16} /> Restaurante
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 rounded-[22px] border px-4 py-4 text-sm font-black transition-all ${
                    role === 'admin'
                      ? 'border-primary/20 bg-primary text-white shadow-[0_16px_30px_rgba(108,77,255,0.28)]'
                      : 'border-primary/10 bg-primary/5 text-primary'
                  }`}
                >
                  <Lock size={16} /> Admin
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Usuario</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  defaultValue="staff_central"
                  className="input-premium pl-12"
                />
              </div>
            </div>

            <button type="submit" className="primary w-full py-5 text-base">
              Entrar al panel
            </button>
          </form>

          <p className="mt-8 text-center text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
            Sistema de redencion segura · 2026
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
