import { fetchWithAuth } from './fetchWithAuth';

export interface InventoryStock {
  id?: number;
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  locationId: number;
  locationName: string;
  productBatchId?: number;
  codeBatch: string;
  quantity?: number;
  stock?: number; // Alias untuk quantity
  expDate?: string;
  unitPrice?: number;
  productUnitPrice?: number; // Alias untuk unitPrice
  barcode?: string;
  purchasePrice?: number;
}

export interface InventoryStockResponse {
  code: number;
  message: string;
  data?: InventoryStock[];
}

export interface InventoryStockFilters {
  brandId?: number;
  categoryId?: number;
  productId?: number;
  locationId?: number;
  productBatchId?: number;
  barcode?: string;
}

// Get authorization headers

// Build query string from filters
function buildQueryString(filters: InventoryStockFilters): string {
  const params = new URLSearchParams();
  
  if (filters.brandId) params.append('brandId', filters.brandId.toString());
  if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
  if (filters.productId) params.append('productId', filters.productId.toString());
  if (filters.locationId) params.append('locationId', filters.locationId.toString());
  if (filters.productBatchId) params.append('productBatchId', filters.productBatchId.toString());
  if (filters.barcode) params.append('barcode', filters.barcode);
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

// Get inventory stock with optional filters
export async function getInventoryStock(filters: InventoryStockFilters = {}): Promise<InventoryStockResponse> {
  try {
    const queryString = buildQueryString(filters);
    console.log('🔍 Fetching inventory stock with filters:', filters);
    console.log('🔍 Query string:', queryString);
    
    const response = await fetchWithAuth(`/inventory/stock${queryString}`, {
      method: 'GET',
      
    });

    const data = await response.json();
    
    console.log('📥 Get inventory stock response status:', response.status);
    console.log('📥 Get inventory stock response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get inventory stock error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}
