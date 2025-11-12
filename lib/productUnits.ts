import { fetchWithAuth } from './fetchWithAuth';

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
  unitPrice: number;
  unitPriceRetail: number;
  barcode: string;
  description?: string;
}

export interface UpdateProductUnitData {
  productId?: number;
  locationId?: number;
  productBatchId?: number;
  name?: string;
  quantity?: number;
  unitPrice?: number;
  unitPriceRetail?: number;
  barcode?: string;
  description?: string;
}

export interface ProductUnitResponse {
  code: number;
  message: string;
  data?: ProductUnit | ProductUnit[];
}

// Get product units by product ID
export async function getProductUnitsByProduct(productId: number): Promise<ProductUnitResponse> {
  try {
    console.log(`🔍 Fetching product units for product ID: ${productId}`);

    const response = await fetchWithAuth(`/product-units/product/${productId}`, {
      method: 'GET',

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

    const response = await fetchWithAuth(`/product-units`, {
      method: 'GET',

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

    const response = await fetchWithAuth(`/product-units/${id}`, {
      method: 'GET',

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

    const response = await fetchWithAuth(`/product-units`, {
      method: 'POST',

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

    const response = await fetchWithAuth(`/product-units/${id}`, {
      method: 'PUT',

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

    const response = await fetchWithAuth(`/product-units/${id}`, {
      method: 'DELETE',

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

// Get deleted product units
export async function getDeletedProductUnits(): Promise<ProductUnitResponse> {
  try {
    console.log('🔍 Fetching deleted product units...');

    const response = await fetchWithAuth(`/product-units/deleted`, {
      method: 'GET',

    });

    const data = await response.json();

    console.log('📥 Get deleted product units response status:', response.status);
    console.log('📥 Get deleted product units response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get deleted product units error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Restore deleted product unit
export async function restoreProductUnit(id: number): Promise<ProductUnitResponse> {
  try {
    console.log(`♻️ Restoring product unit ID: ${id}`);

    const response = await fetchWithAuth(`/product-units/${id}/restore`, {
      method: 'PUT',

    });

    const data = await response.json();

    console.log('📥 Restore product unit response status:', response.status);
    console.log('📥 Restore product unit response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Restore product unit error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}
