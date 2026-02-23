import { Router } from 'express';
import { storeController } from '../controllers/store.controller';
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

// All store routes require authentication
router.use(authenticate);

router.get('/', storeController.getAllStores.bind(storeController));
router.get('/:id', storeController.getStoreById.bind(storeController));
router.post('/', requireDocumentApproved, storeController.createStore.bind(storeController));
router.patch('/:id', storeController.updateStore.bind(storeController));
router.delete('/:id', storeController.deleteStore.bind(storeController));

export default router;



