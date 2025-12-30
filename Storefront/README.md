# Storefront Web Application

A separate web-based storefront application for the Algerie Post multi-seller e-commerce platform. This application allows customers to browse stores and products by domain, and handles transactions that are recorded under the correct seller in the database.

## Overview

This is a standalone web application (separate from the React Native mobile app) that provides:
- Public store pages accessible by domain (e.g., `storename.algeriepost.dz`)
- Product browsing and detail pages
- Add to cart functionality that records transactions under the seller
- Responsive design for desktop and mobile browsers

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

## Project Structure

```
Storefront/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ProductCard.tsx
│   │   └── StoreHeader.tsx
│   ├── pages/            # Page components
│   │   ├── StorePage.tsx
│   │   └── ProductPage.tsx
│   ├── services/         # API service layer
│   │   └── api.service.ts
│   ├── config/           # Configuration
│   │   └── api.config.ts
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL:**
   
   **Option 1: Using Environment Variable (Recommended)**
   - Create a `.env` file in the Storefront root directory
   - Add: `VITE_API_URL=http://localhost:3000/api`
   - For production: `VITE_API_URL=https://api.yourdomain.com/api`
   - For network access from other devices: `VITE_API_URL=http://YOUR_IP:3000/api`
   
   **Option 2: Direct Configuration**
   - Update `src/config/api.config.ts` directly
   - Default development URL: `http://localhost:3000/api`
   
   **Note:** The backend API runs on port 3000 by default. Make sure your backend server is running before starting the storefront.

3. **Run development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```
   Output will be in the `dist` folder

## Usage

### Accessing a Store

Navigate to a store using its domain:
```
http://localhost:5173/store/{domain}
```

Example:
```
http://localhost:5173/store/example-store.algeriepost.dz
```

### Viewing a Product

Navigate to a product page:
```
http://localhost:5173/store/{domain}/product/{productId}
```

## API Integration

The storefront communicates with the backend API through these endpoints:

- `GET /api/storefront/:domain` - Get store and products by domain
- `GET /api/storefront/:domain/products/:productId` - Get product details
- `POST /api/storefront/:domain/transactions` - Record a transaction (add to cart)

All transactions are automatically recorded under the seller's user ID based on the store domain.

## Deployment

This application can be deployed independently from the mobile app:

1. Build the application: `npm run build`
2. Deploy the `dist` folder to any static hosting service (Vercel, Netlify, AWS S3, etc.)
3. Configure your domain/subdomain routing to point to this application
4. Ensure CORS is properly configured on the backend API to allow requests from your storefront domain

## Environment Variables

For production, you may want to use environment variables for the API URL:

1. Create a `.env` file:
   ```
   VITE_API_URL=https://your-api.com/api
   ```

2. Update `src/config/api.config.ts` to use `import.meta.env.VITE_API_URL`

## Notes

- This application is **public-facing** and does not require authentication
- Transactions are recorded under the seller's account based on the store domain
- The application shares the same database as the mobile app through the backend API
- Both applications can run simultaneously and independently

