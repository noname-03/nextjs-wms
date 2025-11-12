import { fetchWithAuth } from './fetchWithAuth';

export interface ProductStock {
  id: number;
  productBatchId: number;
  productBatchCode: string;
  productId: number;
  productName: string;
  locationId: number;
  locationName: string;
  quantity: number;
}

export interface CreateProductStockData {
  productBatchId: number;
  productId: number;
  locationId: number;
  quantity: number;
}

export interface UpdateProductStockData {
  productBatchId?: number;
  productId?: number;
  locationId?: number;
  quantity?: number;
}

export interface ProductStockResponse {
  code: number;
  message: string;
  data?: ProductStock | ProductStock[];
}

// Get all product stocks
export async function getProductStocks(): Promise<ProductStockResponse> {
  try {
    console.log('🔍 Fetching product stocks...');

    const response = await fetchWithAuth(`/product-stocks`, {
      method: 'GET',

    });

    const data = await response.json();

    console.log('📥 Get product stocks response status:', response.status);
    console.log('📥 Get product stocks response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get product stocks error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Get product stock by ID
export async function getProductStockById(id: number): Promise<ProductStockResponse> {
  try {
    console.log(`🔍 Fetching product stock with ID: ${id}`);

    const response = await fetchWithAuth(`/product-stocks/${id}`, {
      method: 'GET',

    });

    const data = await response.json();

    console.log('📥 Get product stock response status:', response.status);
    console.log('📥 Get product stock response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get product stock error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Get product stocks by product ID
export async function getProductStocksByProduct(productId: number): Promise<ProductStockResponse> {
  try {
    console.log(`🔍 Fetching product stocks for product ID: ${productId}`);

    const response = await fetchWithAuth(`/product-stocks/product/${productId}`, {
      method: 'GET',

    });

    const data = await response.json();

    console.log('📥 Get product stocks by product response status:', response.status);
    console.log('📥 Get product stocks by product response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get product stocks by product error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Create product stock
export async function createProductStock(productStockData: CreateProductStockData): Promise<ProductStockResponse> {
  try {
    console.log('📤 Creating product stock:', productStockData);

    // Convert to API format (PascalCase)
    const requestBody = {
      ProductBatchID: productStockData.productBatchId,
      ProductID: productStockData.productId,
      LocationID: productStockData.locationId,
      Quantity: productStockData.quantity,
    };

    const response = await fetchWithAuth(`/product-stocks`, {
      method: 'POST',

      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log('📥 Create product stock response status:', response.status);
    console.log('📥 Create product stock response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Create product stock error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Update product stock
export async function updateProductStock(id: number, productStockData: UpdateProductStockData): Promise<ProductStockResponse> {
  try {
    console.log(`📤 Updating product stock ${id}:`, productStockData);

    // Convert to API format (PascalCase)
    const requestBody: any = {};
    if (productStockData.productBatchId !== undefined) requestBody.ProductBatchID = productStockData.productBatchId;
    if (productStockData.productId !== undefined) requestBody.ProductID = productStockData.productId;
    if (productStockData.locationId !== undefined) requestBody.LocationID = productStockData.locationId;
    if (productStockData.quantity !== undefined) requestBody.Quantity = productStockData.quantity;

    const response = await fetchWithAuth(`/product-stocks/${id}`, {
      method: 'PUT',

      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log('📥 Update product stock response status:', response.status);
    console.log('📥 Update product stock response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Update product stock error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Delete product stock
export async function deleteProductStock(id: number): Promise<ProductStockResponse> {
  try {
    console.log(`🗑️ Deleting product stock with ID: ${id}`);

    const response = await fetchWithAuth(`/product-stocks/${id}`, {
      method: 'DELETE',

    });

    const data = await response.json();

    console.log('📥 Delete product stock response status:', response.status);
    console.log('📥 Delete product stock response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Delete product stock error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}
