import React from 'react';
import { SavedInvoice } from '../../types/billing';
import { formatCurrency, numberToWordsIndian } from '../../utils/calculations';
import { useBillingStore } from '../../store/useBillingStore';
import '../../styles/print.css';

interface PrintableInvoiceProps {
  invoice: SavedInvoice;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice }) => {
  const storeDetailsState = useBillingStore((state) => state.storeDetails);

  if (!invoice) return null;

  // Always load latest updated store details from state or localStorage
  let store = storeDetailsState;
  try {
    const saved = localStorage.getItem('store_details');
    if (saved) {
      store = { ...storeDetailsState, ...JSON.parse(saved) };
    }
  } catch (e) {
    // Ignore error
  }

  const storeName = store?.storeName || 'OWSHIKA ENTERPRISES';
  const gstin = store?.gstin || '33BAEPP2449B1Z3';
  const address = store?.address || '4/783, Kothumai Mill, Near New Bus Stand, Salem Main Road, Dharmapuri - 636701';
  const phone = store?.phone || '+91 9445662637';

  // Dynamically compute Place of Supply state from GSTIN prefix
  const gstStateMap: Record<string, string> = {
    '29': 'Karnataka (29)',
    '33': 'Tamil Nadu (33)',
    '27': 'Maharashtra (27)',
    '32': 'Kerala (32)',
    '36': 'Telangana (36)',
    '37': 'Andhra Pradesh (37)',
    '07': 'Delhi (07)',
    '09': 'Uttar Pradesh (09)',
    '19': 'West Bengal (19)',
    '24': 'Gujarat (24)'
  };
  const gstinPrefix = (gstin && gstin.length >= 2) ? gstin.substring(0, 2) : '33';
  const placeOfSupply = gstStateMap[gstinPrefix] || `State (${gstinPrefix})`;

  // Calculate GST Breakdown by HSN/GST Rate for bottom summary
  const gstBreakdownMap: Record<number, { taxable: number; gstAmt: number }> = {};

  invoice.items.forEach((item) => {
    const rate = item.gstRate || 0;
    const gross = item.quantity * item.price;
    const disc = (gross * (item.discount || 0)) / 100;
    const taxable = gross - disc;
    const gstAmt = item.gstAmount || (taxable * rate) / 100;

    if (!gstBreakdownMap[rate]) {
      gstBreakdownMap[rate] = { taxable: 0, gstAmt: 0 };
    }
    gstBreakdownMap[rate].taxable += taxable;
    gstBreakdownMap[rate].gstAmt += gstAmt;
  });

  const gstBreakdownList = Object.keys(gstBreakdownMap).map((rateStr) => {
    const rate = Number(rateStr);
    const data = gstBreakdownMap[rate];
    return {
      rate,
      taxable: data.taxable,
      totalGst: data.gstAmt,
    };
  });

  const totalGstAmount = (invoice.cgstTotal || 0) + (invoice.sgstTotal || 0);

  return (
    <div 
      className="print-invoice-wrapper text-black bg-white leading-normal" 
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      {/* ------------------- OUTER FRAMED HEADER SECTION ------------------- */}
      <div className="border-2 border-black p-4 mb-4">
        <div className="flex justify-between items-start gap-4 pb-3 border-b-2 border-black">
          {/* Company Brand (No Logo, Pure Crisp Typography) */}
          <div className="space-y-1 max-w-[60%]">
            <h1 className="text-2xl font-black tracking-tight text-black uppercase">
              {storeName}
            </h1>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Industrial Hardware, Fasteners, Electricals &amp; Plumbing Supplies
            </p>
            <p className="text-xs text-black font-medium leading-snug">
              {address}
            </p>
            <p className="text-xs text-black font-mono font-bold pt-0.5">
              GSTIN: <span className="font-black">{gstin}</span> | Mob: <span className="font-black">{phone}</span>
            </p>
          </div>

          {/* INVOICE BADGE & META */}
          <div className="text-right flex flex-col items-end shrink-0">
            <div className="border-2 border-black bg-slate-50 text-black font-black text-sm px-4 py-1 uppercase tracking-widest mb-2 shadow-sm">
              {invoice.billType === 'TRANSPORT' ? 'TRANSPORT WAYBILL' : 'TAX INVOICE'}
            </div>
            <div className="text-xs space-y-1 font-mono text-black text-right bg-white p-2 border border-black min-w-[200px]">
              <div className="flex justify-between gap-3">
                <span className="font-sans font-semibold text-gray-700">Invoice No:</span>
                <strong className="font-black text-black">{invoice.invoiceNumber}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="font-sans font-semibold text-gray-700">Date:</span>
                <strong className="font-bold text-black">
                  {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="font-sans font-semibold text-gray-700">Payment Mode:</span>
                <strong className="uppercase font-black text-black">{invoice.paymentMode}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Billed By & Place of Supply Grid Box */}
        <div className="mt-3 grid grid-cols-2 divide-x divide-black border border-black text-xs bg-white">
          <div className="p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider block text-gray-600">
              Billed By / Store Details:
            </span>
            <h3 className="font-black text-black text-sm uppercase">{storeName}</h3>
            <p className="text-black text-xs font-medium leading-relaxed">
              {address}
            </p>
          </div>
          <div className="p-3 space-y-1 text-right flex flex-col justify-center">
            <p className="text-black text-xs font-mono">
              <span className="font-sans font-semibold text-gray-600 mr-2">GSTIN Number:</span>
              <strong className="font-black">{gstin}</strong>
            </p>
            <p className="text-black text-xs font-mono">
              <span className="font-sans font-semibold text-gray-600 mr-2">Place of Supply:</span>
              <strong className="font-black">{placeOfSupply}</strong>
            </p>
            <p className="text-black text-xs font-mono">
              <span className="font-sans font-semibold text-gray-600 mr-2">Mobile / Contact:</span>
              <strong className="font-black">{phone}</strong>
            </p>
          </div>
        </div>

        {/* Transport Details Box (Shown for Transport Bills) */}
        {(invoice.billType === 'TRANSPORT' || invoice.transportDetails) && (
          <div className="mt-3 p-3 border border-black bg-slate-50 text-xs">
            <span className="text-xs font-black uppercase tracking-wider block text-black border-b border-black pb-1.5 mb-2 flex items-center gap-1.5">
              🚛 Transport Details
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="border-r border-black/20 pr-2">
                <span className="font-sans font-bold block text-[10px] text-gray-600 uppercase mb-0.5">From Address:</span>
                <strong className="font-bold text-black font-sans text-[11px] leading-snug block whitespace-pre-line">
                  {invoice.transportDetails?.fromLocation || address}
                </strong>
              </div>
              <div className="border-r border-black/20 pr-2">
                <span className="font-sans font-bold block text-[10px] text-gray-600 uppercase mb-0.5">To Address:</span>
                <strong className="font-bold text-black font-sans text-[11px] leading-snug block whitespace-pre-line">
                  {invoice.transportDetails?.toLocation || 'N/A'}
                </strong>
              </div>
              <div className="border-r border-black/20 pr-2">
                <span className="font-sans font-bold block text-[10px] text-gray-600 uppercase mb-0.5">Vehicle / LR No:</span>
                <strong className="font-bold font-mono text-black text-xs block mt-1">
                  {invoice.transportDetails?.vehicleNumber || 'N/A'}
                </strong>
              </div>
              <div>
                <span className="font-sans font-bold block text-[10px] text-gray-600 uppercase mb-0.5">Transporter Name:</span>
                <strong className="font-bold text-black font-sans text-xs block mt-1">
                  {invoice.transportDetails?.transporterName || 'Self Transport'}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------- COMPLETE FRAMED PRODUCT TABLE ------------------- */}
      <table className="print-table w-full text-left border-collapse border-2 border-black mb-4 text-xs">
        <thead>
          <tr className="bg-slate-50 text-black font-black uppercase text-[11px] border-b-2 border-black">
            <th className="py-2 px-2 text-center border border-black w-10">#</th>
            <th className="py-2 px-2.5 border border-black w-32 font-sans">Part / Code</th>
            <th className="py-2 px-3 border border-black font-sans">Description of Goods / Services</th>
            <th className="py-2 px-2.5 text-center border border-black w-20 font-sans">HSN</th>
            <th className="py-2 px-2.5 text-right border border-black w-16 font-sans">Qty</th>
            <th className="py-2 px-2.5 text-right border border-black w-24 font-sans">Rate (₹)</th>
            <th className="py-2 px-2.5 text-center border border-black w-16 font-sans">GST %</th>
            <th className="py-2 px-3 text-right border border-black w-28 font-sans">Amount (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          {invoice.items.map((item, idx) => (
            <tr key={item.id || idx} className="border-b border-black hover:bg-slate-50/50">
              <td className="py-2 px-2 text-center border border-black font-mono font-semibold text-xs">
                {idx + 1}
              </td>
              <td className="py-2 px-2.5 border border-black font-mono font-bold text-xs text-black">
                {item.partNumber || '-'}
              </td>
              <td className="py-2 px-3 border border-black font-semibold text-xs text-black leading-snug">
                {item.productName}
              </td>
              <td className="py-2 px-2.5 text-center border border-black font-mono text-xs font-semibold">
                {item.hsn || 'N/A'}
              </td>
              <td className="py-2 px-2.5 text-right border border-black font-mono font-black text-xs text-black">
                {item.quantity}
              </td>
              <td className="py-2 px-2.5 text-right border border-black font-mono text-xs">
                {item.price.toFixed(2)}
              </td>
              <td className="py-2 px-2.5 text-center border border-black font-mono font-bold text-xs">
                {item.gstRate}%
              </td>
              <td className="py-2 px-3 text-right border border-black font-mono font-black text-xs text-black">
                {item.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ------------------- COMPLETE FRAMED FINAL SUMMARY & TERMS ------------------- */}
      <div className="print-summary-footer space-y-4">
        {/* Amounts & Taxes Grid Box */}
        <div className="grid grid-cols-12 gap-4 text-xs">
          {/* Left Column: GST Summary Breakdown Table & Bank Info */}
          <div className="col-span-7 space-y-3">
            {/* GST Summary Table */}
            <div className="border-2 border-black overflow-hidden bg-white">
              <div className="bg-slate-50 px-3 py-1.5 font-black text-xs uppercase text-black border-b-2 border-black tracking-wide">
                GST Tax Summary Breakdown
              </div>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-black bg-white font-black text-black">
                    <th className="py-1.5 px-2.5 text-center border-r border-black">GST Rate</th>
                    <th className="py-1.5 px-2.5 text-right border-r border-black">Taxable Amount</th>
                    <th className="py-1.5 px-2.5 text-right">GST Tax Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono text-black">
                  {gstBreakdownList.map((g) => (
                    <tr key={g.rate} className="border-b border-black">
                      <td className="py-1.5 px-2.5 text-center font-bold border-r border-black">{g.rate}%</td>
                      <td className="py-1.5 px-2.5 text-right border-r border-black">₹{g.taxable.toFixed(2)}</td>
                      <td className="py-1.5 px-2.5 text-right font-black">₹{g.totalGst.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bank Details Box */}
            <div className="border-2 border-black p-3 text-xs bg-white space-y-1.5">
              <span className="font-black uppercase tracking-wide text-black block border-b border-black pb-1">
                Bank Details for NEFT / RTGS:
              </span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-black text-xs pt-0.5">
                <div><span className="font-sans text-gray-600 text-[11px] block">Bank Name:</span> <strong>HDFC Bank Ltd</strong></div>
                <div><span className="font-sans text-gray-600 text-[11px] block">Account No:</span> <strong>50200012345678</strong></div>
                <div><span className="font-sans text-gray-600 text-[11px] block">IFSC Code:</span> <strong>HDFC0000123</strong></div>
                <div><span className="font-sans text-gray-600 text-[11px] block">Branch:</span> <strong>Peenya Industrial Area</strong></div>
              </div>
            </div>
          </div>

          {/* Right Column: Total Calculations Box */}
          <div className="col-span-5 border-2 border-black divide-y-2 divide-black bg-white text-black flex flex-col justify-between">
            <div className="space-y-0 divide-y divide-black text-xs">
              <div className="py-2.5 px-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">Subtotal (Taxable):</span>
                <span className="font-mono font-black text-sm">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="py-2.5 px-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">GST Tax Amount:</span>
                <span className="font-mono font-black text-sm">₹{totalGstAmount.toFixed(2)}</span>
              </div>
              <div className="py-2.5 px-3 flex justify-between items-center text-xs">
                <span className="font-bold text-gray-800">Round Off:</span>
                <span className="font-mono font-bold">
                  {invoice.roundOff >= 0 ? `+${invoice.roundOff.toFixed(2)}` : invoice.roundOff.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="py-3 px-3.5 bg-slate-50 border-t-2 border-black flex justify-between items-center">
              <span className="font-black uppercase tracking-wider text-sm text-black">Grand Total:</span>
              <span className="font-mono font-black text-xl text-black">
                {formatCurrency(invoice.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in Words Framed Box */}
        <div className="border-2 border-black p-3 bg-slate-50 text-xs flex items-center justify-between gap-4">
          <span className="font-extrabold text-black uppercase text-xs tracking-wider shrink-0">Amount in Words:</span>
          <div className="font-black text-black text-sm font-sans italic text-right capitalize">
            "{invoice.amountInWords || numberToWordsIndian(invoice.grandTotal)}"
          </div>
        </div>

        {/* Terms & Conditions and Authorized Signatory Framed Box */}
        <div className="border-2 border-black p-4 grid grid-cols-2 gap-6 text-xs text-black bg-white">
          <div className="space-y-1.5 border-r border-black pr-4">
            <h4 className="font-black text-black uppercase tracking-wide text-xs border-b border-black pb-1">Terms &amp; Conditions:</h4>
            <ol className="list-decimal list-inside space-y-1 font-semibold text-gray-800 text-[11px] leading-relaxed pt-0.5">
              <li>Goods once sold will not be taken back or exchanged.</li>
              <li>Interest @ 18% p.a. will be charged if bill is not paid within 15 days.</li>
              <li>Subject to Bengaluru Jurisdiction only.</li>
            </ol>
          </div>

          <div className="text-right flex flex-col justify-between items-end min-h-[85px] pl-2">
            <div className="font-black text-black uppercase tracking-wide text-xs">For {storeName}</div>
            <div className="border-t-2 border-black pt-1.5 w-52 text-center text-black font-black text-xs tracking-wider">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

