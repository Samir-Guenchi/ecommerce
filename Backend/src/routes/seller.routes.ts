import { Router } from 'express';
import { SellerRegistrationController } from '../controllers/seller.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/multer';

const router = Router();
const sellerRegistrationController = new SellerRegistrationController();

/**
 * @route POST /api/seller-registrations/upload
 * @desc Upload seller documents
 * @access Private (Seller)
 */
router.post(
  '/upload',
  authenticate,
  upload.fields([
    { name: 'business_license', maxCount: 1 },
    { name: 'id_card', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'idCard', maxCount: 1 },
  ]),
  sellerRegistrationController.uploadDocuments.bind(sellerRegistrationController)
);

/**
 * @route GET /api/seller-registrations
 * @desc Get all seller registrations
 * @access Private (Admin)
 */
router.get('/', authenticate, sellerRegistrationController.getAllSellerRegistrations);

/**
 * @route GET /api/seller-registrations/:id
 * @desc Get seller registration by ID
 * @access Private (Admin)
 */
router.get('/:id', authenticate, sellerRegistrationController.getSellerRegistrationById);

/**
 * @route PUT /api/seller-registrations/:id/approve
 * @desc Approve seller registration
 * @access Private (Admin)
 */
router.put('/:id/approve', authenticate, sellerRegistrationController.approveSellerRegistration);

/**
 * @route PUT /api/seller-registrations/:id/reject
 * @desc Reject seller registration
 * @access Private (Admin)
 */
router.put('/:id/reject', authenticate, sellerRegistrationController.rejectSellerRegistration);

export default router;