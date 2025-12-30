# Algerie Post E-Commerce Platform

![Algerie Post Logo](AlgeriePoste.png)

A comprehensive multi-seller e-commerce platform built for Algerie Post, enabling sellers to create online stores and customers to browse and purchase products through both mobile and web interfaces.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Algerie Post E-Commerce Platform is a full-stack application that provides:

- **Multi-seller marketplace** where sellers can register and manage their stores
- **Mobile app** for sellers to manage their business on-the-go
- **Web storefront** for customers to browse stores and make purchases
- **Centralized backend API** handling all business logic and data management
- **PostgreSQL database** with comprehensive schema for e-commerce operations

The platform supports the complete e-commerce workflow from seller registration to order fulfillment, with features like product management, payment processing, delivery tracking, and subscription plans.

## 🏗️ Architecture

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

### Components:

- **Backend**: RESTful API built with Node.js, TypeScript, Express, and TypeORM
- **Frontend**: React Native mobile application for sellers
- **Storefront**: React web application for customer-facing store browsing
- **Database**: PostgreSQL with 18+ tables covering all e-commerce entities

## ✨ Features

### 🏪 Seller Features
- Store registration and management
- Product catalog management
- Order processing and tracking
- Payment method configuration
- Delivery settings management
- Subscription plan management
- Analytics and reporting

### 🛒 Customer Features
- Browse stores by domain
- Product search and filtering
- Shopping cart functionality
- Secure checkout process
- Order tracking
- Transaction history

### 🔧 Admin Features
- User management (approve/reject sellers)
- Platform-wide analytics
- System configuration
- Content moderation

### 🛡️ Security & Authentication
- JWT-based authentication
- Email verification system
- Role-based access control
- Secure password hashing
- Admin privilege management

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **React Native development environment** (for mobile app)
- **Git**

### For Mobile Development:
- **Android Studio** (for Android development)
- **Xcode** (for iOS development on macOS)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Algerie Post"
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb algerie_post

# Run the schema
psql -U postgres -d algerie_post -f DB/schema.sql
```

### 3. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Set up environment variables
cp ENV_TEMPLATE.md .env
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

# For iOS (macOS only)
bundle install
bundle exec pod install

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

## 📱 Usage

### Seller Workflow

1. **Registration**: Download the mobile app and register as a seller
2. **Store Setup**: Configure store details, theme, and settings
3. **Product Management**: Add products with images, descriptions, and pricing
4. **Order Management**: Process incoming orders and manage fulfillment
5. **Analytics**: Monitor sales performance and customer behavior

### Customer Workflow

1. **Store Discovery**: Visit store domain (e.g., `store.algeriepost.dz`)
2. **Product Browsing**: Search and filter products
3. **Purchase**: Add to cart and complete checkout
4. **Tracking**: Monitor order status and delivery

### Admin Workflow

1. **User Management**: Approve seller registrations
2. **Platform Monitoring**: View system analytics and metrics
3. **Content Moderation**: Manage stores and products

## 📚 API Documentation

The backend provides RESTful APIs for all platform functionality:

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Email verification

### Store Management
- `GET /api/stores` - List stores
- `POST /api/stores` - Create store
- `PUT /api/stores/:id` - Update store

### Product Management
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product

### Order Processing
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

For complete API documentation, see the [Backend README](Backend/README.md)

## 🗄️ Database

The platform uses PostgreSQL with a comprehensive schema including:

- **18+ Tables** covering users, stores, products, orders, payments, etc.
- **Automatic timestamps** with PostgreSQL triggers
- **Full-text search** capabilities
- **Foreign key constraints** and data integrity
- **JSONB fields** for flexible data storage

See [Database README](DB/README.md) for detailed schema information.

## 🚢 Deployment

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

## 🤝 Contributing

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

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in each component's README

---

**Built with ❤️ for Algerie Post**</content>
<parameter name="filePath">c:\Users\Abdennour\Desktop\Algerie Post\README.md