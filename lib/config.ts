/**
 * Application Configuration
 * Centralized configuration for API endpoints and other settings
 */

// API Base URL - Change this based on environment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.g-synergy.com/api/v1';
// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080/api/v1';

// You can add more configuration here
export const config = {
  api: {
    baseUrl: API_BASE_URL,
    timeout: 30000, // 30 seconds
  },
  // Add other app-wide configs here
  app: {
    name: 'WMS',
    version: '1.0.0',
  },
} as const;

export default config;
