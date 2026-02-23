import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/multer';

const router = Router();

/**
 * @route POST /api/upload
 * @desc Upload a single image
 * @access Private
 */
router.post(
  '/',
  authenticate,
  upload.single('image'),
  uploadController.uploadImage
);

export default router;
