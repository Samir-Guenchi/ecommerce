/**
 * API Configuration for Storefront Web App
 * 
 * This should point to your backend API server.
 * 
 * Configuration options:
 * 1. Use environment variable VITE_API_URL (recommended for production)
 * 2. Development defaults to http://localhost:3000/api
 * 3. Production defaults to https://your-production-api.com/api
 * 
 * To use a custom API URL:
 * - Create a .env file in the Storefront root directory
 * - Add: VITE_API_URL=http://your-api-url:port/api
 * - For production: VITE_API_URL=https://api.yourdomain.com/api
 */

const getApiUrl = (): string => {
  // Check for environment variable first (Vite uses VITE_ prefix)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development mode - backend runs on port 3000 by default
  if (import.meta.env.DEV) {
    // Use localhost for same-machine development
    // If you need to access from other devices on your network, 
    // set VITE_API_URL in .env to your computer's IP: http://YOUR_IP:3000/api
    return 'http://localhost:3000/api';
  }

  // Production mode - update this with your production API URL
  // Or better: set VITE_API_URL environment variable
  return 'https://your-production-api.com/api';
};

export const API_URL = getApiUrl();

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('[Storefront API Config] Using API URL:', API_URL);
}

