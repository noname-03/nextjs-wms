import { getAuthToken } from './auth';
import { API_BASE_URL } from './config';

export interface Location {
  id: number;
  name: string;
  address?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationResponse {
  code: number;
  message: string;
  data?: Location | Location[];
}

// Get authorization headers
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Get all locations
export async function getLocations(): Promise<LocationResponse> {
  try {
    console.log('🔍 Fetching locations...');
    
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    console.log('📥 Get locations response status:', response.status);
    console.log('📥 Get locations response data:', data);

    return data;
  } catch (error) {
    console.error('❌ Get locations error:', error);
    return {
      code: 500,
      message: 'Network error or server unavailable',
    };
  }
}
