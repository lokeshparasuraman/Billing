import React from 'react';
import { SavedInvoice } from '../../types/billing';
import { formatCurrency, numberToWordsIndian } from '../../utils/calculations';
import '../../styles/print.css';

interface PrintableInvoiceProps {
  invoice: SavedInvoice;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice }) => {
  if (!invoice) return null;

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
      cgst: data.gstAmt / 2,
      sgst: data.gstAmt / 2,
      totalGst: data.gstAmt,
    };
  });

  return (
    <div className="print-invoice-wrapper font-sans text-black bg-white leading-tight">
      {/* ------------------- HEADER SECTION (PURE B&W) ------------------- */}
      <div className="border-b-2 border-black pb-3 mb-3">
        <div className="flex justify-between items-start">
          {/* Company Brand */}
          <div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-black text-white font-black text-lg flex items-center justify-center rounded-sm">
                OE
              </div>
              <h1 className="text-xl font-black tracking-tight text-black uppercase">
                OWSHIKA ENTERPRISES
              </h1>
            </div>
            <p className="text-[11px] font-bold text-black mt-1">
              Industrial Hardware, Fasteners, Electricals & Plumbing Supplies
            </p>
            <p className="text-[10px] text-black">
              #104, Industrial Main Road, Sector 3, Peenya, Bengaluru - 560058
            </p>
            <p className="text-[10px] text-black font-mono">
              GSTIN: 29ABCDE1234F1Z5 | Mob: +91 98450 99887 | Email: billing@owshika.com
            </p>
          </div>

          {/* TAX INVOICE BADGE */}
          <div className="text-right">
            <span className="inline-block border-2 border-black bg-white text-black font-black text-xs px-3 py-0.5 uppercase tracking-wider mb-2">
              TAX INVOICE
            </span>
            <div className="text-xs space-y-0.5 font-mono text-black">
              <div>
                <span className="font-sans font-medium">Invoice No:</span>{' '}
                <strong className="font-bold">{invoice.invoiceNumber}</strong>
              </div>
              <div>
                <span className="font-sans font-medium">Date:</span>{' '}
                <strong className="font-semibold">
                  {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>
              </div>
              <div>
                <span className="font-sans font-medium">Payment Mode:</span>{' '}
                <strong className="uppercase font-bold">{invoice.paymentMode}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details Box */}
        <div className="mt-3 p-2.5 rounded-sm border border-black grid grid-cols-2 gap-4 text-xs bg-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-black">
              Billed To:
            </span>
            <h3 className="font-bold text-black text-sm">{invoice.customerName}</h3>
            {invoice.customerAddress && (
              <p className="text-black text-[11px] mt-0.5 leading-snug">{invoice.customerAddress}</p>
            )}
          </div>
          <div className="text-right">
            {invoice.customerPhone && (
              <p className="text-black text-[11px] font-mono">
                <span className="font-sans">Phone:</span> {invoice.customerPhone}
              </p>
            )}
            <p className="text-black text-[10px] mt-1 font-mono">
              Place of Supply: Karnataka (29)
            </p>
          </div>
        </div>
      </div>

      {/* ------------------- REPEATABLE PRODUCT TABLE (PURE B&W) ------------------- */}
      <table className="print-table w-full text-left border-collapse border border-black mb-3 text-[11px]">
        <thead>
          <tr className="bg-white text-black font-black uppercase text-[10px] border-b-2 border-black">
            <th className="p-1.5 text-center border-r border-black w-8">#</th>
            <th className="p-1.5 border-r border-black w-28">Part / Service Code</th>
            <th className="p-1.5 border-r border-black">Description of Goods / Services</th>
            <th className="p-1.5 text-center border-r border-black w-16">HSN / SAC</th>
            <th className="p-1.5 text-right border-r border-black w-14">Qty</th>
            <th className="p-1.5 text-center border-r border-black w-12">Unit</th>
            <th className="p-1.5 text-right border-r border-black w-16">Rate (₹)</th>
            <th className="p-1.5 text-right border-r border-black w-12">Disc%</th>
            <th className="p-1.5 text-center border-r border-black w-12">GST%</th>
            <th className="p-1.5 text-right w-20">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id || idx} className="border-b border-black">
              <td className="p-1.5 text-center border-r border-black font-mono text-[10px]">
                {idx + 1}
              </td>
              <td className="p-1.5 border-r border-black font-mono text-[10px] font-bold text-black">
                {item.partNumber}
              </td>
              <td className="p-1.5 border-r border-black font-semibold text-black">
                {item.productName}
              </td>
              <td className="p-1.5 text-center border-r border-black font-mono text-[10px]">
                {item.hsn}
              </td>
              <td className="p-1.5 text-right border-r border-black font-mono font-bold text-black">
                {item.quantity}
              </td>
              <td className="p-1.5 text-center border-r border-black text-[10px] uppercase">
                {item.unit}
              </td>
              <td className="p-1.5 text-right border-r border-black font-mono">
                {item.price.toFixed(2)}
              </td>
              <td className="p-1.5 text-right border-r border-black font-mono text-[10px]">
                {item.discount ? `${item.discount}%` : '-'}
              </td>
              <td className="p-1.5 text-center border-r border-black font-mono text-[10px]">
                {item.gstRate}%
              </td>
              <td className="p-1.5 text-right font-mono font-bold text-black">
                {item.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ------------------- FINAL PAGE SUMMARY FOOTER (PURE B&W) ------------------- */}
      <div className="print-summary-footer space-y-3">
        {/* Amounts & Taxes Grid */}
        <div className="grid grid-cols-12 gap-3 text-xs">
          {/* Left Column: GST Summary Breakdown Table & Bank Info */}
          <div className="col-span-7 space-y-2">
            {/* GST Summary Table */}
            <div className="border border-black rounded-sm overflow-hidden bg-white">
              <div className="bg-white px-2 py-1 font-black text-[10px] uppercase text-black border-b border-black">
                GST Tax Summary Breakdown
              </div>
              <table className="w-full text-[10px] text-left">
                <thead>
                  <tr className="border-b border-black bg-white font-bold text-black">
                    <th className="p-1 text-center border-r border-black">Rate</th>
                    <th className="p-1 text-right border-r border-black">Taxable Amt</th>
                    <th className="p-1 text-right border-r border-black">CGST</th>
                    <th className="p-1 text-right border-r border-black">SGST</th>
                    <th className="p-1 text-right">Total Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono text-black">
                  {gstBreakdownList.map((g) => (
                    <tr key={g.rate}>
                      <td className="p-1 text-center font-bold border-r border-black">{g.rate}%</td>
                      <td className="p-1 text-right border-r border-black">₹{g.taxable.toFixed(2)}</td>
                      <td className="p-1 text-right border-r border-black">₹{g.cgst.toFixed(2)}</td>
                      <td className="p-1 text-right border-r border-black">₹{g.sgst.toFixed(2)}</td>
                      <td className="p-1 text-right font-bold">₹{g.totalGst.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bank Details Box */}
            <div className="border border-black rounded-sm p-2 text-[10px] bg-white">
              <span className="font-bold uppercase text-black block mb-0.5">
                Bank Details for NEFT / RTGS:
              </span>
              <div className="grid grid-cols-2 gap-x-2 font-mono text-black">
                <div>Bank Name: <strong>HDFC Bank Ltd</strong></div>
                <div>Account No: <strong>50200012345678</strong></div>
                <div>IFSC Code: <strong>HDFC0000123</strong></div>
                <div>Branch: <strong>Peenya Industrial Area</strong></div>
              </div>
            </div>
          </div>

          {/* Right Column: Total Calculations */}
          <div className="col-span-5 border border-black rounded-sm divide-y divide-black bg-white text-black">
            <div className="p-1.5 flex justify-between items-center">
              <span>Subtotal (Taxable):</span>
              <span className="font-mono font-semibold">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="p-1.5 flex justify-between items-center">
                <span>Total Discount:</span>
                <span className="font-mono font-bold">-₹{invoice.discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="p-1.5 flex justify-between items-center">
              <span>CGST Total:</span>
              <span className="font-mono">₹{invoice.cgstTotal.toFixed(2)}</span>
            </div>
            <div className="p-1.5 flex justify-between items-center">
              <span>SGST Total:</span>
              <span className="font-mono">₹{invoice.sgstTotal.toFixed(2)}</span>
            </div>
            <div className="p-1.5 flex justify-between items-center text-[10px]">
              <span>Round Off:</span>
              <span className="font-mono">
                {invoice.roundOff >= 0 ? `+${invoice.roundOff.toFixed(2)}` : invoice.roundOff.toFixed(2)}
              </span>
            </div>
            <div className="p-2 border-t-2 border-black flex justify-between items-center bg-white">
              <span className="font-black uppercase tracking-wider text-xs text-black">Grand Total:</span>
              <span className="font-mono font-black text-base text-black">
                {formatCurrency(invoice.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="border border-black rounded-sm p-2 bg-white text-xs">
          <span className="font-bold text-black uppercase text-[10px]">Amount in Words:</span>
          <div className="font-bold text-black italic mt-0.5">
            "{invoice.amountInWords || numberToWordsIndian(invoice.grandTotal)}"
          </div>
        </div>

        {/* Terms & Conditions and Authorized Signatory */}
        <div className="pt-3 grid grid-cols-2 gap-4 text-[10px] text-black">
          <div>
            <h4 className="font-bold text-black uppercase mb-1">Terms & Conditions:</h4>
            <ol className="list-decimal list-inside space-y-0.5 font-medium">
              <li>Goods once sold will not be taken back or exchanged.</li>
              <li>Interest @ 18% p.a. will be charged if bill is not paid within 15 days.</li>
              <li>Subject to Bengaluru Jurisdiction only.</li>
            </ol>
          </div>

          <div className="text-right flex flex-col justify-between items-end min-h-[65px]">
            <div className="font-black text-black uppercase">For OWSHIKA ENTERPRISES</div>
            <div className="border-t border-black pt-1 w-48 text-center text-black font-bold">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
