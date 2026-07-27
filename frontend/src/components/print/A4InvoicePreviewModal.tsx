import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { SavedInvoice } from '../../types/billing';
import { PrintableInvoice } from './PrintableInvoice';
import { Printer, X, ZoomIn, ZoomOut, Maximize2, FileText, Check } from 'lucide-react';

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
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoice ? `Bill_${invoice.invoiceNumber}` : 'Owshika_BW_Invoice',
  });

  // Auto set smaller zoom for mobile devices
  useEffect(() => {
    if (window.innerWidth < 640) {
      setZoomLevel(60);
    }
  }, [isOpen]);

  if (!isOpen || !invoice) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(150, prev + 15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(40, prev - 15));
  const handleResetZoom = () => setZoomLevel(window.innerWidth < 640 ? 60 : 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden no-print">
      {/* ------------------- MODAL TOP TOOLBAR ------------------- */}
      <div className="w-full max-w-6xl bg-slate-900 dark:bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-white flex-shrink-0">
        {/* Left: Title & Invoice Badge */}
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-xs sm:text-base tracking-wide text-white">
                A4 Printable Bill Preview
              </h2>
              <span className="hidden sm:inline bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                B&W Monochrome
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate max-w-[200px] sm:max-w-none">
              #{invoice.invoiceNumber} | {invoice.customerName}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Middle: Zoom Controls */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-1 space-x-1">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <span className="px-1.5 text-xs font-mono font-bold text-slate-200 min-w-[40px] text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition border-l border-slate-700 ml-0.5"
              title="Reset Zoom"
            >
              <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handlePrint()}
              className="bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-xs px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-lg shadow-sky-600/30 transition"
            >
              <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Print Bill</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Close Preview"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------- A4 PAPER PREVIEW SHEET CONTAINER ------------------- */}
      <div className="flex-1 w-full max-w-6xl my-3 overflow-auto flex justify-center items-start p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 custom-scrollbar">
        {/* Authentic A4 Paper Sheet (210mm width simulation) */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 ease-out my-2"
        >
          <div className="bg-white text-black shadow-2xl rounded-sm border border-slate-400 p-8 w-[210mm] min-h-[297mm] relative box-border">
            {/* Sheet Watermark Header */}
            <div className="absolute top-2 right-4 text-[9px] font-mono text-slate-400 uppercase select-none tracking-widest no-print">
              Standard A4 Portrait Sheet (210mm × 297mm)
            </div>

            {/* Printable Pure B&W Bill Content */}
            <div ref={printRef}>
              <PrintableInvoice invoice={invoice} />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------- BOTTOM STATUS BAR ------------------- */}
      <div className="w-full max-w-6xl bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-300">Ready for Thermal / Laser Printing</span>
          </span>
          <span>•</span>
          <span className="font-mono">Format: A4 Monochrome</span>
        </div>
        <div className="font-mono">
          Total Amount: <strong className="text-white">₹{invoice.grandTotal.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
};
