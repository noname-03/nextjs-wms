import { fetchWithAuth } from './fetchWithAuth';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  userId: number;
  userName: string;
  purchaseOrderId: number;
  poNumber: string;
  deliveryOrderId: number | null;
  doNumber: string | null;
  invoiceDate: string;
  status: string;
  totalAmount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id?: number;
  productId: number;
  productName?: string;
  qtyInvoiced: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

export interface CreateInvoiceRequest {
  InvoiceNumber: string;
  PurchaseOrderID: number;
  UserID: number;
  DeliveryOrderID?: number | null;
  InvoiceDate: string;
  Status: string;
  TotalAmount: number;
  Description?: string;
}

export interface CreateInvoiceWithItemsRequest {
  invoiceNumber: string;
  userId: number;
  purchaseOrderId: number;
  deliveryOrderId?: number | null;
  invoiceDate: string;
  status: string;
  totalAmount: number;
  description?: string;
  items: {
    productId: number;
    qtyInvoiced: number;
    unitPrice: number;
    totalPrice: number;
    description: string;
  }[];
}

export interface UpdateInvoiceRequest {
  InvoiceNumber: string;
  PurchaseOrderID: number;
  UserID: number;
  DeliveryOrderID?: number | null;
  InvoiceDate: string;
  Status: string;
  TotalAmount: number;
  Description?: string;
}

export interface UpdateInvoiceWithItemsRequest {
  invoiceNumber: string;
  userId: number;
  purchaseOrderId: number;
  deliveryOrderId?: number | null;
  invoiceDate: string;
  status: string;
  totalAmount: number;
  description?: string;
  items: {
    productId: number;
    qtyInvoiced: number;
    unitPrice: number;
    totalPrice: number;
    description: string;
  }[];
}

// GET /invoices
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const response = await fetchWithAuth(`/invoices`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to fetch invoices:', response.status, errorData);
      throw new Error(`Failed to fetch invoices: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error in getInvoices:', error);
    throw error;
  }
}

// GET /invoices/deleted
export async function getDeletedInvoices(): Promise<Invoice[]> {
  try {
    const response = await fetchWithAuth(`/invoices/deleted`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to fetch deleted invoices:', response.status, errorData);
      throw new Error(`Failed to fetch deleted invoices: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error in getDeletedInvoices:', error);
    throw error;
  }
}

// GET /invoices/{id}
export async function getInvoiceById(id: number): Promise<Invoice> {


  const response = await fetchWithAuth(`/invoices/${id}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoice');
  }

  const data = await response.json();
  return data.data;
}

// GET /invoices/{id}/with-items
export async function getInvoiceWithItems(id: number): Promise<InvoiceWithItems> {


  const response = await fetchWithAuth(`/invoices/${id}/with-items`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoice with items');
  }

  const data = await response.json();
  return data.data;
}

// POST /invoices
export async function createInvoice(invoice: CreateInvoiceRequest): Promise<Invoice> {


  const response = await fetchWithAuth(`/invoices`, {
    method: 'POST',
    body: JSON.stringify(invoice),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create invoice');
  }

  const data = await response.json();
  return data.data;
}

// POST /invoices/with-items
export async function createInvoiceWithItems(invoice: CreateInvoiceWithItemsRequest): Promise<InvoiceWithItems> {


  const response = await fetchWithAuth(`/invoices/with-items`, {
    method: 'POST',
    body: JSON.stringify(invoice),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create invoice with items');
  }

  const data = await response.json();
  return data.data;
}

// PUT /invoices/{id}
export async function updateInvoice(id: number, invoice: UpdateInvoiceRequest): Promise<Invoice> {


  const response = await fetchWithAuth(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoice),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update invoice');
  }

  const data = await response.json();
  return data.data;
}

// PUT /invoices/{id}/with-items
export async function updateInvoiceWithItems(id: number, invoice: UpdateInvoiceWithItemsRequest): Promise<InvoiceWithItems> {


  const response = await fetchWithAuth(`/invoices/${id}/with-items`, {
    method: 'PUT',
    body: JSON.stringify(invoice),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update invoice with items');
  }

  const data = await response.json();
  return data.data;
}

// DELETE /invoices/{id}
export async function deleteInvoice(id: number): Promise<void> {


  const response = await fetchWithAuth(`/invoices/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete invoice');
  }
}

// PUT /invoices/{id}/restore
export async function restoreInvoice(id: number): Promise<void> {


  const response = await fetchWithAuth(`/invoices/${id}/restore`, {
    method: 'PUT',
  });

  if (!response.ok) {
    throw new Error('Failed to restore invoice');
  }
}

// Filter invoices (client-side filtering)
export function filterInvoices(
  invoices: Invoice[],
  filters: {
    search?: string;
    purchaseOrderId?: number;
    deliveryOrderId?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  }
): Invoice[] {
  return invoices.filter((invoice) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.poNumber.toLowerCase().includes(searchLower) ||
        (invoice.doNumber && invoice.doNumber.toLowerCase().includes(searchLower)) ||
        invoice.description?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Purchase Order filter
    if (filters.purchaseOrderId && invoice.purchaseOrderId !== filters.purchaseOrderId) {
      return false;
    }

    // Delivery Order filter
    if (filters.deliveryOrderId && invoice.deliveryOrderId !== filters.deliveryOrderId) {
      return false;
    }

    // Date range filter
    if (filters.startDate) {
      const invoiceDate = new Date(invoice.invoiceDate);
      const startDate = new Date(filters.startDate);
      if (invoiceDate < startDate) return false;
    }

    if (filters.endDate) {
      const invoiceDate = new Date(invoice.invoiceDate);
      const endDate = new Date(filters.endDate);
      if (invoiceDate > endDate) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all' && invoice.status !== filters.status) {
      return false;
    }

    return true;
  });
}
