import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, paymentController.getAllPayments.bind(paymentController));
router.post('/', authenticate, paymentController.createPayment.bind(paymentController));
router.patch('/:id', authenticate, paymentController.updatePayment.bind(paymentController));
router.delete('/:id', authenticate, paymentController.deletePayment.bind(paymentController));

export default router;



