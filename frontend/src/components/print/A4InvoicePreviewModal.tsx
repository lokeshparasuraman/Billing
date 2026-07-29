import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { SavedInvoice } from '../../types/billing';
import { PrintableInvoice } from './PrintableInvoice';
import { Printer, X, ZoomIn, ZoomOut, Maximize2, FileText, Download, Minimize2 } from 'lucide-react';

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
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format date cleanly for filename (e.g. Bill_OE-2026-0001_28-07-2026)
  const formattedDate = invoice?.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/[\/\\]/g, '-')
    : 'Date';
  const sanitizeName = invoice?.customerName ? invoice.customerName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'Customer';
  const pdfFilename = `Bill_${invoice?.invoiceNumber || 'OE'}_${sanitizeName}_${formattedDate}`;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${pdfFilename}.pdf`,
  });

  const handleDownloadBill = () => {
    if (!invoice || !printRef.current) return;
    try {
      const content = printRef.current.innerHTML;
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${pdfFilename}.pdf</title>
  <style>
    @page { size: A4 portrait; margin: 0mm !important; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #000000; padding: 10mm; margin: 0; }
  </style>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body onload="window.print()">
  <div style="max-width: 210mm; margin: 0 auto;">
    ${content}
  </div>
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFilename}.pdf.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download bill:', err);
    }
  };

  const handlePrintAndSave = () => {
    handlePrint();
    handleDownloadBill();
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden no-print">
      {/* ------------------- MODAL TOP TOOLBAR ------------------- */}
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-white flex-shrink-0">
        
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

          {/* Action Buttons: Download & Print */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={handleDownloadBill}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 active:scale-95 transition-all shadow-sm"
              title="Download HTML file"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline text-[11px]">Download</span>
            </button>

            <button
              type="button"
              onClick={handlePrintAndSave}
              className="bg-[#c9f227] hover:bg-[#d6f944] text-[#051c1a] font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 active:scale-95 transition-all border-0 shadow-md shadow-[#c9f227]/20"
              title="Print Bill or Save as PDF"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span>Print / Save PDF</span>
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

