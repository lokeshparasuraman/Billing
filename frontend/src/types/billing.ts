export interface Product {
  id: string;
  partNumber: string;
  name: string;
  hsn: string;
  gst: number;
  price: number;
  unit: string;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'CREDIT';

export interface InvoiceItemRow {
  rowId: string;
  itemType?: 'PRODUCT' | 'LABOUR';
  taxMode?: 'EXCLUSIVE' | 'INCLUSIVE';
  productId?: string;
  partNumber: string;
  name: string;
  hsn: string;
  unit: string;
  quantity: number | '';
  price: number | ''; // Entered unit price (Exclusive or Inclusive depending on taxMode)
  discount: number | ''; // Percentage
  gstRate: number; // Overall GST Percentage (e.g. 18)
  cgstRate?: number; // Half of GST (e.g. 9)
  sgstRate?: number; // Half of GST (e.g. 9)
  cgstAmount?: number;
  sgstAmount?: number;
  gstAmount: number;
  taxableAmount: number; // Base Price before GST
  total: number; // Final Line Total
}

export interface InvoiceHeaderDetails {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMode: PaymentMode;
}

export interface InvoiceSummary {
  subtotal: number;
  discountTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
}

export interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMode: PaymentMode;
  subtotal: number;
  discountTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  roundOff: number;
  grandTotal: number;
  amountInWords?: string;
  createdAt: string;
  items: Array<{
    id: string;
    partNumber: string;
    productName: string;
    hsn: string;
    unit: string;
    quantity: number;
    price: number;
    discount: number;
    gstRate: number;
    gstAmount: number;
    total: number;
  }>;
}
