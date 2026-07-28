import { InvoiceItemRow, InvoiceSummary } from '../types/billing';

/**
 * Calculates item row totals (taxable amount, GST amount, CGST/SGST split, line total)
 * Supports both INCLUSIVE (Price includes GST) and EXCLUSIVE (GST added on top of Price) modes.
 */
export function calculateRowTotals(row: InvoiceItemRow): InvoiceItemRow {
  const qty = typeof row.quantity === 'number' ? Math.max(0, row.quantity) : 0;
  const price = typeof row.price === 'number' ? Math.max(0, row.price) : 0;
  const discountPct = typeof row.discount === 'number' ? Math.max(0, Math.min(100, row.discount)) : 0;
  const gstRate = typeof row.gstRate === 'number' ? Math.max(0, row.gstRate) : 0;
  const isInclusive = row.taxMode === 'INCLUSIVE';

  let taxableAmount = 0;
  let gstAmount = 0;
  let total = 0;
  let discountAmount = 0;

  if (isInclusive) {
    // Owner entered the overall price inclusive of GST
    const grossInclusive = qty * price;
    discountAmount = (grossInclusive * discountPct) / 100;
    const netInclusive = grossInclusive - discountAmount;

    // Extract base price before GST
    const divisor = 1 + gstRate / 100;
    taxableAmount = divisor > 0 ? netInclusive / divisor : netInclusive;
    gstAmount = netInclusive - taxableAmount;
    total = netInclusive;
  } else {
    // Owner entered tax-exclusive price
    const grossExclusive = qty * price;
    discountAmount = (grossExclusive * discountPct) / 100;
    taxableAmount = grossExclusive - discountAmount;
    gstAmount = (taxableAmount * gstRate) / 100;
    total = taxableAmount + gstAmount;
  }

  const cgstRate = gstRate / 2;
  const sgstRate = gstRate / 2;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;

  return {
    ...row,
    cgstRate,
    sgstRate,
    cgstAmount: Number(cgstAmount.toFixed(2)),
    sgstAmount: Number(sgstAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

/**
 * Calculates invoice summary totals (Subtotal, GST split, Round Off, Grand Total, Amount in Words)
 */
export function calculateInvoiceSummary(rows: InvoiceItemRow[]): InvoiceSummary {
  let subtotal = 0;
  let discountTotal = 0;
  let totalGst = 0;

  rows.forEach((r) => {
    const calculated = calculateRowTotals(r);
    const qty = typeof r.quantity === 'number' ? r.quantity : 0;
    const price = typeof r.price === 'number' ? r.price : 0;
    const discountPct = typeof r.discount === 'number' ? r.discount : 0;

    let disc = 0;
    if (r.taxMode === 'INCLUSIVE') {
      disc = (qty * price * discountPct) / 100;
    } else {
      disc = (qty * price * discountPct) / 100;
    }

    subtotal += calculated.taxableAmount;
    discountTotal += disc;
    totalGst += calculated.gstAmount;
  });

  const cgstTotal = totalGst / 2;
  const sgstTotal = totalGst / 2;
  const exactGrandTotal = subtotal + totalGst;
  const roundedGrandTotal = Math.round(exactGrandTotal);
  const roundOff = roundedGrandTotal - exactGrandTotal;
  const amountInWords = numberToWordsIndian(roundedGrandTotal);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number(discountTotal.toFixed(2)),
    cgstTotal: Number(cgstTotal.toFixed(2)),
    sgstTotal: Number(sgstTotal.toFixed(2)),
    igstTotal: 0,
    roundOff: Number(roundOff.toFixed(2)),
    grandTotal: roundedGrandTotal,
    amountInWords,
  };
}

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n];

  const tenVal = Math.floor(n / 10);
  const oneVal = n % 10;
  if (n < 100) {
    return (tens[tenVal] + (oneVal > 0 ? " " + ones[oneVal] : "")).trim();
  }

  const hundredVal = Math.floor(n / 100);
  const remainder = n % 100;
  return (
    ones[hundredVal] +
    " Hundred" +
    (remainder > 0 ? " " + convertLessThanThousand(remainder) : "")
  ).trim();
}

export function numberToWordsIndian(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "";
  if (num === 0) return "Rupees Zero Only";

  const absoluteNum = Math.abs(num);
  const wholePart = Math.floor(absoluteNum);
  const decimalPart = Math.round((absoluteNum - wholePart) * 100);

  if (wholePart === 0 && decimalPart === 0) return "Rupees Zero Only";

  let words = "";

  const crore = Math.floor(wholePart / 10000000);
  let rem = wholePart % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const hundred = rem;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + " Crore ";
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + " Thousand ";
  }
  if (hundred > 0) {
    words += convertLessThanThousand(hundred) + " ";
  }

  words = words.trim();
  let result = "Rupees " + (words ? words : "Zero");

  if (decimalPart > 0) {
    result += " and Paisa " + convertLessThanThousand(decimalPart);
  }

  result += " Only";
  return result;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Ensures price input strictly accepts non-negative numbers/decimals only (e.g., 125, 45.50).
 * Rejects all alphabetic characters (abc, e, E) and special characters.
 */
export function sanitizePriceInput(val: string | number): string {
  if (typeof val === 'number') return isNaN(val) ? '' : String(val);
  if (!val) return '';
  // Strip out all characters except digits and decimal point
  let clean = String(val).replace(/[^0-9.]/g, '');
  // Retain only the first decimal point
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return clean;
}

export function handlePriceKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
  // Block non-numeric characters e, E, +, - allowed by HTML5 number inputs
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
}
