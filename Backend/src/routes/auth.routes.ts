import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/check-admin', authController.checkAdmin.bind(authController));
router.post('/signup', authController.signUp.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/verify', authController.verifyEmail.bind(authController));
router.post('/resend-verification', authController.resendVerificationCode.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;

