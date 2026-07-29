import React, { useEffect, useState } from 'react';
import { fetchProducts, createProduct, deleteProduct } from '../services/api';
import { Product } from '../types/billing';
import { sanitizePriceInput, handlePriceKeyDown } from '../utils/calculations';
import { Package, Search, Plus, X, Trash2 } from 'lucide-react';
import { useThemeMode } from '../context/ThemeContext';

export const ProductCatalogPage: React.FC = () => {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  /* Theme tokens matching home page card design */
  const cardBg     = isDark ? '#0a2421' : '#f1f5f9';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const cardDivide = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textStrong = isDark ? '#ffffff' : '#051c1a';
  const textMuted  = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(5,28,26,0.60)';
  const inputBg    = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputBorder= isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const accentText = isDark ? '#c9f227' : '#15803d';

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New product form state
  const [newProd, setNewProd] = useState({
    partNumber: '',
    name: '',
    hsn: '',
    gst: 18,
    price: '',
    stock: 100,
  });

  const resetForm = () => {
    setNewProd({
      partNumber: '',
      name: '',
      hsn: '',
      gst: 18,
      price: '',
      stock: 100,
    });
    setFormError(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setIsLoading(true);
    try {
      const list = await fetchProducts();
      setProducts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete product '${name}' from catalog?`
    );
    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      loadCatalog();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newProd.partNumber || !newProd.name || !newProd.hsn || !newProd.price) {
      setFormError('Please fill all mandatory fields (Part #, Name, HSN, Price).');
      return;
    }

    try {
      await createProduct({
        partNumber: newProd.partNumber.trim().toUpperCase(),
        name: newProd.name.trim(),
        hsn: newProd.hsn.trim(),
        gst: Number(newProd.gst),
        price: Number(newProd.price),
        unit: 'PCS',
        stock: Number(newProd.stock || 100),
      });

      setIsAddModalOpen(false);
      resetForm();
      loadCatalog();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.error || 'Failed to create product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      p.partNumber.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.hsn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen pb-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Page Header Card */}
        <div
          className="rounded-2xl p-6 sm:p-7 mb-6 flex flex-wrap items-center justify-between gap-6 transition-all"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3" style={{ color: textStrong }}>
              <Package className="h-7 w-7" style={{ color: accentText }} /> Product & Service Catalog
            </h1>
            <p className="text-xs sm:text-sm font-semibold mt-1.5" style={{ color: textMuted }}>
              Manage your custom products, parts, services, prices, HSN codes, and GST rates ({products.length} Items).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3.5 top-3.5" style={{ color: textMuted }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search part # or name..."
                style={{
                  background: inputBg,
                  color: textStrong,
                  border: `1px solid ${inputBorder}`,
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9f227] transition"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-black flex items-center justify-center space-x-2 active:scale-[0.98] transition-all flex-shrink-0 border-0 shadow-sm"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Product Catalog — table on md+, cards on mobile */}
        <div
          className="rounded-2xl shadow-sm overflow-hidden transition-all"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          {isLoading ? (
            <div className="p-16 text-center text-base sm:text-lg font-bold" style={{ color: textMuted }}>
              Loading product database...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center text-base sm:text-lg font-semibold" style={{ color: textMuted }}>
              No products found in catalog. Click <strong className="font-extrabold underline decoration-2 underline-offset-4" style={{ color: accentText }}>"Add New Product"</strong> to populate your store inventory.
            </div>
          ) : (
            <>
              {/* ── Desktop table (md and above) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: isDark ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)', borderBottom: `1px solid ${cardDivide}` }}>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: textMuted }}>Part Number</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: textMuted }}>Product Name</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-center" style={{ color: textMuted }}>HSN Code</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-center" style={{ color: textMuted }}>GST Rate</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-right" style={{ color: textMuted }}>Selling Price</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-center w-20" style={{ color: textMuted }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm">
                    {filteredProducts.map((p) => (
                      <tr
                        key={p.id}
                        style={{ borderBottom: `1px solid ${cardDivide}` }}
                        className="transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                      >
                        <td className="py-3.5 px-5 font-mono font-bold" style={{ color: textStrong }}>{p.partNumber}</td>
                        <td className="py-3.5 px-5 font-semibold" style={{ color: textStrong }}>{p.name}</td>
                        <td className="py-3.5 px-5 text-center font-mono" style={{ color: textMuted }}>{p.hsn}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg border" style={{ background: inputBg, color: textStrong, borderColor: inputBorder }}>
                            {p.gst}%
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-black text-sm" style={{ color: textStrong }}>
                          ₹{p.price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                            title={`Delete ${p.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile card list (below md) ── */}
              <div className="md:hidden divide-y" style={{ borderColor: cardDivide }}>
                {filteredProducts.map((p) => (
                  <div key={p.id} className="p-4 space-y-2.5">
                    {/* Top row: Part number + price */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono font-black text-sm" style={{ color: textStrong }}>{p.partNumber}</span>
                      <span className="font-mono font-black text-base shrink-0" style={{ color: textStrong }}>₹{p.price.toFixed(2)}</span>
                    </div>

                    {/* Product name */}
                    <p className="font-semibold text-sm leading-snug" style={{ color: textStrong }}>{p.name}</p>

                    {/* Meta row: HSN + GST + Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase" style={{ color: textMuted }}>HSN:</span>
                        <span className="font-mono text-xs font-bold" style={{ color: textStrong }}>{p.hsn}</span>
                        <span
                          className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border"
                          style={{ background: inputBg, color: textStrong, borderColor: inputBorder }}
                        >
                          GST {p.gst}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border border-rose-200/40 dark:border-rose-800/40 shrink-0"
                        title={`Delete ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between shrink-0"
              style={{ borderBottom: `1px solid ${cardDivide}` }}
            >
              <span className="font-extrabold text-base tracking-wide" style={{ color: textStrong }}>
                Add Product to Catalog
              </span>
              <button onClick={handleCloseAddModal} style={{ color: textMuted }} className="hover:opacity-80 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto">
              {formError && (
                <div className="bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 p-3 rounded-xl border border-rose-200 dark:border-rose-800 font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1 text-[11px]" style={{ color: textMuted }}>Part Number *</label>
                  <input
                    type="text"
                    required
                    value={newProd.partNumber}
                    onChange={(e) => setNewProd({ ...newProd, partNumber: e.target.value })}
                    placeholder="e.g. HW-BOLT-M12"
                    style={{ background: inputBg, color: textStrong, border: `1px solid ${inputBorder}` }}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1 text-[11px]" style={{ color: textMuted }}>HSN Code *</label>
                  <input
                    type="text"
                    required
                    value={newProd.hsn}
                    onChange={(e) => setNewProd({ ...newProd, hsn: e.target.value })}
                    placeholder="e.g. 7318"
                    style={{ background: inputBg, color: textStrong, border: `1px solid ${inputBorder}` }}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1 text-[11px]" style={{ color: textMuted }}>Product Description Name *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Hex Bolt M12 x 50mm Stainless Steel"
                  style={{ background: inputBg, color: textStrong, border: `1px solid ${inputBorder}` }}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1 text-[11px]" style={{ color: textMuted }}>Price (₹) *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={newProd.price}
                    onKeyDown={handlePriceKeyDown}
                    onChange={(e) => {
                      const clean = sanitizePriceInput(e.target.value);
                      setNewProd({ ...newProd, price: clean });
                    }}
                    placeholder="0.00"
                    style={{ background: inputBg, color: textStrong, border: `1px solid ${inputBorder}` }}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1 text-[11px]" style={{ color: textMuted }}>GST %</label>
                  <select
                    value={newProd.gst}
                    onChange={(e) => setNewProd({ ...newProd, gst: Number(e.target.value) })}
                    style={{ background: inputBg, color: textStrong, border: `1px solid ${inputBorder}` }}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none font-mono"
                  >
                    <option value={0} style={{ background: cardBg, color: textStrong }}>0%</option>
                    <option value={5} style={{ background: cardBg, color: textStrong }}>5%</option>
                    <option value={12} style={{ background: cardBg, color: textStrong }}>12%</option>
                    <option value={18} style={{ background: cardBg, color: textStrong }}>18%</option>
                    <option value={28} style={{ background: cardBg, color: textStrong }}>28%</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3" style={{ borderTop: `1px solid ${cardDivide}` }}>
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  style={{ background: inputBg, color: textMuted, border: `1px solid ${inputBorder}` }}
                  className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition hover:opacity-80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
                  className="px-5 py-2 rounded-full font-black text-xs sm:text-sm transition-all border-0 shadow-sm active:scale-[0.98]"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogPage;
