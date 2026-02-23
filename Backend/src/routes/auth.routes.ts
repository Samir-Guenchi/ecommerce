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

// OAuth completion routes
router.post('/oauth/complete', authController.completeOAuthRegistration.bind(authController));
router.post('/oauth/set-password', authController.setOAuthPassword.bind(authController));

// OAuth routes - Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}?error=oauth_failed`, session: false }),
  authController.googleCallback.bind(authController) as any
);

// OAuth routes - Facebook (Coming Soon)
router.get('/facebook', (req: any, res: any) => {
  res.status(503).json({ 
    error: 'Facebook OAuth is coming soon',
    message: 'Facebook authentication will be available in a future update. Please use Google OAuth or email sign up for now.'
  });
});
router.get('/facebook/callback', (req: any, res: any) => {
  res.redirect(`${process.env.FRONTEND_URL}?error=facebook_coming_soon`);
});

// Protected routes
router.get('/me', authenticate as any, authController.getCurrentUser.bind(authController) as any);

export default router;

