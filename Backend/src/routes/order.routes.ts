import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public route for tracking
router.get('/track/:orderNumber', (req, res) => orderController.getOrderByOrderNumber(req, res));

// All other order routes require authentication
router.use(authenticate);

router.get('/', orderController.getAllOrders.bind(orderController));
router.get('/:id', orderController.getOrderById.bind(orderController));
router.patch('/:id/status', orderController.updateOrderStatus.bind(orderController));

export default router;



