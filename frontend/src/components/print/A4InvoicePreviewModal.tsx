import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { SavedInvoice } from '../../types/billing';
import { PrintableInvoice } from './PrintableInvoice';
import { Printer, X, ZoomIn, ZoomOut, FileText, Download, Edit3 } from 'lucide-react';
import { useBillingStore } from '../../store/useBillingStore';
import { fetchInvoiceById } from '../../services/api';

interface A4InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SavedInvoice | null;
}

export const A4InvoicePreviewModal: React.FC<A4InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [autoFitScale, setAutoFitScale] = useState<number>(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filename is strictly the invoice number only (e.g. OE-2026-0001)
  const invoiceNumberOnly = invoice?.invoiceNumber ? invoice.invoiceNumber.trim() : 'INVOICE';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoiceNumberOnly,
  });

  const handleDownloadPdf = async () => {
    if (!invoice || !printRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const opt = {
        margin: [4, 4, 4, 4],
        filename: `${invoiceNumberOnly}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await (html2pdf as any)().set(opt).from(printRef.current).save();
    } catch (err) {
      console.error('Failed to download PDF bill:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Calculate dynamic auto-fit scale so A4 sheet (794px width) fits mobile viewport cleanly without horizontal overflow
  useEffect(() => {
    if (!isOpen) return;

    const calculateFit = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        // Mobile padding ~24px total
        const available = screenWidth - 24;
        const fitRatio = available / 794;
        setAutoFitScale(Math.max(0.35, Math.min(1, fitRatio)));
      } else {
        setAutoFitScale(1);
      }
    };

    calculateFit();
    window.addEventListener('resize', calculateFit);
    return () => window.removeEventListener('resize', calculateFit);
  }, [isOpen]);

  if (!isOpen || !invoice) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(200, prev + 20));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(50, prev - 20));
  const handleResetZoom = () => setZoomLevel(100);

  const effectiveScale = autoFitScale * (zoomLevel / 100);
  const a4WidthPx = 794; // approx 210mm at 96 DPI
  const scaledWidthPx = a4WidthPx * effectiveScale;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden no-print animate-smooth-fade">
      {/* ------------------- MODAL TOP TOOLBAR ------------------- */}
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-white flex-shrink-0 animate-smooth-pop">
        
        {/* Left: Invoice Title Badge */}
        <div className="flex items-center justify-between sm:justify-start space-x-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-black text-xs sm:text-sm text-white tracking-tight">
                  A4 Bill Preview
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  #{invoice.invoiceNumber}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono truncate max-w-[180px] sm:max-w-none">
                {invoice.customerName || 'OWSHIKA ENTERPRISES'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sm:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Right Controls: Zoom & Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          
          {/* Zoom Level Controls */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 space-x-1 shrink-0">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-0.5 text-[11px] font-mono font-black text-slate-200 hover:text-emerald-400 transition"
              title="Reset to 100%"
            >
              {Math.round(zoomLevel)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Action Buttons: Edit, Download PDF & Print */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
            {invoice && (
              <button
                type="button"
                onClick={async () => {
                  onClose();
                  try {
                    const full = await fetchInvoiceById(invoice.id);
                    useBillingStore.getState().loadInvoiceForEditing(full);
                  } catch (e) {
                    useBillingStore.getState().loadInvoiceForEditing(invoice);
                  }
                  if (window.location.pathname !== '/') {
                    window.location.href = '/';
                  }
                }}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 active:scale-95 transition-all shadow-sm"
                title="Edit this saved bill"
              >
                <Edit3 className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span className="text-[11px]">Edit Bill</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              title={`Download ${invoiceNumberOnly}.pdf`}
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[11px]">{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrint()}
              className="bg-[#c9f227] hover:bg-[#d6f944] text-[#051c1a] font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 active:scale-95 transition-all border-0 shadow-md shadow-[#c9f227]/20"
              title="Print Invoice"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span>Print Bill</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------- RESPONSIVE SCALED PREVIEW SHEET CONTAINER ------------------- */}
      <div 
        ref={containerRef}
        className="flex-1 w-full max-w-6xl my-2 overflow-auto flex justify-center items-start p-2 sm:p-6 bg-slate-950/70 rounded-2xl border border-slate-800/80 custom-scrollbar"
      >
        {/* Outer wrapper sizing bounding box to prevent layout overflow on mobile */}
        <div 
          style={{ 
            width: `${scaledWidthPx}px`, 
            margin: '0 auto', 
            transition: 'width 0.15s ease-out' 
          }}
        >
          {/* Scaled A4 Sheet Container */}
          <div
            style={{ 
              transform: `scale(${effectiveScale})`, 
              transformOrigin: 'top left',
              width: `${a4WidthPx}px`
            }}
            className="transition-transform duration-150 ease-out bg-white text-black shadow-2xl rounded-sm border border-slate-300 p-4 sm:p-8"
          >
            {/* Printable Pure B&W Bill Content */}
            <div ref={printRef}>
              <PrintableInvoice invoice={invoice} />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------- BOTTOM MOBILE TOUCH HELP BAR ------------------- */}
      <div className="w-full max-w-6xl bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="font-semibold text-slate-300">A4 Printable Format</span>
          <span className="hidden sm:inline">• Use + / - or pinch to zoom</span>
        </div>
        <div className="font-mono font-bold text-white">
          Total: ₹{invoice.grandTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

