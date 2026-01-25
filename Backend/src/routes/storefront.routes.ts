import { Router } from 'express';
import { storefrontController } from '../controllers/storefront.controller';

const router = Router();

// Public storefront routes that resolve stores by domain
router.get('/:domain/products/:productId', storefrontController.getProductForStore.bind(storefrontController));
router.get('/:domain', storefrontController.resolveStore.bind(storefrontController));
router.post('/:domain/transactions', storefrontController.recordTransaction.bind(storefrontController));
router.post('/:domain/orders', storefrontController.createOrder.bind(storefrontController));
router.post('/:domain/events', storefrontController.trackEvent.bind(storefrontController));

export default router;



