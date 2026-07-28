import axios from 'axios';
import { Product, Customer, SavedInvoice } from '../types/billing';

import { AuthResponse, User } from '../types/auth';

const PROD_BASE = (import.meta as any).env?.VITE_API_URL || '';

export const getApiBaseUrl = (): string => {
  if (PROD_BASE && typeof PROD_BASE === 'string' && PROD_BASE.trim() !== '') {
    const cleanUrl = PROD_BASE.trim().replace(/\/$/, '');
    if (cleanUrl.endsWith('/api')) {
      return cleanUrl;
    }
    return `${cleanUrl}/api`;
  }
  return '/api';
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = typeof window !== 'undefined' ? localStorage.getItem('owshika_auth_token') : null;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', { email, password, name });
  return response.data;
};

export const getMeApi = async (): Promise<User> => {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.data.user;
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>(`/products/search`, {
      params: { q: query },
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    console.warn('PostgreSQL API search products warning:', error);
  }
  const local = localStorage.getItem('cached_products');
  const products: Product[] = local ? JSON.parse(local) : [];
  const q = query.toLowerCase().trim();
  if (!q) return products.slice(0, 20);
  return products
    .filter(
      (p) =>
        p.partNumber.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.hsn.toLowerCase().includes(q)
    )
    .slice(0, 20);
};

export const syncOfflineLocalDataToBackend = async (): Promise<void> => {
  try {
    const localProductsRaw = localStorage.getItem('cached_products');
    if (localProductsRaw) {
      const localProducts: Product[] = JSON.parse(localProductsRaw);
      if (Array.isArray(localProducts) && localProducts.length > 0) {
        for (const prod of localProducts) {
          if (prod.partNumber) {
            try {
              await api.post('/products', {
                partNumber: prod.partNumber,
                name: prod.name,
                hsn: prod.hsn,
                gst: prod.gst,
                price: prod.price,
                unit: prod.unit,
                stock: prod.stock,
              });
            } catch (e) {
              // Ignore if product already exists in DB
            }
          }
        }
      }
    }

    const localInvoicesRaw = localStorage.getItem('cached_invoices');
    if (localInvoicesRaw) {
      const localInvoices: SavedInvoice[] = JSON.parse(localInvoicesRaw);
      if (Array.isArray(localInvoices) && localInvoices.length > 0) {
        for (const inv of localInvoices) {
          if (inv.invoiceNumber && inv.items && inv.items.length > 0) {
            try {
              await api.post('/invoices', {
                invoiceNumber: inv.invoiceNumber,
                invoiceDate: inv.invoiceDate,
                customerName: inv.customerName,
                customerPhone: inv.customerPhone,
                customerAddress: inv.customerAddress,
                paymentMode: inv.paymentMode,
                items: inv.items,
              });
            } catch (e) {
              // Ignore if invoice already exists in DB
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Background sync warning:', err);
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>(`/products`);
    if (Array.isArray(response.data)) {
      localStorage.setItem('cached_products', JSON.stringify(response.data));
      syncOfflineLocalDataToBackend();
      return response.data;
    }
  } catch (error) {
    console.warn('PostgreSQL API unavailable for product list, loading from local storage fallback');
  }
  const local = localStorage.getItem('cached_products');
  return local ? JSON.parse(local) : [];
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await api.post<Product>(`/products`, productData);
    if (response.data) {
      const local = localStorage.getItem('cached_products');
      const products: Product[] = local ? JSON.parse(local) : [];
      const updated = [response.data, ...products.filter((p) => p.partNumber.toUpperCase() !== response.data.partNumber.toUpperCase())];
      localStorage.setItem('cached_products', JSON.stringify(updated));
      return response.data;
    }
  } catch (error: any) {
    console.warn('Backend API post error:', error);
    if (error.response && error.response.status === 400 && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
  }

  const partNumUpper = String(productData.partNumber || '').trim().toUpperCase();
  const local = localStorage.getItem('cached_products');
  const products: Product[] = local ? JSON.parse(local) : [];

  if (products.some((p) => p.partNumber.toUpperCase() === partNumUpper)) {
    throw new Error(`Product with Part Number '${partNumUpper}' already exists.`);
  }

  const newProd: Product = {
    id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    partNumber: partNumUpper,
    name: String(productData.name || '').trim(),
    hsn: String(productData.hsn || '').trim(),
    gst: Number(productData.gst || 18),
    price: Number(productData.price || 0),
    unit: String(productData.unit || 'PCS').trim().toUpperCase(),
    stock: Number(productData.stock || 100),
  };

  const updated = [newProd, ...products];
  localStorage.setItem('cached_products', JSON.stringify(updated));
  return newProd;
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    console.warn('Backend API delete product error, updating local cache');
  }

  const local = localStorage.getItem('cached_products');
  if (local) {
    const products: Product[] = JSON.parse(local);
    const updated = products.filter((p) => p.id !== id);
    localStorage.setItem('cached_products', JSON.stringify(updated));
  }
};

export const updateProductPrice = async (
  idOrPartNumber: string,
  newPrice: number
): Promise<void> => {
  if (!idOrPartNumber || typeof newPrice !== 'number' || isNaN(newPrice)) return;

  try {
    await api.patch(`/products/${idOrPartNumber}`, {
      price: newPrice,
      partNumber: idOrPartNumber,
    });
  } catch (error) {
    console.warn('Backend API update price warning:', error);
  }

  const local = localStorage.getItem('cached_products');
  if (local) {
    const products: Product[] = JSON.parse(local);
    const upper = idOrPartNumber.toUpperCase();
    const updated = products.map((p) => {
      if (p.id === idOrPartNumber || p.partNumber.toUpperCase() === upper) {
        return { ...p, price: newPrice };
      }
      return p;
    });
    localStorage.setItem('cached_products', JSON.stringify(updated));
  }
};

export const fetchNextInvoiceNumber = async (): Promise<string> => {
  try {
    const response = await api.get<{ invoiceNumber: string }>(`/invoices/next-number`);
    if (response.data?.invoiceNumber) {
      return response.data.invoiceNumber;
    }
  } catch (error) {
    console.warn('API unavailable for next invoice number, calculating from local cache');
  }

  const year = new Date().getFullYear();
  const local = localStorage.getItem('cached_invoices');
  const invoices: SavedInvoice[] = local ? JSON.parse(local) : [];
  let maxSeq = 0;
  invoices.forEach((inv) => {
    if (inv.invoiceNumber && inv.invoiceNumber.startsWith(`OE-${year}-`)) {
      const parts = inv.invoiceNumber.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `OE-${year}-${nextSeq}`;
};

export const createInvoice = async (invoicePayload: any): Promise<SavedInvoice> => {
  try {
    const response = await api.post<SavedInvoice>(`/invoices`, invoicePayload);
    if (response.data) {
      const local = localStorage.getItem('cached_invoices');
      const invoices: SavedInvoice[] = local ? JSON.parse(local) : [];
      const updated = [response.data, ...invoices.filter((i) => i.id !== response.data.id)];
      localStorage.setItem('cached_invoices', JSON.stringify(updated));
      return response.data;
    }
  } catch (error: any) {
    console.warn('Backend API create invoice error, saving to local storage fallback:', error);
  }

  const items = (invoicePayload.items || []).map((it: any, idx: number) => {
    const qty = Number(it.quantity || 0);
    const prc = Number(it.price || 0);
    const gstRate = Number(it.gstRate || 0);
    const taxable = qty * prc;
    const gstAmount = (taxable * gstRate) / 100;
    const total = taxable + gstAmount;
    return {
      id: `item_${Date.now()}_${idx}`,
      invoiceId: `inv_${Date.now()}`,
      partNumber: it.partNumber || 'N/A',
      productName: it.productName || 'Service / Product',
      hsn: it.hsn || 'N/A',
      unit: it.unit || 'PCS',
      quantity: qty,
      price: prc,
      discount: Number(it.discount || 0),
      gstRate,
      gstAmount: Number(gstAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  });

  const subtotal = items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
  const gstTotal = items.reduce((acc: number, item: any) => acc + item.gstAmount, 0);
  const cgstTotal = gstTotal / 2;
  const sgstTotal = gstTotal / 2;
  const rawGrand = subtotal + gstTotal;
  const grandTotal = Math.round(rawGrand);
  const roundOff = Number((grandTotal - rawGrand).toFixed(2));

  const localSavedInv: SavedInvoice = {
    id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    invoiceNumber: invoicePayload.invoiceNumber || `OE-${new Date().getFullYear()}-0001`,
    invoiceDate: invoicePayload.invoiceDate || new Date().toISOString(),
    billType: invoicePayload.billType || 'CUSTOMER',
    customerName: invoicePayload.customerName || 'Walk-in Customer',
    customerPhone: invoicePayload.customerPhone || '',
    customerAddress: invoicePayload.customerAddress || '',
    paymentMode: invoicePayload.paymentMode || 'CASH',
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: 0,
    cgstTotal: Number(cgstTotal.toFixed(2)),
    sgstTotal: Number(sgstTotal.toFixed(2)),
    igstTotal: 0,
    roundOff,
    grandTotal,
    amountInWords: invoicePayload.amountInWords || undefined,
    transportDetails: invoicePayload.transportDetails || undefined,
    items,
    createdAt: new Date().toISOString(),
  };

  const local = localStorage.getItem('cached_invoices');
  const invoices: SavedInvoice[] = local ? JSON.parse(local) : [];
  const updated = [localSavedInv, ...invoices.filter((i) => i.id !== localSavedInv.id)];
  localStorage.setItem('cached_invoices', JSON.stringify(updated));
  return localSavedInv;
};

export const fetchInvoices = async (): Promise<SavedInvoice[]> => {
  try {
    const response = await api.get<SavedInvoice[]>(`/invoices`);
    if (Array.isArray(response.data)) {
      localStorage.setItem('cached_invoices', JSON.stringify(response.data));
      return response.data;
    }
  } catch (error) {
    console.warn('API unavailable for invoices list, loading from local cache');
  }
  const local = localStorage.getItem('cached_invoices');
  return local ? JSON.parse(local) : [];
};

export const fetchInvoiceById = async (id: string): Promise<SavedInvoice> => {
  try {
    const response = await api.get<SavedInvoice>(`/invoices/${id}`);
    if (response.data) return response.data;
  } catch (error) {
    console.warn('API unavailable for invoice by ID, fetching from local cache');
  }
  const local = localStorage.getItem('cached_invoices');
  const invoices: SavedInvoice[] = local ? JSON.parse(local) : [];
  const found = invoices.find((inv) => inv.id === id);
  if (found) return found;
  throw new Error(`Invoice with ID ${id} not found.`);
};

export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    await api.delete(`/invoices/${id}`);
  } catch (error) {
    console.warn('Backend API delete invoice warning:', error);
  }
  const local = localStorage.getItem('cached_invoices');
  if (local) {
    const invoices: SavedInvoice[] = JSON.parse(local);
    const updated = invoices.filter((i) => i.id !== id);
    const currentYear = new Date().getFullYear();
    const sortedOldestFirst = [...updated].sort(
      (a, b) => new Date(a.createdAt || a.invoiceDate).getTime() - new Date(b.createdAt || b.invoiceDate).getTime()
    );
    const resequenced = sortedOldestFirst.map((inv, idx) => ({
      ...inv,
      invoiceNumber: `OE-${currentYear}-${String(idx + 1).padStart(4, '0')}`,
    }));
    localStorage.setItem('cached_invoices', JSON.stringify(resequenced));
  }
};

export const searchCustomers = async (query: string): Promise<Customer[]> => {
  try {
    const response = await api.get<Customer[]>(`/customers/search`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};

export const fetchStoreSettings = async (): Promise<any> => {
  try {
    const response = await api.get('/store');
    if (response.data && response.data.storeName) {
      localStorage.setItem('store_details', JSON.stringify(response.data));
      return response.data;
    }
  } catch (e) {
    console.warn('Could not fetch store settings from API, using localStorage fallback');
  }
  const local = localStorage.getItem('store_details');
  return local ? JSON.parse(local) : null;
};

export const updateStoreSettingsApi = async (details: any): Promise<any> => {
  localStorage.setItem('store_details', JSON.stringify(details));
  try {
    const response = await api.put('/store', details);
    if (response.data) {
      localStorage.setItem('store_details', JSON.stringify(response.data));
      return response.data;
    }
  } catch (e) {
    console.warn('Could not save store settings to backend API, saved to localStorage');
  }
  return details;
};
