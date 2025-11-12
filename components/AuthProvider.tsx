'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, LoginCredentials } from '@/types/auth';
import { loginUser, setAuthToken, getAuthToken, removeAuthToken } from '@/lib/auth';
import { decodeJWT } from '@/lib/jwt';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const checkToken = () => {
      const token = getAuthToken();
      console.log('🔐 AuthProvider - Checking token:', !!token);
      
      if (token) {
        console.log('🔑 Token found, validating...');
        // Validate and decode the JWT token
        const { user: decodedUser, isValid } = decodeJWT(token);
        console.log('🔍 Token validation result:', { isValid, hasUser: !!decodedUser });
        
        if (isValid && decodedUser) {
          console.log('✅ Valid token, setting user:', decodedUser);
          setUser(decodedUser);
          // Make sure cookie is also set (in case it was cleared)
          setAuthToken(token);
        } else {
          // Token is invalid, remove it
          console.log('❌ Invalid token, removing...');
          removeAuthToken();
          setUser(null);
        }
      } else {
        console.log('❌ No token found');
        setUser(null);
      }
      setIsLoading(false);
    };

    checkToken();

    // Listen for storage changes (e.g., token deleted in DevTools)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        console.log('🔄 Storage changed for auth_token, re-checking...');
        if (!e.newValue) {
          console.log('🗑️ Token was removed from storage');
          setUser(null);
          removeAuthToken(); // Also remove cookie
        } else {
          console.log('🔑 Token was added/updated in storage');
          checkToken();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await loginUser(credentials);
      
      console.log('🔑 Login response in AuthProvider:', response);
      
      if (response.success && response.data) {
        console.log('✅ Login successful, setting user data');
        setUser(response.data.user);
        setAuthToken(response.data.token);
        return true;
      } else {
        console.log('❌ Login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    setUser(null);
    removeAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}