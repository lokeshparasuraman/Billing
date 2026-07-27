import React, { useEffect, useState } from 'react';
import { fetchInvoices, fetchInvoiceById } from '../services/api';
import { SavedInvoice } from '../types/billing';
import { formatCurrency } from '../utils/calculations';
import { Search, FileText, Eye } from 'lucide-react';
import { A4InvoicePreviewModal } from '../components/print/A4InvoicePreviewModal';

export const InvoiceHistoryPage: React.FC = () => {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<SavedInvoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const list = await fetchInvoices();
      setInvoices(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInvoice = async (id: string) => {
    try {
      const full = await fetchInvoiceById(id);
      setSelectedInvoice(full);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      (inv.customerPhone && inv.customerPhone.includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="h-6 w-6 text-sky-600 dark:text-sky-400" /> Invoice History Registry
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              View, search, and preview previous B&W A4 commercial tax invoices.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Inv No, Customer..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
        </div>

        {/* Invoice List Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              Loading invoices registry...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No invoices found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 dark:bg-slate-950 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4 text-center">Payment Mode</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-sky-700 dark:text-sky-400">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {new Date(inv.invoiceDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{inv.customerName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">
                          {inv.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sky-900 dark:text-sky-400 text-sm">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(inv.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition border border-sky-200 dark:border-sky-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>A4 Preview & Print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Interactive A4 Sheet Invoice Preview Modal */}
      <A4InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default InvoiceHistoryPage;
