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
  const ownerName = store?.ownerName || 'C.Perumal';
  const email = store?.email || 'owshikaentt@gmail.com';
  const gstin = store?.gstin || '33BAEPP2449B1Z3';
  const address = store?.address || '4/783, Kothumai Mill, Near New Bus Stand, Salem Main Road, Dharmapuri - 636701';
  const phone = store?.phone || '+91 9445662637';
  const bankName = store?.bankName || 'STATE BANK OF INDIA';
  const accountNumber = store?.accountNumber || '41234567890';
  const ifscCode = store?.ifscCode || 'SBIN0001234';
  const branchName = store?.branchName || 'Dharmapuri Main Branch';
  const upiId = store?.upiId || 'owshika@sbi';

  // Dynamically compute Place of Supply state from GSTIN prefix
  const gstStateMap: Record<string, string> = {
    '33': 'Tamil Nadu (33)'

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
      className="print-invoice-wrapper text-black bg-white leading-normal p-2"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      {/* ------------------- UNIFIED STORE HEADER & META ------------------- */}
      <div className="border-2 border-black p-4 mb-3">
        <div className="flex justify-between items-start gap-4 pb-3 border-b-2 border-black">
          {/* Company Brand & Contact Details (Single Source of Truth - No Duplicate Boxes) */}
          <div className="space-y-1 max-w-[65%]">
            <h1 className="text-2xl font-black tracking-tight text-black uppercase">
              {storeName}
            </h1>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Driver Seats Dealer Seating&amp;Spares
            </p>
            <p className="text-xs text-black font-medium leading-snug">
              {address}
            </p>
            <div className="text-xs text-black font-mono font-bold pt-1 space-y-0.5">
              <div>Proprietor: <span className="font-sans font-bold text-black">{ownerName}</span> | Mob: <span className="font-black">{phone}</span></div>
              <div>GSTIN: <span className="font-black">{gstin}</span> | Place of Supply: <span className="font-sans font-bold">{placeOfSupply}</span></div>
              <div>Email: <span className="font-black">{email}</span></div>
            </div>
          </div>

          {/* INVOICE BADGE & META */}
          <div className="text-right flex flex-col items-end shrink-0">
            <div className="border-2 border-black bg-slate-100 text-black font-black text-sm px-4 py-1.5 uppercase tracking-widest mb-2 shadow-sm">
              {invoice.billType === 'TRANSPORT' ? 'TRANSPORT WAYBILL' : 'TAX INVOICE'}
            </div>
            <div className="text-xs space-y-1 font-mono text-black text-right bg-white p-2.5 border border-black min-w-[210px]">
              <div className="flex justify-between gap-3">
                <span className="font-sans font-semibold text-gray-700">Invoice No:</span>
                <strong className="font-black text-black text-sm">{invoice.invoiceNumber}</strong>
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

        {/* TRANSPORT DETAILS (ONLY DISPLAYED FOR TRANSPORT BILLS) */}
        {invoice.billType === 'TRANSPORT' && (
          <div className="mt-3 border-2 border-black p-3 text-xs bg-white space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider block text-gray-700 border-b border-black pb-1 mb-2">
              Transport / Waybill Address &amp; Delivery Details:
            </span>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="font-sans font-bold text-gray-700 block text-[10px] uppercase tracking-wider">From Address:</span>
                <strong className="font-sans font-extrabold text-black text-xs block leading-snug whitespace-pre-line pt-0.5">
                  {invoice.transportDetails?.fromLocation || address}
                </strong>
              </div>
              <div>
                <span className="font-sans font-bold text-gray-700 block text-[10px] uppercase tracking-wider">To Address:</span>
                <strong className="font-sans font-extrabold text-black text-xs block leading-snug whitespace-pre-line pt-0.5">
                  {invoice.transportDetails?.toLocation || 'N/A'}
                </strong>
              </div>
              {invoice.transportDetails?.vehicleNumber && (
                <div>
                  <span className="font-sans font-bold text-gray-700 block text-[10px] uppercase tracking-wider">Vehicle / LR No:</span>
                  <strong className="font-black text-black text-xs pt-0.5 block">{invoice.transportDetails.vehicleNumber}</strong>
                </div>
              )}
              {invoice.transportDetails?.transporterName && (
                <div>
                  <span className="font-sans font-bold text-gray-700 block text-[10px] uppercase tracking-wider">Transporter:</span>
                  <strong className="font-bold text-black text-xs pt-0.5 block">{invoice.transportDetails.transporterName}</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ------------------- PRODUCT & SERVICE ITEMS TABLE ------------------- */}
      <table className="print-table w-full text-left border-collapse border-2 border-black mb-3 text-xs">
        <thead>
          <tr className="bg-slate-100 text-black font-black uppercase text-[11px] border-b-2 border-black">
            <th className="py-2 px-2 text-center border border-black w-10">S.No</th>
            <th className="py-2 px-2.5 border border-black w-32 font-sans">Part</th>
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
            <tr key={item.id || idx} className={`border-b border-black ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
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

      {/* ------------------- SUMMARY & FOOTER ------------------- */}
      <div className="print-summary-footer space-y-3">
        {/* Amounts & Taxes Grid Box */}
        <div className="grid grid-cols-12 gap-3 text-xs">
          {/* Left Column: GST Summary Breakdown Table & Bank Info */}
          <div className="col-span-7 space-y-2.5">
            {/* GST Summary Table */}
            <div className="border-2 border-black overflow-hidden bg-white">
              <div className="bg-slate-100 px-3 py-1.5 font-black text-xs uppercase text-black border-b-2 border-black tracking-wide">
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
            <div className="border-2 border-black p-2.5 text-xs bg-white space-y-1">
              <span className="font-black uppercase tracking-wide text-black block border-b border-black pb-1 text-[11px]">
                Bank Details for NEFT / RTGS / Online Transfer:
              </span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-black text-xs pt-0.5">
                <div><span className="font-sans text-gray-600 text-[10px] block">Bank Name:</span> <strong>{bankName}</strong></div>
                <div><span className="font-sans text-gray-600 text-[10px] block">Account No:</span> <strong>{accountNumber}</strong></div>
                <div><span className="font-sans text-gray-600 text-[10px] block">IFSC Code:</span> <strong>{ifscCode}</strong></div>
                <div><span className="font-sans text-gray-600 text-[10px] block">Branch / UPI:</span> <strong>{branchName} {upiId ? `(${upiId})` : ''}</strong></div>
              </div>
            </div>
          </div>

          {/* Right Column: Total Calculations Box */}
          <div className="col-span-5 border-2 border-black divide-y-2 divide-black bg-white text-black flex flex-col justify-between">
            <div className="space-y-0 divide-y divide-black text-xs">
              <div className="py-2 px-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">Subtotal (Taxable):</span>
                <span className="font-mono font-black text-sm">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="py-2 px-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">GST Tax Amount:</span>
                <span className="font-mono font-black text-sm">₹{totalGstAmount.toFixed(2)}</span>
              </div>
              <div className="py-2 px-3 flex justify-between items-center text-xs">
                <span className="font-bold text-gray-800">Round Off:</span>
                <span className="font-mono font-bold">
                  {invoice.roundOff >= 0 ? `+${invoice.roundOff.toFixed(2)}` : invoice.roundOff.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="py-2.5 px-3.5 bg-slate-100 border-t-2 border-black flex justify-between items-center">
              <span className="font-black uppercase tracking-wider text-sm text-black">Grand Total:</span>
              <span className="font-mono font-black text-xl text-black">
                {formatCurrency(invoice.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in Words Framed Box */}
        <div className="border-2 border-black p-2.5 bg-slate-50 text-xs flex items-center justify-between gap-4">
          <span className="font-extrabold text-black uppercase text-xs tracking-wider shrink-0">Amount in Words:</span>
          <div className="font-black text-black text-sm font-sans italic text-right capitalize">
            "{invoice.amountInWords || numberToWordsIndian(invoice.grandTotal)}"
          </div>
        </div>

        {/* Terms & Conditions and Authorized Signatory Framed Box */}
        <div className="border-2 border-black p-3.5 grid grid-cols-2 gap-6 text-xs text-black bg-white">
          <div className="space-y-1 border-r border-black pr-4">
            <h4 className="font-black text-black uppercase tracking-wide text-xs border-b border-black pb-1">Terms &amp; Conditions:</h4>
            <ol className="list-decimal list-inside space-y-0.5 font-semibold text-gray-800 text-[11px] leading-relaxed pt-0.5">
              <li>Goods once sold will not be taken back or exchanged.</li>
              <li>Interest @ 18% p.a. will be charged if bill is not paid within 15 days.</li>
              <li>Subject to Dharmapuri Jurisdiction only.</li>
            </ol>
          </div>

          <div className="text-right flex flex-col justify-between items-end min-h-[80px] pl-2">
            <div>
              <div className="font-black text-black uppercase tracking-wide text-xs">For {storeName}</div>
              <div className="text-[11px] font-bold text-gray-800 font-sans mt-0.5">Prop: {ownerName}</div>
            </div>
            <div className="border-t-2 border-black pt-1 w-48 text-center text-black font-black text-xs tracking-wider">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


