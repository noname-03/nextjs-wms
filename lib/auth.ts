import { LoginCredentials, LoginResponse } from '@/types/auth';

const API_BASE_URL = 'https://apigo.fahrurrozi.web.id/api/v1';

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    console.log('🚀 Attempting login with:', { email: credentials.email });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    console.log('📥 Login response status:', response.status);
    console.log('📥 Login response data:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Login failed',
      };
    }

    // Check if login was successful based on the API response structure
    if (data.code === 200 && data.data && data.data.token) {
      return {
        success: true,
        message: data.message || 'Login successful',
        data: {
          user: data.data.user,
          token: data.data.token,
        },
      };
    } else {
      return {
        success: false,
        message: data.message || 'Login failed',
      };
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return {
      success: false,
      message: 'Network error or server unavailable',
    };
  }
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    // Also set as cookie for middleware
    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    // Also remove cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}