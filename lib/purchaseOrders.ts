import { getAuthToken } from './auth';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
import { API_BASE_URL } from './config';

// Types
export interface PurchaseOrder {
  id: number;
  poNumber: string;
  userId: number;
  userName: string;
  orderDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'received' | 'closed';
  totalAmount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderData {
  poNumber: string;
  userId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  description?: string;
}

export interface UpdatePurchaseOrderData {
  poNumber?: string;
  userId?: number;
  orderDate?: string;
  status?: string;
  totalAmount?: number;
  description?: string;
}

export interface PurchaseOrderResponse {
  code: number;
  message: string;
  data?: PurchaseOrder | PurchaseOrder[];
}

export interface PurchaseOrderFilterParams {
  status?: string;
  user_id?: number;
  order_date_from?: string;
  order_date_to?: string;
}

export interface PurchaseOrderItem {
  productId: number;
  qtyOrdered: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  description?: string;
}

export interface CreatePurchaseOrderWithItemsData {
  poNumber: string;
  userId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  description?: string;
  items: PurchaseOrderItem[];
}

// Helper function to convert camelCase to PascalCase for API
function toPascalCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toPascalCase(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const pascalObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
        pascalObj[pascalKey] = toPascalCase(obj[key]);
      }
    }
    return pascalObj;
  }
  
  return obj;
}

// Get all purchase orders
export async function getPurchaseOrders(): Promise<PurchaseOrderResponse> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/purchase-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return {
      code: 500,
      message: 'Error fetching purchase orders',
      data: [],
    };
  }
}

// Filter purchase orders with multiple parameters
export async function filterPurchaseOrders(params: PurchaseOrderFilterParams): Promise<PurchaseOrderResponse> {
  try {
    const token = getAuthToken();
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params.order_date_from) queryParams.append('order_date_from', params.order_date_from);
    if (params.order_date_to) queryParams.append('order_date_to', params.order_date_to);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/purchase-orders/filter${queryString ? `?${queryString}` : ''}`;
    
    console.log('Filtering purchase orders with URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error filtering purchase orders:', error);
    return {
      code: 500,
      message: 'Error filtering purchase orders',
      data: [],
    };
  }
}

// Get deleted purchase orders
export async function getDeletedPurchaseOrders(): Promise<PurchaseOrderResponse> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/purchase-orders/deleted`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching deleted purchase orders:', error);
    return {
      code: 500,
      message: 'Error fetching deleted purchase orders',
      data: [],
    };
  }
}

// Get purchase order by ID
export async function getPurchaseOrderById(id: number): Promise<PurchaseOrderResponse> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return {
      code: 500,
      message: 'Error fetching purchase order',
    };
  }
}

// Create purchase order
export async function createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrderResponse> {
  try {
    const token = getAuthToken();
    
    // Convert to PascalCase for API
    const apiData = toPascalCase(data);
    
    console.log('Creating purchase order with data:', apiData);
    
    const response = await fetch(`${API_BASE_URL}/purchase-orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    const responseData = await response.json();
    console.log('Create purchase order response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return {
      code: 500,
      message: 'Error creating purchase order',
    };
  }
}

// Update purchase order
export async function updatePurchaseOrder(id: number, data: UpdatePurchaseOrderData): Promise<PurchaseOrderResponse> {
  try {
    const token = getAuthToken();
    
    // Convert to PascalCase for API
    const apiData = toPascalCase(data);
    
    console.log('Updating purchase order with data:', apiData);
    
    const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    const responseData = await response.json();
    console.log('Update purchase order response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return {
      code: 500,
      message: 'Error updating purchase order',
    };
  }
}

// Delete purchase order
export async function deletePurchaseOrder(id: number): Promise<PurchaseOrderResponse> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return {
      code: 500,
      message: 'Error deleting purchase order',
    };
  }
}

// Restore purchase order
export async function restorePurchaseOrder(id: number): Promise<PurchaseOrderResponse> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}/restore`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error restoring purchase order:', error);
    return {
      code: 500,
      message: 'Error restoring purchase order',
    };
  }
}

// Create purchase order with items
export async function createPurchaseOrderWithItems(data: CreatePurchaseOrderWithItemsData): Promise<PurchaseOrderResponse> {
  try {
    const token = getAuthToken();
    
    // Convert to PascalCase for API
    const apiData = toPascalCase(data);
    
    console.log('Sending PO with items:', JSON.stringify(apiData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/purchase-orders/with-items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    const result = await response.json();
    console.log('API Response:', result);
    return result;
  } catch (error) {
    console.error('Error creating purchase order with items:', error);
    return {
      code: 500,
      message: 'Error creating purchase order with items',
    };
  }
}
