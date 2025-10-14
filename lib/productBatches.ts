import { getAuthToken } from './auth';

export interface ProductBatch {
  id: number;
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  codeBatch: string;
  unitPrice?: number;
  expDate: string;
  description?: string;
}

export interface CreateProductBatchData {
  productId: number;
  codeBatch: string;
  unitPrice?: number;
  expDate: string;
  description?: string;
}

export interface UpdateProductBatchData {
  productId?: number;
  codeBatch?: string;
  unitPrice?: number;
  expDate?: string;
  description?: string;
}

export interface ProductBatchResponse {
  code: number;
  message: string;
  data?: ProductBatch | ProductBatch[];
}

import { API_BASE_URL } from './config';

// Get authorization headers
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function getProductBatches(): Promise<ProductBatch[]> {
  console.log('Fetching product batches...');

  try {
    const response = await fetch(`${API_BASE_URL}/product-batches`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('Product batches response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to fetch product batches:', errorData);
      throw new Error(`Failed to fetch product batches: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Product batches data received:', data);
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching product batches:', error);
    throw error;
  }
}

export async function getProductBatchById(id: number): Promise<ProductBatch> {
  console.log(`Fetching product batch with ID: ${id}`);

  try {
    const response = await fetch(`${API_BASE_URL}/product-batches/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('Product batch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to fetch product batch:', errorData);
      throw new Error(`Failed to fetch product batch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Product batch data received:', data);
    
    return data.data;
  } catch (error) {
    console.error('Error fetching product batch:', error);
    throw error;
  }
}

export async function createProductBatch(productBatchData: CreateProductBatchData): Promise<ProductBatch> {
  console.log('Creating product batch:', productBatchData);

  try {
    const response = await fetch(`${API_BASE_URL}/product-batches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productBatchData),
    });

    console.log('Create product batch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to create product batch:', errorData);
      throw new Error(`Failed to create product batch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Product batch created:', data);
    
    return data.data;
  } catch (error) {
    console.error('Error creating product batch:', error);
    throw error;
  }
}

export async function updateProductBatch(id: number, productBatchData: UpdateProductBatchData): Promise<ProductBatch> {
  console.log(`Updating product batch ${id}:`, productBatchData);

  try {
    const response = await fetch(`${API_BASE_URL}/product-batches/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productBatchData),
    });

    console.log('Update product batch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to update product batch:', errorData);
      throw new Error(`Failed to update product batch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Product batch updated:', data);
    
    return data.data;
  } catch (error) {
    console.error('Error updating product batch:', error);
    throw error;
  }
}

export async function deleteProductBatch(id: number): Promise<void> {
  console.log(`Deleting product batch with ID: ${id}`);

  try {
    const response = await fetch(`${API_BASE_URL}/product-batches/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    console.log('Delete product batch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to delete product batch:', errorData);
      throw new Error(`Failed to delete product batch: ${response.status} ${response.statusText}`);
    }

    console.log('Product batch deleted successfully');
  } catch (error) {
    console.error('Error deleting product batch:', error);
    throw error;
  }
}

export async function getDeletedProductBatches(): Promise<ProductBatchResponse> {
  console.log('Fetching deleted product batches...');

  try {
    const response = await fetch(`${API_BASE_URL}/product-batches/deleted`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    
    const data = await response.json();
    
    console.log('📥 Get deleted product-batches response status:', response.status);
    console.log('📥 Get deleted product-batches response data:', data);

    return data;
  } catch (error) {
    console.error('Error fetching deleted product batches:', error);
    throw error;
  }
}

export async function restoreProductBatch(id: number): Promise<ProductBatchResponse> {
  console.log(`Restoring product batch with ID: ${id}`);

  try {
    const response = await fetch(`${API_BASE_URL}/product-batches/${id}/restore`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    console.log('📥 Restore product batch response status:', response.status);
    console.log('📥 Restore product batch response data:', data);

    return data;
  } catch (error) {
    console.error('Error restoring product batch:', error);
    throw error;
  }
}