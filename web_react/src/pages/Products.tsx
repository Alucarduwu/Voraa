import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types';
import {
  Coffee,
  Edit3,
  IceCream,
  Package,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Utensils,
} from 'lucide-react';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Cafe');

  const venueId = 'demo-venue-1';

  useEffect(() => {
    const unsubscribe = productService.subscribeToVenueProducts(venueId, setProducts);
    return () => unsubscribe();
  }, [venueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      price: Number.parseFloat(price),
      category,
      venueId,
    };

    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, data);
    } else {
      await productService.createProduct(data);
    }

    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCategory('Cafe');
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setShowModal(true);
  };

  const toggleStatus = async (product: Product) => {
    await productService.updateProduct(product.id, { active: !product.active });
  };

  const categories = ['Cafe', 'Frios', 'Comida', 'Postres', 'Te', 'Bebidas'];
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getIcon = (productCategory: string) => {
    if (productCategory === 'Cafe') return <Coffee size={20} />;
    if (productCategory === 'Comida') return <Utensils size={20} />;
    if (productCategory === 'Postres') return <IceCream size={20} />;
    return <Package size={20} />;
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="space-y-4">
          <span className="page-kicker">
            <Package size={14} /> Menu y cocina digital
          </span>
          <div className="space-y-3">
            <h1 className="page-title">Menu y productos</h1>
            <p className="page-copy">
              Gestiona los articulos del local con una vista clara para celular y escritorio.
              Ideal para barra, caja o administracion.
            </p>
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="primary w-full sm:w-auto">
          <Plus size={18} /> Agregar producto
        </button>
      </header>

      <section className="card p-0">
        <div className="flex flex-col gap-4 border-b border-primary/8 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
              Inventario visible
            </p>
            <h2 className="mt-2 text-2xl font-black italic tracking-tight text-text">
              Catalogo del local
            </h2>
          </div>

          <div className="relative w-full lg:w-[420px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o categoria..."
              className="input-premium pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead className="bg-primary/5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
              <tr>
                <th className="px-8 py-5">Producto</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5">Precio</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/6">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-primary/5">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
                        {getIcon(product.category)}
                      </div>
                      <div>
                        <p className="font-black italic text-text">{product.name}</p>
                        <p className="text-xs font-medium text-text-muted">{product.venueId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="badge badge-warning">{product.category.toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-6 text-lg font-black italic text-text">${product.price}</td>
                  <td className="px-8 py-6">
                    <button onClick={() => toggleStatus(product)} className="flex items-center gap-2">
                      {product.active ? (
                        <ToggleRight className="text-success" size={28} />
                      ) : (
                        <ToggleLeft className="text-text-muted" size={28} />
                      )}
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.18em] ${
                          product.active ? 'text-success' : 'text-text-muted'
                        }`}
                      >
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary/5 text-primary"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => productService.deleteProduct(product.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-rose-50 text-danger"
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

        <div className="grid gap-4 p-5 lg:hidden">
          {filteredProducts.map((product) => (
            <article key={product.id} className="rounded-[26px] border border-primary/8 bg-primary/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-primary shadow-sm">
                    {getIcon(product.category)}
                  </div>
                  <div>
                    <p className="text-lg font-black italic text-text">{product.name}</p>
                    <span className="mt-2 badge badge-warning">{product.category.toUpperCase()}</span>
                  </div>
                </div>
                <button onClick={() => openEdit(product)} className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-primary shadow-sm">
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[18px] bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Precio
                  </p>
                  <p className="mt-2 text-xl font-black italic text-text">${product.price}</p>
                </div>
                <div className="rounded-[18px] bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Estado
                  </p>
                  <button onClick={() => toggleStatus(product)} className="mt-2 flex items-center gap-2">
                    {product.active ? (
                      <ToggleRight className="text-success" size={24} />
                    ) : (
                      <ToggleLeft className="text-text-muted" size={24} />
                    )}
                    <span className={`text-xs font-black ${product.active ? 'text-success' : 'text-text-muted'}`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => openEdit(product)}
                  className="secondary flex-1 !justify-center !px-4 !py-3"
                >
                  Editar
                </button>
                <button
                  onClick={() => productService.deleteProduct(product.id)}
                  className="flex-1 rounded-[20px] bg-rose-50 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-danger"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6">
          <div className="card w-full max-w-xl">
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                Edicion de menu
              </p>
              <h3 className="mt-2 text-3xl font-black italic tracking-tight text-text">
                {editingProduct ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <p className="mt-2 text-sm font-medium text-text-muted">
                Define el articulo para que el staff pueda agregarlo rapido a la cuenta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="input-group">
                <label>Nombre del producto</label>
                <input
                  type="text"
                  required
                  className="input-premium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="input-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="input-premium"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Categoria</label>
                  <select
                    className="input-premium"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button type="button" onClick={closeModal} className="secondary w-full sm:flex-1">
                  Cancelar
                </button>
                <button type="submit" className="primary w-full sm:flex-1">
                  {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
