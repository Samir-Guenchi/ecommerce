import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/check-admin', authController.checkAdmin.bind(authController));
router.post('/signup', authController.signUp.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/quick-login', authController.quickLogin.bind(authController));
router.post('/verify', authController.verifyEmail.bind(authController));
router.post('/resend-verification', authController.resendVerificationCode.bind(authController));

// OAuth completion routes
router.post('/oauth/complete', authController.completeOAuthRegistration.bind(authController));
router.post('/oauth/set-password', authController.setOAuthPassword.bind(authController));

// OAuth routes - Google
router.get('/google', (req, res, next) => {
  const host = (req.query.host as string) || (req.hostname !== 'localhost' ? req.hostname : '172.20.10.4');
  const returnUrl = (req.query.return_url as string) || '';
  const isMobile = req.query.mobile === 'true' || 
                   req.headers['user-agent']?.includes('Expo') || 
                   req.headers['user-agent']?.includes('Mobile') ||
                   false;

  const state = JSON.stringify({
    mobile: isMobile,
    host,
    returnUrl
  });

  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state,
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      console.warn('⚠️ Google OAuth callback issue:', err?.message || info || 'No user returned');
      let stateData: any = {};
      if (req.query.state) {
        try { stateData = JSON.parse(req.query.state as string); } catch (_) {}
      }
      const isMobile = stateData.mobile ?? (
        req.query.mobile === 'true' || 
        req.headers['user-agent']?.includes('Expo') || 
        req.headers['user-agent']?.includes('Mobile')
      );
      const host = stateData.host || (req.hostname !== 'localhost' ? req.hostname : '172.20.10.4');
      const expoBaseUrl = stateData.returnUrl || `exp://${host}:8081/--/oauth`;

      if (isMobile) {
        return res.send(authController.renderOAuthBridge({
          title: 'Authentification Annulée',
          message: 'L\'authentification avec Google n\'a pas pu aboutir. Veuillez réessayer depuis l\'application.',
          error: 'oauth_failed',
          expoUrl: `${expoBaseUrl}?error=oauth_failed`,
          appUrl: 'ap-ecom://oauth?error=oauth_failed',
        }));
      }
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}?error=oauth_failed`);
    }

    (req as any).user = user;
    return authController.googleCallback(req, res);
  })(req, res, next);
});

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

