import { Router } from 'express';
import { taxController } from '../controllers/tax.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, taxController.getTaxSettings.bind(taxController));
router.patch('/', authenticate, taxController.updateTaxSettings.bind(taxController));

export default router;



