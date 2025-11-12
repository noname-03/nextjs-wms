import { fetchWithAuth } from './fetchWithAuth';

// Types
export interface DeliveryOrder {
  id: number;
  doNumber: string;
  purchaseOrderId: number;
  poNumber: string;
  deliveryDate: string;
  status: 'draft' | 'shipped' | 'delivered' | 'closed';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryOrderData {
  doNumber: string;
  purchaseOrderId: number;
  deliveryDate: string;
  status: string;
  description?: string;
}

export interface UpdateDeliveryOrderData {
  doNumber?: string;
  purchaseOrderId?: number;
  deliveryDate?: string;
  status?: string;
  description?: string;
}

export interface DeliveryOrderResponse {
  code: number;
  message: string;
  data?: DeliveryOrder | DeliveryOrder[];
}

export interface DeliveryOrderFilterParams {
  status?: string;
  purchase_order_id?: number;
  delivery_date_from?: string;
  delivery_date_to?: string;
}

export interface DeliveryOrderItem {
  id?: number | string;
  productId: number;
  productName?: string;
  qtyDelivered: number;
  description?: string;
}

export interface CreateDeliveryOrderWithItemsData {
  doNumber: string;
  purchaseOrderId: number;
  deliveryDate: string;
  status: string;
  description?: string;
  items: DeliveryOrderItem[];
}

export interface UpdateDeliveryOrderWithItemsData {
  doNumber: string;
  purchaseOrderId: number;
  deliveryDate: string;
  status: string;
  description?: string;
  items: DeliveryOrderItem[];
}

export interface DeliveryOrderWithItems extends DeliveryOrder {
  items: DeliveryOrderItem[];
}

// Recursive PascalCase converter
function toPascalCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toPascalCase(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
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

// Get all delivery orders
export async function getDeliveryOrders(): Promise<DeliveryOrderResponse> {
  try {


    const response = await fetchWithAuth(`/delivery-orders`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch delivery orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    return {
      code: 500,
      message: 'Error fetching delivery orders',
    };
  }
}

// Get delivery order by ID
export async function getDeliveryOrderById(id: number): Promise<DeliveryOrderResponse> {
  try {


    const response = await fetchWithAuth(`/delivery-orders/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch delivery order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching delivery order:', error);
    return {
      code: 500,
      message: 'Error fetching delivery order',
    };
  }
}

// Get deleted delivery orders
export async function getDeletedDeliveryOrders(): Promise<DeliveryOrderResponse> {
  try {


    const response = await fetchWithAuth(`/delivery-orders/deleted`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch deleted delivery orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching deleted delivery orders:', error);
    return {
      code: 500,
      message: 'Error fetching deleted delivery orders',
    };
  }
}

// Filter delivery orders
export async function filterDeliveryOrders(params: DeliveryOrderFilterParams): Promise<DeliveryOrderResponse> {
  try {

    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append('status', params.status);
    if (params.purchase_order_id) queryParams.append('purchase_order_id', params.purchase_order_id.toString());
    if (params.delivery_date_from) queryParams.append('delivery_date_from', params.delivery_date_from);
    if (params.delivery_date_to) queryParams.append('delivery_date_to', params.delivery_date_to);

    const response = await fetchWithAuth(`/delivery-orders/filter?${queryParams.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to filter delivery orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error filtering delivery orders:', error);
    return {
      code: 500,
      message: 'Error filtering delivery orders',
    };
  }
}

// Create delivery order
export async function createDeliveryOrder(data: CreateDeliveryOrderData): Promise<DeliveryOrderResponse> {
  try {


    // Convert to PascalCase for API
    const apiData = toPascalCase(data);

    const response = await fetchWithAuth(`/delivery-orders`, {
      method: 'POST',
      body: JSON.stringify(apiData),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating delivery order:', error);
    return {
      code: 500,
      message: 'Error creating delivery order',
    };
  }
}

// Update delivery order
export async function updateDeliveryOrder(id: number, data: UpdateDeliveryOrderData): Promise<DeliveryOrderResponse> {
  try {


    // Convert to PascalCase for API
    const apiData = toPascalCase(data);

    const response = await fetchWithAuth(`/delivery-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating delivery order:', error);
    return {
      code: 500,
      message: 'Error updating delivery order',
    };
  }
}

// Delete delivery order
export async function deleteDeliveryOrder(id: number): Promise<DeliveryOrderResponse> {
  try {


    const response = await fetchWithAuth(`/delivery-orders/${id}`, {
      method: 'DELETE',
    });

    return await response.json();
  } catch (error) {
    console.error('Error deleting delivery order:', error);
    return {
      code: 500,
      message: 'Error deleting delivery order',
    };
  }
}

// Restore delivery order
export async function restoreDeliveryOrder(id: number): Promise<DeliveryOrderResponse> {
  try {


    const response = await fetchWithAuth(`/delivery-orders/${id}/restore`, {
      method: 'PUT',
    });

    return await response.json();
  } catch (error) {
    console.error('Error restoring delivery order:', error);
    return {
      code: 500,
      message: 'Error restoring delivery order',
    };
  }
}

// Create delivery order with items
export async function createDeliveryOrderWithItems(data: CreateDeliveryOrderWithItemsData): Promise<DeliveryOrderResponse> {
  try {


    // Convert to PascalCase for API
    const apiData = toPascalCase(data);

    console.log('Creating DO with items:', JSON.stringify(apiData, null, 2));

    const response = await fetchWithAuth(`/delivery-orders/with-items`, {
      method: 'POST',
      body: JSON.stringify(apiData),
    });

    const result = await response.json();
    console.log('API Response:', result);
    return result;
  } catch (error) {
    console.error('Error creating delivery order with items:', error);
    return {
      code: 500,
      message: 'Error creating delivery order with items',
    };
  }
}

// Get delivery order with items
export async function getDeliveryOrderWithItems(id: number): Promise<DeliveryOrderWithItems> {
  try {


    const response = await fetchWithAuth(`/delivery-orders/${id}/with-items`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch delivery order with items');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching delivery order with items:', error);
    throw error;
  }
}

// Update delivery order with items
export async function updateDeliveryOrderWithItems(
  id: number,
  data: UpdateDeliveryOrderWithItemsData
): Promise<DeliveryOrderResponse> {
  try {


    // Convert to PascalCase for API
    const apiData = toPascalCase(data);

    console.log('Updating DO with items:', JSON.stringify(apiData, null, 2));

    const response = await fetchWithAuth(`/delivery-orders/${id}/with-items`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });

    const result = await response.json();
    console.log('API Response:', result);
    return result;
  } catch (error) {
    console.error('Error updating delivery order with items:', error);
    return {
      code: 500,
      message: 'Error updating delivery order with items',
    };
  }
}
