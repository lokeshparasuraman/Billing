import React, { useEffect, useState } from 'react';
import { useBillingStore } from '../store/useBillingStore';
import { fetchNextInvoiceNumber } from '../services/api';
import { BillingHeader } from '../components/billing/BillingHeader';
import { ProductTable } from '../components/billing/ProductTable';
import { CalculationSummary } from '../components/billing/CalculationSummary';
import { KeyboardShortcutsHelp } from '../components/billing/KeyboardShortcutsHelp';
import { A4InvoicePreviewModal } from '../components/print/A4InvoicePreviewModal';

export const BillingPage: React.FC = () => {
  const {
    savedInvoiceForPrint,
    isPrintModalOpen,
    setIsPrintModalOpen,
    setHeaderField,
    addRow,
  } = useBillingStore();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Auto-fetch next invoice number on initial mount
  useEffect(() => {
    fetchNextInvoiceNumber().then((num) => {
      setHeaderField('invoiceNumber', num);
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Billing Header Section */}
        <BillingHeader />

        {/* Product Entry Table Section */}
        <ProductTable />

        {/* Invoice Summary & Calculation Footer */}
        <CalculationSummary />
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* A4 Printable B&W Invoice Preview Modal */}
      <A4InvoicePreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={savedInvoiceForPrint}
      />
    </div>
  );
};

export default BillingPage;
