import React, { useEffect } from 'react';
import { useBillingStore } from '../store/useBillingStore';
import { fetchNextInvoiceNumber, fetchStoreSettings } from '../services/api';
import { BillingHeader } from '../components/billing/BillingHeader';
import { ProductTable } from '../components/billing/ProductTable';
import { CalculationSummary } from '../components/billing/CalculationSummary';
import { A4InvoicePreviewModal } from '../components/print/A4InvoicePreviewModal';

export const BillingPage: React.FC = () => {
  const {
    savedInvoiceForPrint,
    isPrintModalOpen,
    setIsPrintModalOpen,
    setHeaderField,
    setStoreDetails,
    addRow,
  } = useBillingStore();

  // Auto-fetch next invoice number and store settings on initial mount
  useEffect(() => {
    fetchNextInvoiceNumber().then((num) => {
      setHeaderField('invoiceNumber', num);
    });
    fetchStoreSettings().then((details) => {
      if (details && details.storeName) {
        setStoreDetails(details);
      }
    });
  }, []);

  // Keyboard hotkeys handler (Ctrl+P to trigger save & print, Ctrl+Shift+A for add row)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        const printBtn = document.querySelector('button[data-action="save-print"]') as HTMLButtonElement;
        if (printBtn) {
          printBtn.click();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        addRow();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [addRow]);

  return (
    <div className="min-h-screen pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Billing Header Section */}
        <BillingHeader />

        {/* Product Entry Table Section */}
        <ProductTable />

        {/* Invoice Summary & Calculation Footer */}
        <CalculationSummary />
      </div>

      {/* A4 Printable B&W Invoice Preview Model */}
      <A4InvoicePreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={savedInvoiceForPrint}
      />
    </div>
  );
};

export default BillingPage;
