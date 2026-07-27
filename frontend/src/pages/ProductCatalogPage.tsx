import React, { useEffect, useState } from 'react';
import { fetchProducts, createProduct } from '../services/api';
import { Product } from '../types/billing';
import { Package, Search, Plus, X } from 'lucide-react';

export const ProductCatalogPage: React.FC = () => {
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
    unit: '',
    stock: 100,
  });

  const resetForm = () => {
    setNewProd({
      partNumber: '',
      name: '',
      hsn: '',
      gst: 18,
      price: '',
      unit: '',
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
        unit: newProd.unit.trim() ? newProd.unit.trim().toUpperCase() : 'PCS',
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="h-6 w-6 text-sky-600 dark:text-sky-400" /> Product & Service Catalog
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your custom products, parts, services, prices, HSN/SAC codes, and GST rates ({products.length} Items).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search part # or name..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              Loading product database...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No products found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 dark:bg-slate-950 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Part Number</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-center">HSN Code</th>
                    <th className="py-3 px-4 text-center">Unit</th>
                    <th className="py-3 px-4 text-center">GST Rate</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-sky-700 dark:text-sky-400">{p.partNumber}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">{p.name}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">{p.hsn}</td>
                      <td className="py-2.5 px-4 text-center uppercase font-bold text-[10px] text-slate-500 dark:text-slate-400">{p.unit}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                          {p.gst}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ₹{p.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-800 dark:bg-slate-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <span className="font-bold text-base tracking-wide">Add Product to Catalog</span>
              <button onClick={handleCloseAddModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              {formError && (
                <div className="bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 p-3 rounded-lg border border-rose-200 dark:border-rose-800 font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Part Number *</label>
                  <input
                    type="text"
                    required
                    value={newProd.partNumber}
                    onChange={(e) => setNewProd({ ...newProd, partNumber: e.target.value })}
                    placeholder="e.g. HW-BOLT-M12"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-sky-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">HSN Code *</label>
                  <input
                    type="text"
                    required
                    value={newProd.hsn}
                    onChange={(e) => setNewProd({ ...newProd, hsn: e.target.value })}
                    placeholder="e.g. 7318"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Product Description Name *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Hex Bolt M12 x 50mm Stainless Steel"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">GST %</label>
                  <select
                    value={newProd.gst}
                    onChange={(e) => setNewProd({ ...newProd, gst: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    placeholder="PCS, MTR..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-sky-500 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-extrabold text-white bg-sky-600 hover:bg-sky-500 shadow"
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
