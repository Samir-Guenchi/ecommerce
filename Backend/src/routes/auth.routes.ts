import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/check-admin', authController.checkAdmin.bind(authController));
router.post('/signup', authController.signUp.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/verify', authController.verifyEmail.bind(authController));
router.post('/resend-verification', authController.resendVerificationCode.bind(authController));

// OAuth routes - Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}?error=oauth_failed`, session: false }),
  authController.googleCallback.bind(authController)
);

// OAuth routes - Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${process.env.FRONTEND_URL}?error=oauth_failed`, session: false }),
  authController.facebookCallback.bind(authController)
);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;

