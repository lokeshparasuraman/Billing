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
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  upiId?: string;
}

const defaultStoreDetails: StoreDetails = {
  storeName: 'OWSHIKA ENTERPRISES',
  ownerName: 'C.Perumal',
  email: 'owshikaentt@gmail.com',
  gstin: '33BAEPP2449B1Z3',
  phone: '+91 9445662637',
  address: '4/783, Roller Flour Mills, Near New Bus Stand, Salem Main Road, Dharmapuri - 636701',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  upiId: '',
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

function loadLastUsedGstRate(): number {
  try {
    const saved = localStorage.getItem('owshika_last_gst');
    if (saved !== null && saved !== undefined && saved !== '') {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch (e) {}
  return 18;
}

function createEmptyRow(idSuffix?: number, defaultGstRate: number = 18): InvoiceItemRow {
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
    gstRate: defaultGstRate,
    gstAmount: 0,
    taxableAmount: 0,
    total: 0,
  };
}

interface BillingState {
  editingInvoiceId: string | null;
  lastUsedGstRate: number;
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
  loadInvoiceForEditing: (invoice: SavedInvoice) => void;
  setLastUsedGstRate: (gstRate: number) => void;
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
    fromLocation: defaultStoreDetails.address,
    toLocation: '',
    vehicleNumber: '',
    transporterName: '',
  },
};

export const useBillingStore = create<BillingState>((set, get) => ({
  editingInvoiceId: null,
  lastUsedGstRate: loadLastUsedGstRate(),
  header: initialHeader,
  storeDetails: loadStoreDetails(),
  rows: [createEmptyRow(1, loadLastUsedGstRate())],
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
      const newRows = [...state.rows, createEmptyRow(state.rows.length + 1, state.lastUsedGstRate)];
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
        gstRate: state.lastUsedGstRate || 0,
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
          rows: [createEmptyRow(1, state.lastUsedGstRate)],
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
      let nextGst = state.lastUsedGstRate;
      if (updates.gstRate !== undefined && !isNaN(Number(updates.gstRate)) && Number(updates.gstRate) >= 0) {
        nextGst = Number(updates.gstRate);
        try {
          localStorage.setItem('owshika_last_gst', String(nextGst));
        } catch (e) {}
      }

      const updatedRows = [...state.rows];
      const targetRow = { ...updatedRows[index], ...updates };
      const recalculated = calculateRowTotals(targetRow);
      updatedRows[index] = recalculated;
      return { rows: updatedRows, lastUsedGstRate: nextGst };
    });
  },

  selectProductForRow: (index: number, product: Product) => {
    set((state) => {
      let nextGst = state.lastUsedGstRate;
      if (product.gst !== undefined && !isNaN(Number(product.gst)) && Number(product.gst) >= 0) {
        nextGst = Number(product.gst);
        try {
          localStorage.setItem('owshika_last_gst', String(nextGst));
        } catch (e) {}
      }

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
      return { rows: updatedRows, lastUsedGstRate: nextGst };
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
    set((state) => ({
      editingInvoiceId: null,
      header: {
        ...initialHeader,
        invoiceDate: new Date().toISOString().split('T')[0],
        transportDetails: {
          ...initialHeader.transportDetails,
          fromLocation: state.storeDetails.address || defaultStoreDetails.address,
        },
      },
      rows: [createEmptyRow(1, state.lastUsedGstRate)],
      activeRowIndex: 0,
      activeCellField: 'partNumber',
      validationError: null,
    }));
  },

  resetWithNextInvoiceNumber: (nextNum: string) => {
    get().clearBillingForm();
    if (nextNum) {
      get().setHeaderField('invoiceNumber', nextNum);
    }
  },

  loadInvoiceForEditing: (invoice: SavedInvoice) => {
    const loadedRows: InvoiceItemRow[] = (invoice.items || []).map((item, idx) => {
      const isLabour = item.partNumber === 'LABOUR' || (item as any).itemType === 'LABOUR';
      const isMisc = item.partNumber === 'MISC-SPARES' || (item as any).itemType === 'SPARES_MISC';

      const row: InvoiceItemRow = {
        rowId: (item as any).id || `row_${Date.now()}_edit_${idx}`,
        itemType: isLabour ? 'LABOUR' : 'SPARES',
        productId: (item as any).productId || '',
        partNumber: item.partNumber || (isLabour ? 'LABOUR' : (isMisc ? 'MISC-SPARES' : 'N/A')),
        name: (item as any).productName || (item as any).name || 'Item',
        hsn: item.hsn || 'N/A',
        unit: item.unit || (isLabour ? 'JOB' : 'PCS'),
        quantity: item.quantity !== undefined ? item.quantity : 1,
        price: item.price !== undefined ? item.price : '',
        discount: item.discount !== undefined ? item.discount : 0,
        gstRate: item.gstRate !== undefined ? item.gstRate : 18,
        gstAmount: item.gstAmount || 0,
        taxableAmount: (item as any).taxableAmount || 0,
        total: item.total || 0,
      };
      return calculateRowTotals(row);
    });

    const storeAddress = get().storeDetails.address || defaultStoreDetails.address;

    set({
      editingInvoiceId: invoice.id,
      header: {
        billType: (invoice.billType as any) || 'CUSTOMER',
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : new Date().toISOString().split('T')[0],
        customerName: invoice.customerName || 'Walk-in Customer',
        customerPhone: invoice.customerPhone || '',
        customerAddress: invoice.customerAddress || '',
        paymentMode: (invoice.paymentMode as any) || 'CASH',
        transportDetails: invoice.transportDetails ? {
          fromLocation: invoice.transportDetails.fromLocation || storeAddress,
          toLocation: invoice.transportDetails.toLocation || '',
          vehicleNumber: invoice.transportDetails.vehicleNumber || '',
          transporterName: invoice.transportDetails.transporterName || '',
        } : {
          fromLocation: storeAddress,
          toLocation: '',
          vehicleNumber: '',
          transporterName: '',
        },
      },
      rows: loadedRows.length > 0 ? loadedRows : [createEmptyRow(1, get().lastUsedGstRate)],
      activeRowIndex: 0,
      activeCellField: 'partNumber',
      validationError: null,
    });
  },

  setLastUsedGstRate: (gstRate: number) => {
    if (!isNaN(gstRate) && gstRate >= 0) {
      try {
        localStorage.setItem('owshika_last_gst', String(gstRate));
      } catch (e) {}
      set({ lastUsedGstRate: gstRate });
    }
  },
}));
