import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.get('/', orderController.getAllOrders.bind(orderController));
router.get('/:id', orderController.getOrderById.bind(orderController));
router.patch('/:id/status', orderController.updateOrderStatus.bind(orderController));

export default router;



