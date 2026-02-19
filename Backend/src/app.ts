import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import * as dotenv from 'dotenv';
import passport from './config/passport';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import storeRoutes from './routes/store.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import addressRoutes from './routes/address.routes';
import profileRoutes from './routes/profile.routes';
import sellerRoutes from './routes/seller.routes';
import subscriptionRoutes from './routes/subscription.routes';
import deliveryRoutes from './routes/delivery.routes';
import taxRoutes from './routes/tax.routes';
import eventRoutes from './routes/event.routes';
import storefrontRoutes from './routes/storefront.routes';
import trackingRoutes from './routes/tracking.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import orderTrackingRoutes from './routes/order-tracking.routes';
import cartRoutes from './routes/cart.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:8081',  // Expo web
    'http://localhost:8082',
    'http://localhost:19006',
    'http://localhost:19000',
    'http://10.0.2.2:8082',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// === API Routes ===
// Authentication (public + protected)
app.use('/api/auth', authRoutes);

// User management (admin)
app.use('/api/users', userRoutes);

// Profile (authenticated user)
app.use('/api/profile', profileRoutes);

// Products (authenticated)
app.use('/api/products', productRoutes);

// Stores (authenticated)
app.use('/api/stores', storeRoutes);

// Orders (authenticated + public tracking)
app.use('/api/orders', orderRoutes);

// Payments (authenticated)
app.use('/api/payments', paymentRoutes);

// Addresses (authenticated)
app.use('/api/addresses', addressRoutes);

// Seller registrations (admin)
app.use('/api/seller-registrations', sellerRoutes);

// Subscriptions & plans (authenticated)
app.use('/api/subscriptions', subscriptionRoutes);

// Delivery settings (authenticated)
app.use('/api/delivery', deliveryRoutes);

// Tax settings (authenticated)
app.use('/api/taxes', taxRoutes);

// Events / analytics (public)
app.use('/api/events', eventRoutes);

// Storefront (public)
app.use('/api/storefront', storefrontRoutes);

// GPS tracking (authenticated)
app.use('/api/tracking', trackingRoutes);

// Marketplace search & cart
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/marketplace', cartRoutes);

// Order tracking by wilaya
app.use('/api/order-tracking', orderTrackingRoutes);

// Dashboard stats (authenticated)
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
