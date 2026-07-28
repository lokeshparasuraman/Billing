import { create } from 'zustand';
import { InvoiceHeaderDetails, InvoiceItemRow, Product, SavedInvoice } from '../types/billing';
import { calculateRowTotals } from '../utils/calculations';
import { updateStoreSettingsApi } from '../services/api';

export interface StoreDetails {
  storeName: string;
  ownerName?: string;
  email?: string;
  gstin: string;
  phone: string;
  address: string;
}

const defaultStoreDetails: StoreDetails = {
  storeName: 'OWSHIKA ENTERPRISES',
  ownerName: 'C.Perumal',
  email: 'owshikaentt@gmail.com',
  gstin: '33BAEPP2449B1Z3',
  phone: '+91 9445662637',
  address: '4/783, Kothumai Mill, Near New Bus Stand, Salem Main Road, Dharmapuri - 636701',
};

function loadStoreDetails(): StoreDetails {
  try {
    const saved = localStorage.getItem('store_details');
    if (saved) {
      return { ...defaultStoreDetails, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load store details from localStorage');
  }
  return defaultStoreDetails;
}

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
  storeDetails: StoreDetails;
  rows: InvoiceItemRow[];
  activeRowIndex: number;
  activeCellField: string;
  isSaving: boolean;
  validationError: string | null;
  savedInvoiceForPrint: SavedInvoice | null;
  isPrintModalOpen: boolean;

  // Actions
  setHeaderField: <K extends keyof InvoiceHeaderDetails>(field: K, value: InvoiceHeaderDetails[K]) => void;
  setTransportField: <K extends keyof import('../types/billing').TransportDetails>(field: K, value: import('../types/billing').TransportDetails[K]) => void;
  setStoreDetails: (details: Partial<StoreDetails>) => void;
  setRows: (rows: InvoiceItemRow[]) => void;
  addRow: () => void;
  addLabourRow: (name?: string, price?: number) => void;
  addMiscSparesRow: (name?: string, price?: number) => void;
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
  billType: 'CUSTOMER',
  invoiceNumber: 'OE-2026-0001',
  invoiceDate: new Date().toISOString().split('T')[0],
  customerName: 'Owshika Enterprises',
  customerPhone: '',
  customerAddress: '',
  paymentMode: 'CASH',
  transportDetails: {
    fromLocation: 'Peenya, Bengaluru',
    toLocation: '',
    vehicleNumber: '',
    transporterName: '',
  },
};

export const useBillingStore = create<BillingState>((set, get) => ({
  header: initialHeader,
  storeDetails: loadStoreDetails(),
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

  setTransportField: (field, value) => {
    set((state) => ({
      header: {
        ...state.header,
        transportDetails: {
          ...state.header.transportDetails,
          [field]: value,
        },
      },
    }));
  },

  setStoreDetails: (updates) => {
    set((state) => {
      const updated = { ...state.storeDetails, ...updates };
      try {
        localStorage.setItem('store_details', JSON.stringify(updated));
        updateStoreSettingsApi(updated).catch(() => {});
      } catch (e) {
        console.error('Failed to save store details to database/localStorage:', e);
      }

      // Automatically update transport fromLocation to match newly updated shop address
      const currentFrom = state.header.transportDetails?.fromLocation;
      const isDefaultOrOld = !currentFrom || currentFrom === state.storeDetails.address || currentFrom === 'Peenya, Bengaluru';
      const newFrom = isDefaultOrOld && updated.address ? updated.address : currentFrom;

      return {
        storeDetails: updated,
        header: {
          ...state.header,
          transportDetails: {
            ...state.header.transportDetails,
            fromLocation: newFrom || updated.address,
          },
        },
      };
    });
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

  addMiscSparesRow: (name?: string, price?: number) => {
    set((state) => {
      const miscRow: InvoiceItemRow = {
        rowId: `row_${Date.now()}_misc`,
        itemType: 'SPARES',
        productId: '',
        partNumber: 'MISC-SPARES',
        name: name || 'Miscellaneous Hardware Spares',
        hsn: 'N/A',
        unit: 'PCS',
        quantity: 1,
        price: price !== undefined ? price : '',
        discount: 0,
        gstRate: 0,
        gstAmount: 0,
        taxableAmount: 0,
        total: 0,
      };
      const recalculated = calculateRowTotals(miscRow);

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
        activeCellField: 'price',
      };
    });
  },

  removeRow: (index: number) => {
    set((state) => {
      if (state.rows.length <= 1) {
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
