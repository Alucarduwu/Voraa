import React, { useCallback, useEffect, useRef, useState } from 'react';
import { scannerService } from '../services/scannerService';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanType, Html5QrcodeScanner } from 'html5-qrcode';
import {
  AlertCircle,
  CheckCircle,
  Camera,
  Loader2,
  QrCode,
  ScanLine,
  Search,
  Ticket,
  User,
} from 'lucide-react';
import type { Coupon, UserProfile } from '../types';

const venueId = 'demo-venue-1';
const venueName = 'Cafe Central';
const qrReaderId = 'voraa-qr-reader';

const extractCodeFromScan = (rawValue: string) => {
  const value = rawValue.trim();

  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed === 'string') return parsed.trim();
    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>;
      const candidate = record.code ?? record.userCode ?? record.userId;
      if (typeof candidate === 'string') return candidate.trim();
    }
  } catch {
    // QR actuales de la app movil guardan el codigo plano.
  }

  try {
    const url = new URL(value);
    const candidate = url.searchParams.get('code') ?? url.searchParams.get('userCode');
    if (candidate) return candidate.trim();
  } catch {
    // Si no es URL, se usa tal cual.
  }

  return value;
};

const Scanner: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [activeCoupons, setActiveCoupons] = useState<{ savedId: string; coupon: Coupon }[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const handledScanRef = useRef(false);

  const navigate = useNavigate();

  const validateCode = useCallback(async (rawCode: string) => {
    const normalizedCode = extractCodeFromScan(rawCode).toUpperCase();
    if (!normalizedCode) return;

    setCode(normalizedCode);
    setIsLoading(true);
    setError(null);
    setFoundUser(null);
    setActiveCoupons([]);

    try {
      const user = await scannerService.findUserByCode(normalizedCode);
      if (user) {
        setFoundUser(user);
        const coupons = await scannerService.getActiveCoupons(user.uid, venueId);
        setActiveCoupons(coupons);
      } else {
        setError('Usuario no encontrado. Verifica el codigo e intenta de nuevo.');
      }
    } catch {
      setError('Ocurrio un error al buscar al usuario.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cameraOpen) return;

    handledScanRef.current = false;

    const scanner = new Html5QrcodeScanner(
      qrReaderId,
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false,
    );

    scanner.render(
      (decodedText) => {
        if (handledScanRef.current) return;
        handledScanRef.current = true;
        void validateCode(decodedText);
        void scanner.clear().catch(() => undefined);
        setCameraOpen(false);
      },
      () => undefined,
    );

    return () => {
      void scanner.clear().catch(() => undefined);
    };
  }, [cameraOpen, validateCode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateCode(code);
  };

  const handleOpenAccount = async () => {
    if (!foundUser) return;

    setIsLoading(true);
    try {
      const billId = await scannerService.openBill(
        foundUser,
        { id: venueId, name: venueName },
        activeCoupons,
      );
      navigate(`/bill/${billId}`);
    } catch {
      setError('No se pudo abrir la cuenta.');
      setIsLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="space-y-4">
          <span className="page-kicker">
            <QrCode size={14} /> Recepcion de clientes
          </span>
          <div className="space-y-3">
            <h1 className="page-title">Escanear o validar un pase</h1>
            <p className="page-copy">
              Ingresa el codigo del cliente para abrir una cuenta activa, aplicar beneficios y
              mantener el flujo del servicio sin friccion.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="card bg-white/92">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">
                  Scanner QR
                </p>
                <h2 className="mt-2 text-3xl font-black italic tracking-tight text-text">
                  Leer pase del cliente
                </h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
                <QrCode size={24} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCameraOpen((value) => !value)}
              className="secondary mb-5 w-full py-4 text-sm"
            >
              <Camera size={18} />
              {cameraOpen ? 'Cerrar camara' : 'Escanear QR con camara'}
            </button>

            {cameraOpen && (
              <div className="mb-5 overflow-hidden rounded-[24px] border border-primary/10 bg-white p-3">
                <div id={qrReaderId} className="min-h-[280px]" />
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-5">
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: USR-001"
                  className="input-premium pl-14 uppercase tracking-[0.2em]"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="primary w-full py-5 text-base" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <ScanLine size={18} />}
                {isLoading ? 'Buscando...' : 'Validar pase'}
              </button>
            </form>

            {error && (
              <div className="animate-shake mt-6 rounded-[24px] border border-rose-100 bg-rose-50 p-4 text-danger">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-bold leading-relaxed">{error}</p>
                </div>
              </div>
            )}
          </section>

          <section className="card bg-primary/5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">
              Instrucciones
            </p>
            <div className="mt-5 space-y-4">
              {[
                'El cliente muestra su QR o su codigo alfanumerico.',
                'Al validarlo se muestran los cupones activos para este restaurante.',
                'Si todo esta listo, se abre la cuenta con esos beneficios.',
              ].map((step, index) => (
                <div key={step} className="flex gap-3 rounded-[22px] bg-white/75 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-relaxed text-text">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="card overflow-hidden bg-white/94">
          {foundUser ? (
            <div className="flex h-full flex-col">
              <div className="rounded-[28px] bg-gradient-to-br from-primary to-primary-dark p-6 text-white sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/18 text-2xl font-black">
                      {foundUser.name[0]}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
                        Cliente validado
                      </p>
                      <h3 className="mt-2 text-3xl font-black italic tracking-tight">
                        {foundUser.name}
                      </h3>
                    <p className="mt-2 text-sm font-semibold text-white/75">
                        {foundUser.code} · {foundUser.frequentLevel} member
                      </p>
                    </div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/10 text-white/75">
                    <User size={30} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex-1 space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">
                      Cupones activos
                    </p>
                    <h4 className="mt-2 text-2xl font-black italic tracking-tight text-text">
                      Listos para esta cuenta
                    </h4>
                  </div>
                  <span className="badge badge-success w-fit">{activeCoupons.length} activos</span>
                </div>

                {activeCoupons.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeCoupons.map(({ savedId, coupon }) => (
                      <div
                        key={savedId}
                        className="rounded-[26px] border border-primary/8 bg-primary/5 p-5 transition-all duration-300 hover:border-primary/18 hover:bg-white hover:shadow-[0_18px_36px_rgba(108,77,255,0.08)]"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-primary shadow-sm">
                            <Ticket size={22} />
                          </div>
                          <CheckCircle size={22} className="text-success" />
                        </div>
                        <p className="text-lg font-black italic text-text">{coupon.title}</p>
                        <p className="mt-2 text-sm font-medium text-text-muted">
                          {coupon.description}
                        </p>
                        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% off`
                            : coupon.discountType === 'fixed'
                              ? `$${coupon.discountValue} desc`
                              : '2x1'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-dashed border-primary/15 bg-primary/5 px-6 py-12 text-center">
                    <AlertCircle size={42} className="mx-auto mb-4 text-primary/35" />
                    <p className="text-xl font-black italic text-text">
                      El cliente no tiene cupones activos.
                    </p>
                    <p className="mt-2 text-sm font-medium text-text-muted">
                      Puede abrirse la cuenta igual, pero no se aplicaran beneficios.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleOpenAccount}
                  className="primary mt-2 w-full py-5 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
                  Abrir cuenta y redimir
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-primary/15 bg-primary/5 px-6 py-12 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[30px] bg-white text-primary shadow-[0_18px_36px_rgba(108,77,255,0.1)]">
                <QrCode size={46} />
              </div>
              <h3 className="text-3xl font-black italic tracking-tight text-text">
                Esperando validacion
              </h3>
              <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-text-muted">
                Cuando ingreses el codigo del cliente aqui apareceran su perfil, nivel de
                frecuencia y cupones listos para usar.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Scanner;
