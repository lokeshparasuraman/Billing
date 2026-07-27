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
    return response.data;
  } catch (error) {
    console.warn('API unavailable, fallback searching products client-side');
    return [];
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>(`/products`);
    return response.data;
  } catch (error) {
    console.warn('API unavailable for product list');
    return [];
  }
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const response = await api.post<Product>(`/products`, productData);
  return response.data;
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
