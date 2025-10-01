import { getAuthToken } from './auth';

const API_BASE_URL = 'https://apigo.fahrurrozi.web.id/api/v1';

export interface Brand {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface BrandResponse {
  code: number;
  message: string;
  data?: Brand | Brand[];
}

export interface CreateBrandData {
  name: string;
  description?: string;
}

export interface UpdateBrandData {
  name: string;
  description?: string;
}

// Get authorization headers
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Get all brands
export async function getBrands(): Promise<BrandResponse> {
  try {
    console.log('🔍 Fetching brands...');
    
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Get brands response status:', response.status);
    console.log('📥 Get brands response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get brands error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Get single brand by ID
export async function getBrand(id: number): Promise<BrandResponse> {
  try {
    console.log('🔍 Fetching brand by ID:', id);
    
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Get brand response status:', response.status);
    console.log('📥 Get brand response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get brand error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Create new brand
export async function createBrand(brandData: CreateBrandData): Promise<BrandResponse> {
  try {
    console.log('🆕 Creating brand with data:', brandData);
    
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(brandData),
    });

    const data = await response.json();
    
    console.log('📥 Create brand response status:', response.status);
    console.log('📥 Create brand response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Create brand error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Update brand
export async function updateBrand(id: number, brandData: UpdateBrandData): Promise<BrandResponse> {
  try {
    console.log('📝 Updating brand ID:', id, 'with data:', brandData);
    
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(brandData),
    });

    const data = await response.json();
    
    console.log('📥 Update brand response status:', response.status);
    console.log('📥 Update brand response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Update brand error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Delete brand
export async function deleteBrand(id: number): Promise<BrandResponse> {
  try {
    console.log('🗑️ Deleting brand ID:', id);
    
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Delete brand response status:', response.status);
    console.log('📥 Delete brand response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Delete brand error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Get deleted brands
export async function getDeletedBrands(): Promise<BrandResponse> {
  try {
    console.log('🗑️ Fetching deleted brands...');
    
    const response = await fetch(`${API_BASE_URL}/brands/deleted`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Get deleted brands response status:', response.status);
    console.log('📥 Get deleted brands response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get deleted brands error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}

// Restore a brand
export async function restoreBrand(id: number): Promise<BrandResponse> {
  try {
    console.log('♻️ Restoring brand with ID:', id);
    
    const response = await fetch(`${API_BASE_URL}/brands/${id}/restore`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Restore brand response status:', response.status);
    console.log('📥 Restore brand response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Restore brand error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}