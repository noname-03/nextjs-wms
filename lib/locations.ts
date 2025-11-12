import { fetchWithAuth } from './fetchWithAuth';

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

// Get all locations
export async function getLocations(): Promise<LocationResponse> {
  try {
    console.log('🔍 Fetching locations...');
    
    const response = await fetchWithAuth(`/locations`, {
      method: 'GET',
      
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
