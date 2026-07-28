import axios from 'axios';
import { Product, Customer, SavedInvoice } from '../types/billing';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>(`/products/search`, {
      params: { q: query },
    });
    if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    console.warn('API unavailable, searching products in local storage fallback');
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

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>(`/products`);
    if (Array.isArray(response.data)) {
      localStorage.setItem('cached_products', JSON.stringify(response.data));
      return response.data;
    }
  } catch (error) {
    console.warn('API unavailable for product list, loading from local storage fallback');
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
    // If backend returned a specific 400 error (like duplicate part number), throw it so user sees the message
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      throw error;
    }
  }

  // Fallback to local storage creation for offline or static hosting environments (e.g. Vercel)
  const partNumUpper = String(productData.partNumber || '').trim().toUpperCase();
  const local = localStorage.getItem('cached_products');
  const products: Product[] = local ? JSON.parse(local) : [];

  if (products.some((p) => p.partNumber.toUpperCase() === partNumUpper)) {
    const err: any = new Error(`Product with Part Number '${partNumUpper}' already exists.`);
    err.response = { data: { error: `Product with Part Number '${partNumUpper}' already exists.` } };
    throw err;
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
    return response.data.invoiceNumber;
  } catch (error) {
    const year = new Date().getFullYear();
    return `OE-${year}-0001`;
  }
};

export const createInvoice = async (invoicePayload: any): Promise<SavedInvoice> => {
  const response = await api.post<SavedInvoice>(`/invoices`, invoicePayload);
  return response.data;
};

export const fetchInvoices = async (): Promise<SavedInvoice[]> => {
  try {
    const response = await api.get<SavedInvoice[]>(`/invoices`);
    return response.data;
  } catch (error) {
    console.warn('API unavailable for invoices list');
    return [];
  }
};

export const fetchInvoiceById = async (id: string): Promise<SavedInvoice> => {
  const response = await api.get<SavedInvoice>(`/invoices/${id}`);
  return response.data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    await api.delete(`/invoices/${id}`);
  } catch (error) {
    console.warn('Backend API delete invoice warning:', error);
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

