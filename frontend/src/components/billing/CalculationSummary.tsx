import React from 'react';
import { useBillingStore } from '../../store/useBillingStore';
import { calculateInvoiceSummary, formatCurrency } from '../../utils/calculations';
import { createInvoice, fetchNextInvoiceNumber } from '../../services/api';
import { Printer, Save, RefreshCw, AlertCircle, FileSearch } from 'lucide-react';
import { SavedInvoice } from '../../types/billing';
import { useThemeMode } from '../../context/ThemeContext';

export const CalculationSummary: React.FC = () => {
  const {
    header, rows, storeDetails, isSaving, setIsSaving,
    validationError, setValidationError, setSavedInvoiceForPrint,
    setIsPrintModalOpen, clearBillingForm, resetWithNextInvoiceNumber,
  } = useBillingStore();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  /* ─── Inverted card tokens ─── */
  const cardBg     = isDark ? '#ebedf0' : '#051c1a';
  const cardBorder = isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const cardDivide = isDark ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)';
  const textStrong = isDark ? '#051c1a' : '#ffffff';
  const textMuted  = isDark ? 'rgba(5,28,26,0.55)' : 'rgba(255,255,255,0.65)';
  const subBg      = isDark ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
  const secBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
    border: `1px solid ${cardDivide}`,
    background: subBg, color: textMuted, cursor: 'pointer', transition: 'all 0.15s',
  };

  const summary = calculateInvoiceSummary(rows);
  const totalGstAmount = summary.cgstTotal + summary.sgstTotal;

  const handlePreviewWithoutSaving = () => {
    setValidationError(null);
    const validItems = rows.filter((r) => r.name.trim() !== '' && typeof r.quantity === 'number' && r.quantity > 0);
    if (validItems.length === 0) { setValidationError('Please add at least one valid product to preview.'); return; }

    const tempInvoice: SavedInvoice = {
      id: 'preview_temp',
      billType: header.billType || 'CUSTOMER',
      transportDetails: header.billType === 'TRANSPORT' ? header.transportDetails : undefined,
      invoiceNumber: header.invoiceNumber || 'INV-PREVIEW',
      invoiceDate: header.invoiceDate || new Date().toISOString(),
      customerName: storeDetails.storeName || 'Owshika Enterprises',
      customerPhone: storeDetails.phone || '',
      customerAddress: storeDetails.address || '',
      paymentMode: header.paymentMode,
      subtotal: summary.subtotal,
      discountTotal: 0,
      cgstTotal: summary.cgstTotal,
      sgstTotal: summary.sgstTotal,
      igstTotal: summary.igstTotal,
      roundOff: summary.roundOff,
      grandTotal: summary.grandTotal,
      amountInWords: summary.amountInWords,
      createdAt: new Date().toISOString(),
      items: validItems.map((r, idx) => ({
        id: `prev_item_${idx}`,
        partNumber: r.partNumber || 'N/A',
        productName: r.name,
        hsn: r.hsn || 'N/A',
        unit: r.unit || 'PCS',
        quantity: Number(r.quantity),
        price: Number(r.price || 0),
        discount: 0,
        gstRate: Number(r.gstRate || 0),
        gstAmount: (Number(r.quantity) * Number(r.price || 0) * Number(r.gstRate || 0)) / 100,
        total: Number(r.quantity) * Number(r.price || 0) * (1 + Number(r.gstRate || 0) / 100),
      })),
    };
    setSavedInvoiceForPrint(tempInvoice);
    setIsPrintModalOpen(true);
  };

  const handleValidateAndSave = async (shouldPrint: boolean) => {
    setValidationError(null);
    const validItems = rows.filter((r) => r.name.trim() !== '' && typeof r.quantity === 'number' && r.quantity > 0);
    if (validItems.length === 0) { setValidationError('Please add at least one valid product with Quantity > 0.'); return; }
    setIsSaving(true);
    try {
      const payload = {
        billType: header.billType || 'CUSTOMER',
        transportDetails: header.billType === 'TRANSPORT' ? header.transportDetails : undefined,
        invoiceNumber: header.invoiceNumber,
        invoiceDate: header.invoiceDate,
        customerName: storeDetails.storeName || 'Owshika Enterprises',
        customerPhone: storeDetails.phone || '',
        customerAddress: storeDetails.address || '',
        paymentMode: header.paymentMode,
        items: validItems.map((r) => ({
          productId: r.productId || null,
          partNumber: r.partNumber || 'N/A',
          productName: r.name,
          hsn: r.hsn || 'N/A',
          unit: r.unit || 'PCS',
          quantity: Number(r.quantity),
          price: Number(r.price || 0),
          discount: 0,
          gstRate: Number(r.gstRate || 0),
        })),
      };
      const savedInv = await createInvoice(payload);
      setSavedInvoiceForPrint(savedInv);
      if (shouldPrint) setIsPrintModalOpen(true);
      try {
        const nextNum = await fetchNextInvoiceNumber();
        resetWithNextInvoiceNumber(nextNum);
      } catch { clearBillingForm(); }
    } catch (err: any) {
      console.error('Save invoice error:', err);
      setValidationError(err.response?.data?.error || 'Failed to save invoice. Please check backend connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

      {/* Left: Amount in words + validation + action bar — below billing summary on mobile */}
      <div className="lg:col-span-7 flex flex-col gap-3 order-2 lg:order-1">

        {/* Amount in Words */}
        <div
          className="rounded-2xl p-4 sm:p-5"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider mb-1.5" style={{ color: textMuted }}>
            Amount In Words
          </div>
          <div className="text-xs sm:text-sm font-semibold italic leading-relaxed" style={{ color: textStrong }}>
            "{summary.amountInWords}"
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="border-l-4 border-red-500 p-3 sm:p-4 rounded-r-2xl text-xs sm:text-sm flex items-start space-x-2 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="font-semibold leading-relaxed">{validationError}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <button type="button" onClick={clearBillingForm} style={secBtnStyle}>
            <RefreshCw className="h-4 w-4" />
            <span>Clear Form</span>
          </button>

          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5">
            <button type="button" onClick={handlePreviewWithoutSaving} style={secBtnStyle} title="Preview A4 Bill">
              <FileSearch className="h-4 w-4" />
              <span>A4 Bill Preview</span>
            </button>

            <button type="button" disabled={isSaving} onClick={() => handleValidateAndSave(false)} style={secBtnStyle}>
              <Save className="h-4 w-4" />
              <span>Save Only</span>
            </button>

            {/* Primary CTA — lime */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleValidateAndSave(true)}
              data-action="save-print"
              style={{ backgroundColor: '#c9f227', color: '#051c1a' }}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-black active:scale-[0.98] transition-all border-0 shadow-sm"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#d6f944'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#c9f227'; }}
            >
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{isSaving ? 'Saving...' : 'Save & Print Invoice'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Billing Summary — first on mobile */}
      <div
        className="lg:col-span-5 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm order-1 lg:order-2"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="pb-3 font-extrabold uppercase tracking-wider text-xs flex justify-between" style={{ borderBottom: `1px solid ${cardDivide}`, color: textStrong }}>
          <span>Billing Summary</span>
          <span style={{ color: textMuted }}>Tax & Total</span>
        </div>

        <div className="py-2.5 flex justify-between items-center" style={{ borderBottom: `1px solid ${cardDivide}`, color: textMuted }}>
          <span>Subtotal (Taxable):</span>
          <span className="font-mono font-bold" style={{ color: textStrong }}>{formatCurrency(summary.subtotal)}</span>
        </div>

        <div className="py-2.5 flex justify-between items-center" style={{ borderBottom: `1px solid ${cardDivide}`, color: textMuted }}>
          <span>GST Tax Amount:</span>
          <span className="font-mono font-bold" style={{ color: textStrong }}>{formatCurrency(totalGstAmount)}</span>
        </div>

        <div className="py-2.5 flex justify-between items-center text-xs" style={{ borderBottom: `1px solid ${cardDivide}`, color: textMuted }}>
          <span>Round Off Adjust:</span>
          <span className="font-mono text-xs font-semibold" style={{ color: textMuted }}>
            {summary.roundOff >= 0 ? `+${summary.roundOff.toFixed(2)}` : summary.roundOff.toFixed(2)}
          </span>
        </div>

        {/* Grand Total */}
        <div className="pt-3.5 pb-1 flex justify-between items-center">
          <span className="font-black text-sm sm:text-base uppercase tracking-wide" style={{ color: textStrong }}>Grand Total:</span>
          <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight" style={{ color: textStrong }}>
            {formatCurrency(summary.grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};
