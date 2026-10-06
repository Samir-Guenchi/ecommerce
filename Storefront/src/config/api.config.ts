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
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    return `http://${host}:3000/api`;
  }

  // Production mode - update this with your production API URL
  // Or better: set VITE_API_URL environment variable
  return 'https://your-production-api.com/api';
};

export const API_URL = getApiUrl();

// Get the base URL (without /api) for serving static files like images
export const BASE_URL = API_URL.replace('/api', '');

/**
 * Helper function to get full image URL
 * Converts relative paths like '/uploads/image.jpg' to full URLs
 */
export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Convert relative path to full URL
  return `${BASE_URL}${imagePath}`;
};

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('[Storefront API Config] Using API URL:', API_URL);
  console.log('[Storefront API Config] Using Base URL:', BASE_URL);
}

