import { getAuthToken } from './auth';
import { API_BASE_URL } from './config';

export interface ProductUnit {
  id: number;
  productId: number;
  productName: string;
  locationId: number;
  locationName: string;
  productBatchId: number;
  productBatchCode: string;
  name: string;
  quantity: number;
  unitPrice: string;
  unitPriceRetail: string;
  barcode: string;
  description?: string;
}

export interface CreateProductUnitData {
  productId: number;
  locationId: number;
  productBatchId: number;
  name: string;
  quantity: number;
  unitPrice: string;
  unitPriceRetail: string;
  barcode: string;
  description?: string;
}

export interface UpdateProductUnitData {
  productId?: number;
  locationId?: number;
  productBatchId?: number;
  name?: string;
  quantity?: number;
  unitPrice?: string;
  unitPriceRetail?: string;
  barcode?: string;
  description?: string;
}

export interface ProductUnitResponse {
  code: number;
  message: string;
  data?: ProductUnit | ProductUnit[];
}

// Get authorization headers
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Get product units by product ID
export async function getProductUnitsByProduct(productId: number): Promise<ProductUnitResponse> {
  try {
    console.log(`🔍 Fetching product units for product ID: ${productId}`);
    
    const response = await fetch(`${API_BASE_URL}/product-units/product/${productId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Get product units by product response status:', response.status);
    console.log('📥 Get product units by product response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get product units by product error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Get all product units
export async function getProductUnits(): Promise<ProductUnitResponse> {
  try {
    console.log('🔍 Fetching all product units...');
    
    const response = await fetch(`${API_BASE_URL}/product-units`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Get product units response status:', response.status);
    console.log('📥 Get product units response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get product units error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Get single product unit by ID
export async function getProductUnitById(id: number): Promise<ProductUnitResponse> {
  try {
    console.log(`🔍 Fetching product unit ID: ${id}`);
    
    const response = await fetch(`${API_BASE_URL}/product-units/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Get product unit response status:', response.status);
    console.log('📥 Get product unit response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get product unit error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Create new product unit
export async function createProductUnit(productUnitData: CreateProductUnitData): Promise<ProductUnitResponse> {
  try {
    console.log('🆕 Creating product unit with data:', productUnitData);
    
    const response = await fetch(`${API_BASE_URL}/product-units`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productUnitData),
    });

    const data = await response.json();
    
    console.log('📥 Create product unit response status:', response.status);
    console.log('📥 Create product unit response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Create product unit error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Update product unit
export async function updateProductUnit(id: number, productUnitData: UpdateProductUnitData): Promise<ProductUnitResponse> {
  try {
    console.log(`📝 Updating product unit ID: ${id} with data:`, productUnitData);
    
    const response = await fetch(`${API_BASE_URL}/product-units/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productUnitData),
    });

    const data = await response.json();
    
    console.log('📥 Update product unit response status:', response.status);
    console.log('📥 Update product unit response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Update product unit error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Delete product unit
export async function deleteProductUnit(id: number): Promise<ProductUnitResponse> {
  try {
    console.log(`🗑️ Deleting product unit ID: ${id}`);
    
    const response = await fetch(`${API_BASE_URL}/product-units/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Delete product unit response status:', response.status);
    console.log('📥 Delete product unit response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Delete product unit error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}
