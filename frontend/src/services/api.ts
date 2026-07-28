import axios from 'axios';
import { Product, Customer, SavedInvoice } from '../types/billing';

export const getApiBaseUrl = (): string => {
  const customUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('custom_api_url') : null;
  if (customUrl && customUrl.trim()) {
    return customUrl.trim();
  }

  const envUrl = import.meta.env.VITE_API_URL;
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(currentHost);
    if (isIp) {
      return `http://${currentHost}:5000/api`;
    }
    return envUrl || '/api';
  }

  return envUrl || 'http://localhost:5000/api';
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

const CLOUD_BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019fa90e-3dc9-7e88-ac17-3a18bce95c16';

let isCloudSyncing = false;

export const autoSyncCloudData = async (): Promise<{ products: Product[]; invoices: SavedInvoice[] }> => {
  if (isCloudSyncing) {
    const localP = localStorage.getItem('cached_products');
    const localI = localStorage.getItem('cached_invoices');
    return {
      products: localP ? JSON.parse(localP) : [],
      invoices: localI ? JSON.parse(localI) : [],
    };
  }

  isCloudSyncing = true;
  try {
    const localP = localStorage.getItem('cached_products');
    const localI = localStorage.getItem('cached_invoices');
    const localProds: Product[] = localP ? JSON.parse(localP) : [];
    const localInvs: SavedInvoice[] = localI ? JSON.parse(localI) : [];

    const cloudRes = await axios.get(CLOUD_BLOB_URL, { timeout: 4000 });
    const cloudProds: Product[] = Array.isArray(cloudRes.data?.products) ? cloudRes.data.products : [];
    const cloudInvs: SavedInvoice[] = Array.isArray(cloudRes.data?.invoices) ? cloudRes.data.invoices : [];

    // Merge Products
    const prodMap = new Map<string, Product>();
    for (const p of localProds) {
      if (p.partNumber) prodMap.set(p.partNumber.toUpperCase(), p);
    }
    for (const p of cloudProds) {
      if (p.partNumber && !prodMap.has(p.partNumber.toUpperCase())) {
        prodMap.set(p.partNumber.toUpperCase(), p);
      }
    }
    const mergedProds = Array.from(prodMap.values());

    // Merge Invoices
    const invMap = new Map<string, SavedInvoice>();
    for (const i of localInvs) {
      const k = i.invoiceNumber || i.id;
      if (k) invMap.set(k, i);
    }
    for (const i of cloudInvs) {
      const k = i.invoiceNumber || i.id;
      if (k && !invMap.has(k)) {
        invMap.set(k, i);
      }
    }
    const mergedInvs = Array.from(invMap.values()).sort(
      (a, b) => new Date(b.createdAt || b.invoiceDate).getTime() - new Date(a.createdAt || a.invoiceDate).getTime()
    );

    localStorage.setItem('cached_products', JSON.stringify(mergedProds));
    localStorage.setItem('cached_invoices', JSON.stringify(mergedInvs));

    if (mergedProds.length !== cloudProds.length || mergedInvs.length !== cloudInvs.length) {
      axios.put(CLOUD_BLOB_URL, { products: mergedProds, invoices: mergedInvs }).catch(() => {});
    }

    return { products: mergedProds, invoices: mergedInvs };
  } catch (err) {
    const localP = localStorage.getItem('cached_products');
    const localI = localStorage.getItem('cached_invoices');
    return {
      products: localP ? JSON.parse(localP) : [],
      invoices: localI ? JSON.parse(localI) : [],
    };
  } finally {
    isCloudSyncing = false;
  }
};

export const pushCloudData = async (products?: Product[], invoices?: SavedInvoice[]) => {
  try {
    const localP = localStorage.getItem('cached_products');
    const localI = localStorage.getItem('cached_invoices');
    const prods = products || (localP ? JSON.parse(localP) : []);
    const invs = invoices || (localI ? JSON.parse(localI) : []);
    await axios.put(CLOUD_BLOB_URL, { products: prods, invoices: invs }, { timeout: 4000 });
  } catch (e) {
    // Background cloud sync warning ignored
  }
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
    if (Array.isArray(response.data) && response.data.length > 0) {
      localStorage.setItem('cached_products', JSON.stringify(response.data));
      pushCloudData(response.data, undefined);
      return response.data;
    }
  } catch (error) {
    console.warn('API unavailable for product list, loading from cloud / local cache');
  }
  const synced = await autoSyncCloudData();
  return synced.products;
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  let serverProd: Product | null = null;
  try {
    const response = await api.post<Product>(`/products`, productData);
    if (response.data) {
      serverProd = response.data;
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

  if (!serverProd && products.some((p) => p.partNumber.toUpperCase() === partNumUpper)) {
    throw new Error(`Product with Part Number '${partNumUpper}' already exists.`);
  }

  const newProd: Product = serverProd || {
    id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    partNumber: partNumUpper,
    name: String(productData.name || '').trim(),
    hsn: String(productData.hsn || '').trim(),
    gst: Number(productData.gst || 18),
    price: Number(productData.price || 0),
    unit: String(productData.unit || 'PCS').trim().toUpperCase(),
    stock: Number(productData.stock || 100),
  };

  const updated = [newProd, ...products.filter((p) => p.partNumber.toUpperCase() !== partNumUpper)];
  localStorage.setItem('cached_products', JSON.stringify(updated));
  pushCloudData(updated, undefined);
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
    pushCloudData(updated, undefined);
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

  // Local storage fallback so saving invoice NEVER fails on live deployment!
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
  pushCloudData(undefined, updated);
  return localSavedInv;
};

export const fetchInvoices = async (): Promise<SavedInvoice[]> => {
  try {
    const response = await api.get<SavedInvoice[]>(`/invoices`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      localStorage.setItem('cached_invoices', JSON.stringify(response.data));
      pushCloudData(undefined, response.data);
      return response.data;
    }
  } catch (error) {
    console.warn('API unavailable for invoices list, loading from cloud / local cache');
  }
  const synced = await autoSyncCloudData();
  return synced.invoices;
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
    pushCloudData(undefined, resequenced);
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

export const checkBackendStatus = async (): Promise<{ isConnected: boolean; url: string; mode: string }> => {
  const url = getApiBaseUrl();
  try {
    const res = await axios.get(`${url.replace(/\/$/, '')}/health`, { timeout: 3000 });
    if (res.data && res.data.status === 'ok') {
      return { isConnected: true, url, mode: 'Live Database Server' };
    }
  } catch (e) {
    try {
      const res2 = await axios.get(`${url.replace(/\/$/, '')}/products`, { timeout: 3000 });
      if (res2.data) {
        return { isConnected: true, url, mode: 'Live Database Server' };
      }
    } catch (e2) {
      // Offline fallback
    }
  }
  return { isConnected: false, url, mode: 'Browser Offline Storage (Unsynced)' };
};

export const setCustomApiUrl = (newUrl: string | null) => {
  if (newUrl && newUrl.trim()) {
    localStorage.setItem('custom_api_url', newUrl.trim());
  } else {
    localStorage.removeItem('custom_api_url');
  }
};

export const syncLocalDataWithBackend = async (): Promise<{
  syncedProducts: number;
  syncedInvoices: number;
  totalProducts: number;
  totalInvoices: number;
}> => {
  const localProdStr = localStorage.getItem('cached_products');
  const localInvStr = localStorage.getItem('cached_invoices');
  const localProds: Product[] = localProdStr ? JSON.parse(localProdStr) : [];
  const localInvs: SavedInvoice[] = localInvStr ? JSON.parse(localInvStr) : [];

  let syncedProductsCount = 0;
  let syncedInvoicesCount = 0;

  let serverProds: Product[] = [];
  let serverInvs: SavedInvoice[] = [];

  try {
    const pRes = await api.get<Product[]>('/products');
    if (Array.isArray(pRes.data)) serverProds = pRes.data;
  } catch (err) {
    console.warn('Could not fetch server products during sync');
  }

  try {
    const iRes = await api.get<SavedInvoice[]>('/invoices');
    if (Array.isArray(iRes.data)) serverInvs = iRes.data;
  } catch (err) {
    console.warn('Could not fetch server invoices during sync');
  }

  // Upload local products to backend server if missing on server
  const serverPartNums = new Set(serverProds.map((p) => p.partNumber.toUpperCase()));
  for (const lp of localProds) {
    if (lp.partNumber && !serverPartNums.has(lp.partNumber.toUpperCase())) {
      try {
        const created = await api.post<Product>('/products', lp);
        if (created.data) {
          serverProds.push(created.data);
          syncedProductsCount++;
        }
      } catch (err) {
        console.warn('Sync upload product skipped:', lp.partNumber);
      }
    }
  }

  // Upload local invoices to backend server if missing on server
  const serverInvNums = new Set(serverInvs.map((i) => i.invoiceNumber));
  for (const li of localInvs) {
    if (li.invoiceNumber && !serverInvNums.has(li.invoiceNumber)) {
      try {
        const created = await api.post<SavedInvoice>('/invoices', li);
        if (created.data) {
          serverInvs.push(created.data);
          syncedInvoicesCount++;
        }
      } catch (err) {
        console.warn('Sync upload invoice skipped:', li.invoiceNumber);
      }
    }
  }

  // Update local storage cache with unified list
  const mergedProducts = serverProds.length > 0 ? serverProds : localProds;
  const mergedInvoices = serverInvs.length > 0 ? serverInvs : localInvs;

  localStorage.setItem('cached_products', JSON.stringify(mergedProducts));
  localStorage.setItem('cached_invoices', JSON.stringify(mergedInvoices));

  return {
    syncedProducts: syncedProductsCount,
    syncedInvoices: syncedInvoicesCount,
    totalProducts: mergedProducts.length,
    totalInvoices: mergedInvoices.length,
  };
};

