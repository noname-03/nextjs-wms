import { fetchWithAuth } from './fetchWithAuth';

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

export const getProducts = async (): Promise<ProductResponse> => {
  try {
    const response = await fetchWithAuth(`/products`, {
      method: 'GET',
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
    const response = await fetchWithAuth(`/products/${id}`, {
      method: 'GET',

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
    const response = await fetchWithAuth(`/products`, {
      method: 'POST',

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
    const response = await fetchWithAuth(`/products/${id}`, {
      method: 'PUT',

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
    const response = await fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',

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
    const response = await fetchWithAuth(`/products/deleted`, {
      method: 'GET',

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
    const response = await fetchWithAuth(`/products/${id}/restore`, {
      method: 'PUT',

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
    const response = await fetchWithAuth(`/products/categories/${categoryId}`, {
      method: 'GET',

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