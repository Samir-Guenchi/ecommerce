# Algerie Post E-Commerce Platform

A comprehensive multi-seller e-commerce platform built for Algerie Post, enabling sellers to create online stores and customers to browse and purchase products through both mobile and web interfaces.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Algerie Post E-Commerce Platform is a full-stack application that provides:

- Multi-seller marketplace where sellers can register and manage their stores
- Mobile application for sellers to manage their business on-the-go
- Web storefront for customers to browse stores and make purchases
- Centralized backend API handling all business logic and data management
- PostgreSQL database with comprehensive schema for e-commerce operations

The platform supports the complete e-commerce workflow from seller registration to order fulfillment, with features like product management, payment processing, delivery tracking, and subscription plans.

## Architecture

The application follows a microservices-like architecture with separate components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Backend API   │    │   PostgreSQL    │
│     Mobile App  │◄──►│  (Node.js/TS)  │◄──►│     Database    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       ▲                       ▲
         │                       │                       │
         ▼                       │                       │
┌─────────────────┐               │                       │
│   Web Storefront│◄──────────────┘                       │
│   (React/Vite)  │                                       │
└─────────────────┘                                       │
                                                          │
                                               ┌─────────────────┐
                                               │   Email Service │
                                               │   (SMTP)        │
                                               └─────────────────┘
```

### Components

- Backend: RESTful API built with Node.js, TypeScript, Express, and TypeORM
- Frontend: React Native mobile application for sellers
- Storefront: React web application for customer-facing store browsing
- Database: PostgreSQL with 18+ tables covering all e-commerce entities

## Features

### Seller Features
### Seller Features

- Store registration and management
- Product catalog management
- Order processing and tracking
- Payment method configuration
- Delivery settings management
- Subscription plan management
- Analytics and reporting

### Customer Features

- Browse stores by domain
- Product search and filtering
- Shopping cart functionality
- Secure checkout process
- Order tracking
- Transaction history

### Admin Features

- User management (approve/reject sellers)
- Platform-wide analytics
- System configuration
- Content moderation

### Security & Authentication

- JWT-based authentication
- Email verification system
- Role-based access control
- Secure password hashing
- Admin privilege management
- Google OAuth integration

## Technology Stack

### Backend
- Node.js with TypeScript
- Express.js framework
- TypeORM for database management
- PostgreSQL database
- JWT for authentication
- Passport.js for OAuth
- Nodemailer for email services

### Frontend (Mobile)
- React Native
- Expo framework
- React Navigation
- Axios for API calls
- AsyncStorage for local data

### Storefront (Web)
- React with TypeScript
- Vite build tool
- React Router for navigation
- Tailwind CSS for styling
- Axios for API integration

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- React Native development environment (for mobile app)
- Git

### For Mobile Development

- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Samir-Guenchi/ecommerce.git
cd ecommerce
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb algerie_post_ecom

# Run the schema
psql -U postgres -d algerie_post_ecom -f DB/schema.sql
```

### 3. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials, JWT secret, and SMTP settings

# Start development server
npm run dev
```

The backend will run on `http://localhost:3000`

### 4. Mobile App Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start Metro bundler
npm start

# In another terminal, run on device/emulator
npm run android  # or npm run ios
```

### 5. Web Storefront Setup

```bash
cd Storefront

# Install dependencies
npm install

# Configure API URL (optional - defaults to localhost:3000)
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start development server
npm run dev
```

The storefront will run on `http://localhost:5173`

## Usage

### Seller Workflow

1. Registration: Download the mobile app and register as a seller
2. Store Setup: Configure store details, theme, and settings
3. Product Management: Add products with images, descriptions, and pricing
4. Order Management: Process incoming orders and manage fulfillment
5. Analytics: Monitor sales performance and customer behavior

### Customer Workflow

1. Store Discovery: Visit store domain (e.g., `store.algeriepost.dz`)
2. Product Browsing: Search and filter products
3. Purchase: Add to cart and complete checkout
4. Tracking: Monitor order status and delivery

### Admin Workflow

1. User Management: Approve seller registrations and manage user accounts
2. Platform Monitoring: View system analytics and metrics
3. Content Moderation: Manage stores and products

## API Documentation

The backend provides RESTful APIs for all platform functionality:

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Email verification
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Store Management
- `GET /api/stores` - List stores
- `POST /api/stores` - Create store
- `PUT /api/stores/:id` - Update store
- `GET /api/stores/:id` - Get store details

### Product Management
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Order Processing
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/:id` - Get order details

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/suspend` - Suspend user
- `PATCH /api/admin/users/:id/activate` - Activate user
- `GET /api/admin/sellers` - List all sellers

For complete API documentation, see the [Backend README](Backend/README.md)

## Database

The platform uses PostgreSQL with a comprehensive schema including:

- 18+ Tables covering users, stores, products, orders, payments, etc.
- Automatic timestamps with PostgreSQL triggers
- Full-text search capabilities
- Foreign key constraints and data integrity
- JSONB fields for flexible data storage

Key tables include:
- users: User accounts and authentication
- stores: Seller store information
- products: Product catalog
- orders: Order management
- order_items: Order line items
- transactions: Payment transactions
- seller_registrations: Seller onboarding
- subscriptions: Subscription plans

## Project Structure

```
ecommerce/
├── Backend/                 # Node.js/TypeScript API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── entities/       # TypeORM entities
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migrations
│   └── uploads/            # File uploads
├── Frontend/               # React Native mobile app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # App screens
│   │   ├── navigation/     # Navigation setup
│   │   ├── services/       # API services
│   │   └── i18n/           # Internationalization
│   └── assets/             # Images and fonts
├── Storefront/             # React web storefront
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   └── styles/         # CSS styles
│   └── public/             # Static assets
├── DB/                     # Database schema
│   └── schema.sql          # PostgreSQL schema
└── internship-report/      # LaTeX documentation
    └── rapport-stage.tex   # Internship report
```

## Deployment

### Backend Deployment
```bash
cd Backend
npm run build
npm start
```

### Mobile App Deployment
```bash
cd Frontend
npm run build:android  # or build:ios
```

### Web Storefront Deployment
```bash
cd Storefront
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Production Considerations
- Set `NODE_ENV=production`
- Use environment variables for sensitive data
- Configure CORS properly
- Set up SSL certificates
- Implement proper logging and monitoring
- Use a process manager like PM2 for Node.js
- Set up database backups
- Configure CDN for static assets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Ensure code passes linting and formatting
- Use meaningful commit messages

## License

This project is licensed under the ISC License.

## Authors

- GUENCHI Samir
- GUERRERODJ Abdennour

Developed as part of an internship project at ENSIA (École Nationale Supérieure d'Informatique) in collaboration with Algérie Poste.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation in each component's README
- Review the internship report for detailed system documentation</content>
<parameter name="filePath">c:\Users\Abdennour\Desktop\Algerie Post\README.md