import React, { useEffect, useState, useRef } from 'react';
import { fetchInvoices, fetchInvoiceById, deleteInvoice } from '../services/api';
import { SavedInvoice } from '../types/billing';
import { formatCurrency } from '../utils/calculations';
import { Search, FileText, Eye, Trash2, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { A4InvoicePreviewModal } from '../components/print/A4InvoicePreviewModal';
import { useThemeMode } from '../context/ThemeContext';

export const InvoiceHistoryPage: React.FC = () => {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  /* Theme tokens matching home page card design */
  const cardBg     = isDark ? '#0a2421' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const cardDivide = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textStrong = isDark ? '#ffffff' : '#051c1a';
  const textMuted  = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(5,28,26,0.60)';
  const inputBg    = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputBorder= isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const accentText = isDark ? '#c9f227' : '#15803d';

  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SavedInvoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleDeleteInvoice = async (id: string, invNum: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete invoice ${invNum} from history?\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await deleteInvoice(id);
      await loadInvoices();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      alert('Failed to delete invoice from history.');
    }
  };

  const getInvTimestamp = (inv: SavedInvoice): number => {
    const raw = inv.createdAt || inv.invoiceDate;
    const t = new Date(raw).getTime();
    return isNaN(t) ? 0 : t;
  };

  const getInvSeq = (inv: SavedInvoice): number => {
    const parts = (inv.invoiceNumber || '').split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    return isNaN(num) ? 0 : num;
  };

  // Filter and sort invoices (robust dual-level sorting: timestamp + invoice sequence)
  const filteredAndSortedInvoices = [...invoices]
    .filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        (inv.customerPhone && inv.customerPhone.includes(q))
      );
    })
    .sort((a, b) => {
      const timeA = getInvTimestamp(a);
      const timeB = getInvTimestamp(b);
      if (timeA !== timeB) {
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      }
      const seqA = getInvSeq(a);
      const seqB = getInvSeq(b);
      return sortOrder === 'newest' ? seqB - seqA : seqA - seqB;
    });

  const sortOptions = [
    { id: 'newest', label: 'Date: Newest First' },
    { id: 'oldest', label: 'Date: Oldest First' },
  ];

  const currentSortLabel = sortOptions.find(o => o.id === sortOrder)?.label || 'Date: Newest First';

  return (
    <div className="min-h-screen pb-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Header */}
        <div
          className="rounded-2xl p-6 sm:p-7 mb-6 flex flex-wrap items-center justify-between gap-6 transition-all"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3" style={{ color: textStrong }}>
              <FileText className="h-7 w-7" style={{ color: accentText }} /> Invoice History Registry
            </h1>
            <p className="text-xs sm:text-sm font-semibold mt-1.5" style={{ color: textMuted }}>
              View, search, preview, download, or delete past commercial tax invoices ({invoices.length} Invoices).
            </p>
          </div>

          {/* Search & Custom Sort Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3.5 top-3.5" style={{ color: textMuted }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Inv No, Customer..."
                style={{
                  background: inputBg,
                  color: textStrong,
                  border: `1px solid ${inputBorder}`,
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none transition"
              />
            </div>

            {/* Custom Modern Dropdown Popover */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                style={{
                  background: inputBg,
                  color: textStrong,
                  border: `1px solid ${inputBorder}`,
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-between gap-2.5 transition active:scale-[0.98] select-none focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 shrink-0" style={{ color: textMuted }} />
                  <span>{currentSortLabel}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 shrink-0 ${isSortOpen ? 'rotate-180' : ''}`}
                  style={{ color: textMuted }}
                />
              </button>

              {/* Popover Dropdown Menu */}
              {isSortOpen && (
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                  }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl p-1.5 z-50 transition-all duration-150 transform origin-top-right animate-in fade-in zoom-in-95"
                >
                  {sortOptions.map((opt) => {
                    const isSelected = sortOrder === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortOrder(opt.id as 'newest' | 'oldest');
                          setIsSortOpen(false);
                        }}
                        style={{
                          background: isSelected
                            ? (isDark ? 'rgba(5, 28, 26, 0.08)' : 'rgba(201, 242, 39, 0.20)')
                            : 'transparent',
                          color: textStrong,
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all text-left focus:outline-none ${
                          !isSelected ? 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]' : ''
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="h-4 w-4 shrink-0" style={{ color: isDark ? '#051c1a' : '#c9f227' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice List — table on md+, cards on mobile */}
        <div
          className="rounded-2xl shadow-sm overflow-hidden transition-all"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          {isLoading ? (
            <div className="p-16 text-center text-base sm:text-lg font-bold" style={{ color: textMuted }}>
              Loading invoices registry...
            </div>
          ) : filteredAndSortedInvoices.length === 0 ? (
            <div className="p-16 text-center text-base sm:text-lg font-semibold" style={{ color: textMuted }}>
              No invoices found in history matching your query.
            </div>
          ) : (
            <>
              {/* ── Desktop table (md and above) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: isDark ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)', borderBottom: `1px solid ${cardDivide}` }}>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: textMuted }}>Invoice No</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: textMuted }}>Date</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: textMuted }}>Customer</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-center" style={{ color: textMuted }}>Payment</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-right" style={{ color: textMuted }}>Grand Total</th>
                      <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-center" style={{ color: textMuted }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm">
                    {filteredAndSortedInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        style={{ borderBottom: `1px solid ${cardDivide}` }}
                        className="transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                      >
                        <td className="py-3.5 px-5 font-mono font-black text-sm" style={{ color: textStrong }}>{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-5 font-semibold" style={{ color: textMuted }}>
                          {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-5 font-bold" style={{ color: textStrong }}>{inv.customerName}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="font-bold text-xs px-2.5 py-1 rounded-lg border uppercase" style={{ background: inputBg, color: textStrong, borderColor: inputBorder }}>
                            {inv.paymentMode}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-black text-sm" style={{ color: textStrong }}>
                          {formatCurrency(inv.grandTotal)}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenInvoice(inv.id)}
                              style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all border-0 shadow-sm active:scale-[0.98] focus:outline-none"
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Preview & Print</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                              className="p-1.5 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border border-transparent hover:border-rose-200 dark:hover:border-rose-800 focus:outline-none"
                              title={`Delete Invoice ${inv.invoiceNumber}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile card list (below md) ── */}
              <div className="md:hidden divide-y" style={{ borderColor: cardDivide }}>
                {filteredAndSortedInvoices.map((inv) => (
                  <div key={inv.id} className="p-4 space-y-3">
                    {/* Top row: invoice number + amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono font-black text-sm" style={{ color: textStrong }}>{inv.invoiceNumber}</p>
                        <p className="text-[11px] font-semibold mt-0.5" style={{ color: textMuted }}>
                          {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="font-mono font-black text-base" style={{ color: textStrong }}>
                        {formatCurrency(inv.grandTotal)}
                      </span>
                    </div>

                    {/* Middle row: customer + payment badge */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm truncate flex-1" style={{ color: textStrong }}>{inv.customerName}</p>
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded-md border uppercase shrink-0" style={{ background: inputBg, color: textStrong, borderColor: inputBorder }}>
                        {inv.paymentMode}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenInvoice(inv.id)}
                        style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-full text-xs font-black transition-all border-0 shadow-sm active:scale-[0.98] focus:outline-none"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview & Print</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                        className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border border-rose-200/40 dark:border-rose-800/40 focus:outline-none"
                        title={`Delete Invoice ${inv.invoiceNumber}`}
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
