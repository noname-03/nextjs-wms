import { User } from '@/types/auth';

export function decodeJWT(token: string): { user?: User; isValid: boolean } {
  try {
    // Basic JWT decode without verification (for demo purposes)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { isValid: false };
    }

    // Extract user info from token
    const user: User = {
      id: payload.user_id?.toString() || '1',
      email: payload.email || 'admin@wms.com',
      name: 'Admin User', // You might want to add name to the token payload
    };

    return { user, isValid: true };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return { isValid: false };
  }
}

export function isTokenValid(token: string): boolean {
  const { isValid } = decodeJWT(token);
  return isValid;
}