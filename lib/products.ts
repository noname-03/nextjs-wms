const API_BASE_URL = 'https://apigo.fahrurrozi.web.id/api/v1';

export interface Product {
  id: number;
  brandId: number;
  categoryId: number;
  brandName: string;
  categoryName: string;
  name: string;
  description?: string;
  deleted_at?: string; // Add for deleted products
}

export interface CreateProductData {
  categoryId: number;
  name: string;
  description: string;
}

export interface UpdateProductData {
  categoryId?: number;
  name?: string;
  description?: string;
}

export interface ProductResponse {
  code: number;
  message: string;
  data: Product | Product[];
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const getProducts = async (): Promise<ProductResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id: number): Promise<ProductResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const createProduct = async (productData: CreateProductData): Promise<ProductResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: number, productData: UpdateProductData): Promise<ProductResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: number): Promise<ProductResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const getDeletedProducts = async (): Promise<ProductResponse> => {
  try {
    console.log('Fetching deleted products...');
    const response = await fetch(`${API_BASE_URL}/products/deleted`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Deleted products response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching deleted products:', error);
    throw error;
  }
};

export const restoreProduct = async (id: number): Promise<ProductResponse> => {
  try {
    console.log('Restoring product with ID:', id);
    const response = await fetch(`${API_BASE_URL}/products/${id}/restore`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Restore product response:', data);
    return data;
  } catch (error) {
    console.error('Error restoring product:', error);
    throw error;
  }
};

export const getProductsByCategoryId = async (categoryId: number): Promise<ProductResponse> => {
  try {
    console.log('Fetching products for category ID:', categoryId);
    const response = await fetch(`${API_BASE_URL}/products/categories/${categoryId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Products by category response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};