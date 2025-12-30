import { Router } from 'express';
import { storeController } from '../controllers/store.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All store routes require authentication
router.use(authenticate);

router.get('/', storeController.getAllStores.bind(storeController));
router.get('/:id', storeController.getStoreById.bind(storeController));
router.post('/', storeController.createStore.bind(storeController));
router.patch('/:id', storeController.updateStore.bind(storeController));
router.delete('/:id', storeController.deleteStore.bind(storeController));

export default router;



