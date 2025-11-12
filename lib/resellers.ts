import { fetchWithAuth } from './fetchWithAuth';

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
  const response = await fetchWithAuth(`/resellers`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch resellers');
  }

  const result = await response.json();
  // Response sudah dalam format PascalCase, tidak perlu konversi
  return result.data;
}
