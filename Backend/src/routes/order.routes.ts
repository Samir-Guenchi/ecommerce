import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireDocumentApproved } from '../middleware/requireDocumentApproved';

const router = Router();

// Handle OPTIONS preflight requests with CORS headers
router.options('*', (_req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Public route for tracking
router.get('/track/:orderNumber', (req, res) => orderController.getOrderByOrderNumber(req, res));

// All other order routes require authentication
router.use(authenticate);

router.get('/', requireDocumentApproved, orderController.getAllOrders.bind(orderController));
router.get('/:id', orderController.getOrderById.bind(orderController));
router.patch('/:id/status', orderController.updateOrderStatus.bind(orderController));

export default router;



