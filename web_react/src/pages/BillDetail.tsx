import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { billService } from '../services/billService';
import { productService } from '../services/productService';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Minus,
  Package,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import type { ActiveBill, BillItem, Product } from '../types';

const BillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  const [bill, setBill] = useState<ActiveBill | null>(null);
  const [venueProducts, setVenueProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      doc(db, 'activeBills', id),
      (billDoc) => {
        if (billDoc.exists()) {
          setBill({ ...billDoc.data(), id: billDoc.id } as ActiveBill);
          setLoading(false);
        } else {
          navigate(isAdmin ? '/reports' : '/bills');
        }
      },
      (error) => {
        console.error('Error fetching bill:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [id, navigate, isAdmin]);

  useEffect(() => {
    if (bill?.venueId) {
      const unsubscribe = productService.subscribeToVenueProducts(bill.venueId, setVenueProducts);
      return () => unsubscribe();
    }
  }, [bill?.venueId]);

  const handleAddProduct = async (product: Product) => {
    if (!bill) return;
    const newItem: BillItem = {
      productId: product.id,
      name: product.name,
      quantity: 1,
      price: product.price,
      total: product.price,
    };
    await billService.addItem(bill.id, bill, newItem);
    setShowProductPicker(false);
  };

  const handleUpdateQty = async (productId: string, delta: number) => {
    if (!bill) return;
    await billService.updateQuantity(bill.id, bill, productId, delta);
  };

  const handleCloseBill = async (positive: boolean) => {
    if (!bill) return;
    if (
      window.confirm(
        positive
          ? 'Cerrar cuenta y enviarla al cliente para confirmacion?'
          : 'Reportar un problema con esta cuenta?',
      )
    ) {
      await billService.closeBill(bill.id, positive);
      navigate(isAdmin ? '/reports' : '/bills');
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary/10 text-primary">
            <Receipt size={34} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">
            Sincronizando auditoria
          </p>
          <p className="mt-3 text-lg font-black italic text-text">Cargando detalle de la cuenta...</p>
        </div>
      </div>
    );
  }

  if (!bill) return <div className="page-shell">No se encontro la cuenta.</div>;

  const visibleProducts = venueProducts.filter(
    (product) => product.active && product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const closeActions =
    bill.status === 'open' ? (
      <>
        <button
          onClick={() => handleCloseBill(false)}
          className="rounded-[22px] bg-rose-50 px-4 py-5 text-sm font-black uppercase tracking-[0.18em] text-danger"
        >
          Reportar
        </button>
        <button
          onClick={() => handleCloseBill(true)}
          className="rounded-[22px] bg-emerald-600 px-4 py-5 text-sm font-black uppercase tracking-[0.18em] text-white"
        >
          Finalizar
        </button>
      </>
    ) : null;

  return (
    <div className="page-shell pb-32 xl:pb-10">
      <header className="page-header">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-primary/10 bg-white text-primary shadow-[0_14px_30px_rgba(37,19,91,0.05)]"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="space-y-3">
            <span className="page-kicker">
              <Receipt size={14} /> Auditoria en tiempo real
            </span>
            <div>
              <h1 className="page-title !text-4xl sm:!text-5xl">
                Cuenta #{bill.id.split('_').pop()}
              </h1>
              <p className="page-copy">
                Revisando la cuenta de <strong>{bill.userName}</strong> en {bill.venueName}.
              </p>
            </div>
          </div>
        </div>

        <div className="panel-shell w-full sm:w-auto">
          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                Estado
              </p>
              <span className={`mt-3 ${bill.status === 'open' ? 'badge badge-warning' : 'badge badge-success'}`}>
                {bill.status === 'reported' && !isAdmin ? 'closed' : bill.status.replaceAll('_', ' ')}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                Cliente
              </p>
              <p className="mt-3 text-lg font-black italic text-text">{bill.userName}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="card p-0">
            <div className="flex flex-col gap-4 border-b border-primary/8 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                  Consumo registrado
                </p>
                <h2 className="mt-2 text-2xl font-black italic tracking-tight text-text">
                  Productos consumidos
                </h2>
              </div>

              {bill.status === 'open' && (
                <button onClick={() => setShowProductPicker(true)} className="primary w-full sm:w-auto">
                  <Plus size={18} /> Agregar producto
                </button>
              )}
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {bill.items.length > 0 ? (
                bill.items.map((item) => (
                  <article
                    key={item.productId}
                    className="rounded-[28px] border border-primary/8 bg-primary/5 p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-primary shadow-sm">
                          <Package size={22} />
                        </div>
                        <div>
                          <p className="text-xl font-black italic text-text">{item.name}</p>
                          <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
                            Precio unitario ${item.price}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_auto] sm:items-center">
                        {bill.status === 'open' && (
                          <div className="flex items-center justify-between gap-3 rounded-[20px] bg-white p-2 shadow-sm sm:justify-start">
                            <button
                              onClick={() => handleUpdateQty(item.productId, -1)}
                              className="flex h-11 w-11 items-center justify-center rounded-[16px] text-text hover:bg-rose-50 hover:text-danger"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="min-w-[42px] text-center text-2xl font-black italic text-text">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(item.productId, 1)}
                              className="flex h-11 w-11 items-center justify-center rounded-[16px] text-text hover:bg-emerald-50 hover:text-success"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                              Total
                            </p>
                            <p className="mt-2 text-2xl font-black italic text-primary">
                              ${item.total}
                            </p>
                          </div>

                          {bill.status === 'open' && (
                            <button
                              onClick={() => handleUpdateQty(item.productId, -item.quantity)}
                              className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-rose-50 text-danger"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-primary/15 bg-primary/5 px-6 py-16 text-center">
                  <ShoppingCart size={46} className="mx-auto mb-4 text-primary/35" />
                  <p className="text-2xl font-black italic text-text">La cuenta esta vacia.</p>
                  <p className="mt-2 text-sm font-medium text-text-muted">
                    Agrega productos para empezar a construir el ticket.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card overflow-hidden bg-[#170f2e] text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/72">
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.24em]">
                    Beneficios aplicados
                  </span>
                </div>
                {bill.appliedCoupons.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {bill.appliedCoupons.map((coupon) => (
                      <div key={coupon.couponId} className="rounded-[24px] border border-white/8 bg-white/8 p-4">
                        <p className="text-lg font-black italic">{coupon.title}</p>
                        <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                          Ahorro aplicado: -${coupon.discountAmount.toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-white/72">
                    Aun no hay cupones activos en esta cuenta.
                  </p>
                )}
              </div>

              <div className="rounded-[26px] bg-white/8 p-5 text-center lg:min-w-[220px]">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
                  Impacto total
                </p>
                <p className="mt-3 text-5xl font-black italic text-emerald-300">
                  -${bill.discountTotal}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                  <TrendingUp size={12} /> Maximizando ahorro
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card xl:sticky xl:top-8">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
              Liquidacion
            </p>
            <h2 className="mt-2 text-3xl font-black italic tracking-tight text-text">
              Resumen final
            </h2>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between rounded-[22px] bg-primary/5 p-4">
                <span className="text-sm font-bold text-text-muted">Subtotal bruto</span>
                <span className="text-lg font-black italic text-text">${bill.originalTotal}</span>
              </div>
              <div className="flex items-center justify-between rounded-[22px] bg-emerald-50 p-4">
                <span className="text-sm font-bold text-success">Redenciones VORAA</span>
                <span className="text-lg font-black italic text-success">-${bill.discountTotal}</span>
              </div>
            </div>

            <div className="my-8 rounded-[28px] bg-gradient-to-br from-primary/10 to-primary/5 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                Total a liquidar
              </p>
              <p className="mt-3 text-5xl font-black italic tracking-tight text-primary sm:text-6xl">
                ${bill.finalTotal}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                <Sparkles size={12} /> Ahorro del cliente: ${bill.savings}
              </div>
            </div>

            <div className="rounded-[26px] border border-primary/10 bg-white p-5 shadow-[0_12px_30px_rgba(37,19,91,0.04)]">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-text-muted">
                Propina sugerida sobre bruto
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-[18px] bg-primary/5 p-3">
                  <p className="text-[10px] font-black text-text-muted">10%</p>
                  <p className="mt-2 text-lg font-black italic text-text">
                    ${bill.suggestedTip10.toFixed(0)}
                  </p>
                </div>
                <div className="rounded-[18px] bg-primary text-white p-3">
                  <p className="text-[10px] font-black text-white/70">12%</p>
                  <p className="mt-2 text-lg font-black italic">
                    ${bill.suggestedTip12.toFixed(0)}
                  </p>
                </div>
                <div className="rounded-[18px] bg-primary/5 p-3">
                  <p className="text-[10px] font-black text-text-muted">15%</p>
                  <p className="mt-2 text-lg font-black italic text-text">
                    ${bill.suggestedTip15.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-sm font-medium leading-relaxed text-primary/80">
                  La propina se calcula sobre el total original para proteger el ingreso del
                  personal de servicio.
                </p>
              </div>
            </div>

            {closeActions && <div className="mt-8 hidden grid-cols-1 gap-3 sm:grid-cols-2 xl:grid">{closeActions}</div>}
          </div>
        </aside>
      </div>

      {closeActions && (
        <div className="fixed inset-x-4 bottom-4 z-40 xl:hidden">
          <div className="rounded-[28px] border border-white/80 bg-white/95 p-3 shadow-[0_20px_40px_rgba(37,19,91,0.12)] backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between gap-3 px-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                  Accion rapida
                </p>
                <p className="text-sm font-bold text-text">Cerrar o reportar esta cuenta</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                <CheckCircle size={18} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">{closeActions}</div>
          </div>
        </div>
      )}

      {showProductPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6">
          <div className="card flex max-h-[88vh] w-full max-w-4xl flex-col">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                  Inventario local
                </p>
                <h3 className="mt-2 text-3xl font-black italic tracking-tight text-text">
                  Seleccionar articulo
                </h3>
                <p className="mt-2 text-sm font-medium text-text-muted">
                  Agrega productos del menu a la cuenta actual.
                </p>
              </div>

              <button
                onClick={() => setShowProductPicker(false)}
                className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary/5 text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Buscar en el catalogo digital..."
                className="input-premium pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="custom-scrollbar grid max-h-[55vh] gap-4 overflow-y-auto pr-1">
              {visibleProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className="flex w-full flex-col gap-4 rounded-[24px] border border-primary/8 bg-primary/5 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/18 hover:bg-white hover:shadow-[0_18px_36px_rgba(108,77,255,0.08)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-primary shadow-sm">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-lg font-black italic text-text">{product.name}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                        Categoria general
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="text-2xl font-black italic text-primary">${product.price}</span>
                    <ArrowRight size={18} className="text-primary" />
                  </div>
                </button>
              ))}

              {visibleProducts.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-primary/15 bg-primary/5 px-6 py-12 text-center">
                  <Package size={42} className="mx-auto mb-4 text-primary/35" />
                  <p className="text-xl font-black italic text-text">Sin coincidencias.</p>
                  <p className="mt-2 text-sm font-medium text-text-muted">
                    Ajusta la busqueda para encontrar articulos del menu.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillDetail;
