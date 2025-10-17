import { getAuthToken } from './auth';
import { API_BASE_URL } from './config';

export interface Reseller {
  userId: number;
  name: string;
  locationId: number;
  locationName: string;
  address: string;
  phoneNumber: string;
}

// Get all resellers
export async function getResellers(): Promise<Reseller[]> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/resellers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch resellers');
  }

  const result = await response.json();
  // Response sudah dalam format PascalCase, tidak perlu konversi
  return result.data;
}
