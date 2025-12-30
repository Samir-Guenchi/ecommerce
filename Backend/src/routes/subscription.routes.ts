import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/current', authenticate, subscriptionController.getCurrentSubscription.bind(subscriptionController));
router.get('/plans', authenticate, subscriptionController.getPlans.bind(subscriptionController));

export default router;



