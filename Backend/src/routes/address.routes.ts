import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, addressController.getAllAddresses.bind(addressController));
router.post('/', authenticate, addressController.createAddress.bind(addressController));
router.patch('/:id', authenticate, addressController.updateAddress.bind(addressController));
router.delete('/:id', authenticate, addressController.deleteAddress.bind(addressController));

export default router;



