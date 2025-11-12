import { getAuthToken, removeAuthToken } from './auth';
import { API_BASE_URL } from './config';

interface FetchOptions extends RequestInit {
  skipAuthCheck?: boolean;
}

/**
 * Fetch wrapper that automatically handles 401 errors and redirects to login
 */
export async function fetchWithAuth(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuthCheck = false, ...fetchOptions } = options;

  // Get token and add to headers if available
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    console.log('🌐 Fetch:', url);
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Check for 401 Unauthorized
    if (response.status === 401 && !skipAuthCheck) {
      console.error('❌ 401 Unauthorized - Invalid or expired token');

      // Try to parse the error message
      try {
        const data = await response.clone().json();
        console.error('🔒 Auth error:', data);

        if (data.code === 401 && (data.message?.includes('Invalid token') || data.error?.includes('invalid token'))) {
          console.log('🚪 Removing invalid token and redirecting to login...');
          removeAuthToken();

          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } catch (e) {
        // If can't parse response, still redirect
        console.log('🚪 Token invalid, redirecting to login...');
        removeAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return response;
  } catch (error) {
    console.error('🔥 Fetch error:', error);
    throw error;
  }
}

/**
 * Convenience method for GET requests
 */
export async function fetchGet(endpoint: string, options?: FetchOptions) {
  return fetchWithAuth(endpoint, { ...options, method: 'GET' });
}

/**
 * Convenience method for POST requests
 */
export async function fetchPost(endpoint: string, data?: any, options?: FetchOptions) {
  return fetchWithAuth(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Convenience method for PUT requests
 */
export async function fetchPut(endpoint: string, data?: any, options?: FetchOptions) {
  return fetchWithAuth(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Convenience method for DELETE requests
 */
export async function fetchDelete(endpoint: string, options?: FetchOptions) {
  return fetchWithAuth(endpoint, { ...options, method: 'DELETE' });
}
