import React from 'react';
import { useBillingStore } from '../../store/useBillingStore';
import { calculateInvoiceSummary, formatCurrency } from '../../utils/calculations';
import { createInvoice, fetchNextInvoiceNumber } from '../../services/api';
import { Printer, Save, RefreshCw, AlertCircle, Sparkles, FileSearch } from 'lucide-react';
import { SavedInvoice } from '../../types/billing';

export const CalculationSummary: React.FC = () => {
  const {
    header,
    rows,
    isSaving,
    setIsSaving,
    validationError,
    setValidationError,
    setSavedInvoiceForPrint,
    setIsPrintModalOpen,
    clearBillingForm,
    resetWithNextInvoiceNumber,
  } = useBillingStore();

  const summary = calculateInvoiceSummary(rows);

  const handlePreviewWithoutSaving = () => {
    setValidationError(null);
    if (!header.customerName || header.customerName.trim() === '') {
      setValidationError('Customer Name is required to preview invoice.');
      return;
    }

    const validItems = rows.filter(
      (r) => r.name.trim() !== '' && typeof r.quantity === 'number' && r.quantity > 0
    );

    if (validItems.length === 0) {
      setValidationError('Please add at least one valid product to preview.');
      return;
    }

    const tempInvoice: SavedInvoice = {
      id: 'preview_temp',
      invoiceNumber: header.invoiceNumber || 'INV-PREVIEW',
      invoiceDate: header.invoiceDate || new Date().toISOString(),
      customerName: header.customerName,
      customerPhone: header.customerPhone,
      customerAddress: header.customerAddress,
      paymentMode: header.paymentMode,
      subtotal: summary.subtotal,
      discountTotal: summary.discountTotal,
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
        discount: Number(r.discount || 0),
        gstRate: Number(r.gstRate || 0),
        gstAmount: (Number(r.quantity) * Number(r.price || 0) * Number(r.gstRate || 0)) / 100,
        total:
          Number(r.quantity) * Number(r.price || 0) * (1 - Number(r.discount || 0) / 100) * (1 + Number(r.gstRate || 0) / 100),
      })),
    };

    setSavedInvoiceForPrint(tempInvoice);
    setIsPrintModalOpen(true);
  };

  const handleValidateAndSave = async (shouldPrint: boolean) => {
    setValidationError(null);

    if (!header.customerName || header.customerName.trim() === '') {
      setValidationError('Customer Name is required to generate invoice.');
      return;
    }

    const validItems = rows.filter(
      (r) => r.name.trim() !== '' && typeof r.quantity === 'number' && r.quantity > 0
    );

    if (validItems.length === 0) {
      setValidationError('Please add at least one valid product with Quantity > 0.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        invoiceNumber: header.invoiceNumber,
        invoiceDate: header.invoiceDate,
        customerName: header.customerName,
        customerPhone: header.customerPhone,
        customerAddress: header.customerAddress,
        paymentMode: header.paymentMode,
        items: validItems.map((r) => ({
          productId: r.productId || null,
          partNumber: r.partNumber || 'N/A',
          productName: r.name,
          hsn: r.hsn || 'N/A',
          unit: r.unit || 'PCS',
          quantity: Number(r.quantity),
          price: Number(r.price || 0),
          discount: Number(r.discount || 0),
          gstRate: Number(r.gstRate || 0),
        })),
      };

      const savedInv = await createInvoice(payload);

      setSavedInvoiceForPrint(savedInv);
      if (shouldPrint) {
        setIsPrintModalOpen(true);
      }

      // Fetch next auto-increment invoice number for next bill
      try {
        const nextNum = await fetchNextInvoiceNumber();
        resetWithNextInvoiceNumber(nextNum);
      } catch (err) {
        clearBillingForm();
      }
    } catch (err: any) {
      console.error('Save invoice error:', err);
      const msg = err.response?.data?.error || 'Failed to save invoice. Please check backend connection.';
      setValidationError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Column: Validation Error & Amount in Words Banner */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
        {/* Amount in Words Card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white rounded-xl p-4 shadow-sm border border-slate-700">
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Amount In Words</span>
          </div>
          <div className="text-sm font-semibold text-slate-100 italic leading-snug">
            "{summary.amountInWords}"
          </div>
        </div>

        {/* Validation Error Alert if present */}
        {validationError && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border-l-4 border-rose-500 p-3 rounded-r-lg text-xs text-rose-800 dark:text-rose-200 flex items-start space-x-2 animate-shake">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="font-semibold">{validationError}</div>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={clearBillingForm}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Clear Form</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePreviewWithoutSaving}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition shadow-sm"
              title="Preview A4 Sheet Bill before saving or printing"
            >
              <FileSearch className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>A4 Bill Preview</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleValidateAndSave(false)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition shadow-sm"
            >
              <Save className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              <span>Save Only</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleValidateAndSave(true)}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-500 transition shadow-md shadow-sky-600/30"
              data-action="save-print"
            >
              <Printer className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save & Print Invoice'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Detailed Financial Summary Card */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        <div className="pb-2 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs flex justify-between">
          <span>Billing Summary</span>
          <span className="text-sky-600 dark:text-sky-400">Live Breakdown</span>
        </div>

        {/* Subtotal */}
        <div className="py-2 flex justify-between items-center font-medium text-slate-700 dark:text-slate-300">
          <span>Subtotal (Taxable):</span>
          <span className="font-mono text-sm font-semibold">{formatCurrency(summary.subtotal)}</span>
        </div>

        {/* Discount Total */}
        {summary.discountTotal > 0 && (
          <div className="py-2 flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-medium">
            <span>Total Discount:</span>
            <span className="font-mono text-sm font-semibold">-{formatCurrency(summary.discountTotal)}</span>
          </div>
        )}

        {/* CGST */}
        <div className="py-2 flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>CGST (Central Tax):</span>
          <span className="font-mono text-xs font-medium">{formatCurrency(summary.cgstTotal)}</span>
        </div>

        {/* SGST */}
        <div className="py-2 flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>SGST (State Tax):</span>
          <span className="font-mono text-xs font-medium">{formatCurrency(summary.sgstTotal)}</span>
        </div>

        {/* Round Off */}
        <div className="py-2 flex justify-between items-center text-slate-500 dark:text-slate-400">
          <span>Round Off Adjust:</span>
          <span className="font-mono text-xs">
            {summary.roundOff >= 0 ? `+${summary.roundOff.toFixed(2)}` : summary.roundOff.toFixed(2)}
          </span>
        </div>

        {/* Grand Total */}
        <div className="pt-3 pb-1 flex justify-between items-center">
          <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">Grand Total:</span>
          <span className="font-mono text-xl font-extrabold text-sky-700 dark:text-sky-400">
            {formatCurrency(summary.grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};
