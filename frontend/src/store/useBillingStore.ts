import { create } from 'zustand';
import { InvoiceHeaderDetails, InvoiceItemRow, Product, SavedInvoice } from '../types/billing';
import { calculateRowTotals } from '../utils/calculations';

function createEmptyRow(idSuffix?: number): InvoiceItemRow {
  return {
    rowId: `row_${Date.now()}_${idSuffix || Math.floor(Math.random() * 1000)}`,
    productId: '',
    partNumber: '',
    name: '',
    hsn: '',
    unit: 'PCS',
    quantity: 1,
    price: '',
    discount: 0,
    gstRate: 18,
    gstAmount: 0,
    taxableAmount: 0,
    total: 0,
  };
}

interface BillingState {
  header: InvoiceHeaderDetails;
  rows: InvoiceItemRow[];
  activeRowIndex: number;
  activeCellField: string;
  isSaving: boolean;
  validationError: string | null;
  savedInvoiceForPrint: SavedInvoice | null;
  isPrintModalOpen: boolean;

  // Actions
  setHeaderField: <K extends keyof InvoiceHeaderDetails>(field: K, value: InvoiceHeaderDetails[K]) => void;
  setRows: (rows: InvoiceItemRow[]) => void;
  addRow: () => void;
  addLabourRow: (name?: string, price?: number) => void;
  removeRow: (index: number) => void;
  updateRow: (index: number, updates: Partial<InvoiceItemRow>) => void;
  selectProductForRow: (index: number, product: Product) => void;
  setActiveCell: (rowIndex: number, field: string) => void;
  setValidationError: (msg: string | null) => void;
  setSavedInvoiceForPrint: (invoice: SavedInvoice | null) => void;
  setIsPrintModalOpen: (open: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  clearBillingForm: () => void;
  resetWithNextInvoiceNumber: (nextNum: string) => void;
}

const initialHeader: InvoiceHeaderDetails = {
  invoiceNumber: 'OE-2026-0001',
  invoiceDate: new Date().toISOString().split('T')[0],
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  paymentMode: 'CASH',
};

export const useBillingStore = create<BillingState>((set, get) => ({
  header: initialHeader,
  rows: [createEmptyRow(1), createEmptyRow(2), createEmptyRow(3)],
  activeRowIndex: 0,
  activeCellField: 'partNumber',
  isSaving: false,
  validationError: null,
  savedInvoiceForPrint: null,
  isPrintModalOpen: false,

  setHeaderField: (field, value) => {
    set((state) => ({
      header: {
        ...state.header,
        [field]: value,
      },
    }));
  },

  setRows: (rows) => set({ rows }),

  addRow: () => {
    set((state) => {
      const newRows = [...state.rows, createEmptyRow(state.rows.length + 1)];
      return {
        rows: newRows,
        activeRowIndex: newRows.length - 1,
        activeCellField: 'partNumber',
      };
    });
  },

  addLabourRow: (name?: string, price?: number) => {
    set((state) => {
      const labourRow: InvoiceItemRow = {
        rowId: `row_${Date.now()}_labour`,
        itemType: 'LABOUR',
        productId: '',
        partNumber: 'LABOUR',
        name: name || 'Labour Charges',
        hsn: 'N/A',
        unit: 'JOB',
        quantity: 1,
        price: price !== undefined ? price : '',
        discount: 0,
        gstRate: 0,
        gstAmount: 0,
        taxableAmount: 0,
        total: 0,
      };
      const recalculated = calculateRowTotals(labourRow);

      // If the last row is completely blank, replace it instead of appending
      const currentRows = [...state.rows];
      if (
        currentRows.length > 0 &&
        !currentRows[currentRows.length - 1].name &&
        !currentRows[currentRows.length - 1].partNumber
      ) {
        currentRows[currentRows.length - 1] = recalculated;
      } else {
        currentRows.push(recalculated);
      }

      return {
        rows: currentRows,
        activeRowIndex: currentRows.length - 1,
        activeCellField: 'name',
      };
    });
  },

  removeRow: (index: number) => {
    set((state) => {
      if (state.rows.length <= 1) {
        // Keep at least 1 empty row
        return {
          rows: [createEmptyRow(1)],
          activeRowIndex: 0,
        };
      }
      const updated = state.rows.filter((_, i) => i !== index);
      const nextIndex = Math.min(index, updated.length - 1);
      return {
        rows: updated,
        activeRowIndex: nextIndex,
      };
    });
  },

  updateRow: (index: number, updates: Partial<InvoiceItemRow>) => {
    set((state) => {
      const updatedRows = [...state.rows];
      const targetRow = { ...updatedRows[index], ...updates };
      const recalculated = calculateRowTotals(targetRow);
      updatedRows[index] = recalculated;
      return { rows: updatedRows };
    });
  },

  selectProductForRow: (index: number, product: Product) => {
    set((state) => {
      const updatedRows = [...state.rows];
      const rowToFill: InvoiceItemRow = {
        ...updatedRows[index],
        productId: product.id,
        partNumber: product.partNumber,
        name: product.name,
        hsn: product.hsn,
        unit: product.unit,
        price: product.price,
        gstRate: product.gst,
        quantity: updatedRows[index].quantity || 1,
        discount: updatedRows[index].discount || 0,
      };
      updatedRows[index] = calculateRowTotals(rowToFill);
      return { rows: updatedRows };
    });
  },

  setActiveCell: (rowIndex: number, field: string) => {
    set({ activeRowIndex: rowIndex, activeCellField: field });
  },

  setValidationError: (msg: string | null) => set({ validationError: msg }),

  setSavedInvoiceForPrint: (invoice: SavedInvoice | null) => set({ savedInvoiceForPrint: invoice }),

  setIsPrintModalOpen: (open: boolean) => set({ isPrintModalOpen: open }),

  setIsSaving: (saving: boolean) => set({ isSaving: saving }),

  clearBillingForm: () => {
    set({
      header: {
        ...initialHeader,
        invoiceDate: new Date().toISOString().split('T')[0],
      },
      rows: [createEmptyRow(1), createEmptyRow(2), createEmptyRow(3)],
      activeRowIndex: 0,
      activeCellField: 'partNumber',
      validationError: null,
    });
  },

  resetWithNextInvoiceNumber: (nextNum: string) => {
    set((state) => ({
      header: {
        ...initialHeader,
        invoiceNumber: nextNum,
        invoiceDate: new Date().toISOString().split('T')[0],
      },
      rows: [createEmptyRow(1), createEmptyRow(2), createEmptyRow(3)],
      activeRowIndex: 0,
      activeCellField: 'partNumber',
      validationError: null,
    }));
  },
}));
