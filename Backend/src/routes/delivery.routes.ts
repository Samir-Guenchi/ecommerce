import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, deliveryController.getDeliverySettings.bind(deliveryController));
router.patch('/', authenticate, deliveryController.updateDeliverySettings.bind(deliveryController));

export default router;



