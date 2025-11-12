import { fetchWithAuth } from './fetchWithAuth';

export interface Category {
  id: number;
  brandId: number;
  brandName: string;
  name: string;
  description?: string;
  deleted_at?: string; // Add for deleted categories
}

export interface CreateCategoryData {
  brandId: number;
  name: string;
  description: string;
}

export interface UpdateCategoryData {
  brandId?: number;
  name?: string;
  description?: string;
}

export interface CategoryResponse {
  code: number;
  message: string;
  data: Category | Category[];
}

export const getCategories = async (): Promise<CategoryResponse> => {
  try {
    const response = await fetchWithAuth(`/categories`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategory = async (id: number): Promise<CategoryResponse> => {
  try {
    const response = await fetchWithAuth(`/categories/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

export const createCategory = async (categoryData: CreateCategoryData): Promise<CategoryResponse> => {
  try {
    const response = await fetchWithAuth(`/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: number, categoryData: UpdateCategoryData): Promise<CategoryResponse> => {
  try {
    const response = await fetchWithAuth(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<CategoryResponse> => {
  try {
    const response = await fetchWithAuth(`/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const getDeletedCategories = async (): Promise<CategoryResponse> => {
  try {
    console.log('Fetching deleted categories...');
    const response = await fetchWithAuth(`/categories/deleted`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Deleted categories response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching deleted categories:', error);
    throw error;
  }
};

export const restoreCategory = async (id: number): Promise<CategoryResponse> => {
  try {
    console.log('Restoring category with ID:', id);
    const response = await fetchWithAuth(`/categories/${id}/restore`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Restore category response:', data);
    return data;
  } catch (error) {
    console.error('Error restoring category:', error);
    throw error;
  }
};

export const getCategoriesByBrandId = async (brandId: number): Promise<CategoryResponse> => {
  try {
    console.log('Fetching categories for brand ID:', brandId);
    const response = await fetchWithAuth(`/categories/brand/${brandId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Categories by brand response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching categories by brand:', error);
    throw error;
  }
};