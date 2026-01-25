import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import storeRoutes from './routes/store.routes';
import orderRoutes from './routes/order.routes';
import profileRoutes from './routes/profile.routes';
import paymentRoutes from './routes/payment.routes';
import deliveryRoutes from './routes/delivery.routes';
import taxRoutes from './routes/tax.routes';
import addressRoutes from './routes/address.routes';
import subscriptionRoutes from './routes/subscription.routes';
import storefrontRoutes from './routes/storefront.routes';
import eventRoutes from './routes/event.routes';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - API information
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Algerie Post API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: {
        checkAdmin: 'GET /api/auth/check-admin',
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        verify: 'POST /api/auth/verify',
        resendVerification: 'POST /api/auth/resend-verification',
        me: 'GET /api/auth/me (requires auth)',
      },
      users: {
        list: 'GET /api/users (admin only)',
        getById: 'GET /api/users/:id (admin only)',
        updateStatus: 'PATCH /api/users/:id/status (admin only)',
        delete: 'DELETE /api/users/:id (admin only)',
      },
    },
  });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Algerie Post API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/events', eventRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

export default app;

