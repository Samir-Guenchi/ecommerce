import { Request, Response } from 'express';
import { authService, SignUpData, LoginData, VerificationData } from '../services/auth.service';
import { AppDataSource } from '../config/database';
import { User, AccountStatus, AccountType } from '../entities';

export class AuthController {
  /**
   * Check if admin exists
   * GET /api/auth/check-admin
   */
  async checkAdmin(_req: Request, res: Response): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const userCount = await userRepository.count();
      
      res.status(200).json({
        adminExists: userCount > 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to check admin status' });
    }
  }

  /**
   * Sign up new user (or admin if first user)
   * POST /api/auth/signup
   */
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const data: SignUpData = {
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
      };

      // Validate input
      if (!data.email || !data.password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      if (!data.fullName) {
        res.status(400).json({ error: 'Full name is required' });
        return;
      }

      const result = await authService.signUp(data);

      if (result.isAdmin) {
        // Admin user - generate token immediately
        const token = authService.generateToken(result.user);
        res.status(201).json({
          message: 'Admin account created successfully',
          user: {
            id: result.user.id,
            email: result.user.email,
            fullName: result.user.fullName,
            accountType: result.user.accountType,
            accountStatus: result.user.accountStatus,
            isAdmin: true,
          },
          token,
        });
      } else {
        // Regular user - needs verification
        res.status(201).json({
          message: 'Account created. Please check your email for verification code.',
          user: {
            id: result.user.id,
            email: result.user.email,
            fullName: result.user.fullName,
            accountType: result.user.accountType,
            accountStatus: result.user.accountStatus,
            isAdmin: false,
          },
          needsVerification: true,
        });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create account' });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginData = {
        email: req.body.email,
        password: req.body.password,
      };

      // Validate input
      if (!data.email || !data.password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await authService.login(data);

      res.status(200).json({
        message: 'Login successful',
        ...result,
      });
    } catch (error: any) {
      // Check if it's a verification needed error
      if (error.message === 'Account not verified. Please verify your email first.') {
        const user = await AppDataSource.getRepository(User).findOne({
          where: { email: req.body.email },
        });
        
        if (user) {
          // Send new verification code
          try {
            await authService.resendVerificationCode(user.email);
          } catch (resendError) {
            console.error('Failed to resend verification code:', resendError);
          }
          
          res.status(403).json({ 
            error: 'Account not verified. Please verify your email first.',
            needsVerification: true,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              accountType: user.accountType,
              accountStatus: user.accountStatus,
            }
          });
          return;
        }
      }
      
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }

  /**
   * Quick demo login for testing in Expo Go
   * POST /api/auth/quick-login
   */
  async quickLogin(req: Request, res: Response): Promise<void> {
    try {
      const email = req.body.email || 'samir.guenchi@ensia.edu.dz';
      const role = req.body.role || 'seller';
      const userRepository = AppDataSource.getRepository(User);
      
      let user = await userRepository.findOne({ where: { email } });
      if (!user) {
        user = userRepository.create({
          email,
          fullName: 'Samir Guenchi',
          accountType: role === 'seller' ? AccountType.SELLER : AccountType.BUYER,
          accountStatus: AccountStatus.ACTIVE,
          languagePreference: 'fr',
        });
      } else {
        user.accountType = role === 'seller' ? AccountType.SELLER : AccountType.BUYER;
        user.accountStatus = AccountStatus.ACTIVE;
      }
      user.lastLogin = new Date();
      await userRepository.save(user);

      const token = authService.generateToken(user);
      res.status(200).json({
        message: 'Quick login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName || 'Samir Guenchi',
          accountType: user.accountType,
          accountStatus: user.accountStatus,
          isAdmin: user.isAdmin === true,
        },
      });
    } catch (error: any) {
      console.error('Quick login error:', error);
      res.status(500).json({ error: error.message || 'Quick login failed' });
    }
  }

  /**
   * Verify email with code
   * POST /api/auth/verify
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const data: VerificationData = {
        email: req.body.email,
        code: req.body.code,
      };

      // Validate input
      if (!data.email || !data.code) {
        res.status(400).json({ error: 'Email and verification code are required' });
        return;
      }

      const user = await authService.verifyEmail(data);

      // Generate token after verification
      const token = authService.generateToken(user);

      res.status(200).json({
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          accountType: user.accountType,
          accountStatus: user.accountStatus,
          isAdmin: false,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Verification failed' });
    }
  }

  /**
   * Resend verification code
   * POST /api/auth/resend-verification
   */
  async resendVerificationCode(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      await authService.resendVerificationCode(email);

      res.status(200).json({
        message: 'Verification code sent to your email',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to resend verification code' });
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const isAdmin = (req as any).isAdmin;

      if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          accountType: user.accountType,
          accountStatus: user.accountStatus,
          isAdmin,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get user info' });
    }
  }

  /**
   * Google OAuth - Redirect to Google
   * GET /api/auth/google
   */
  async googleAuth(req: Request, res: Response): Promise<void> {
    // This will be handled by passport middleware
    res.status(500).json({ error: 'This route should be handled by passport middleware' });
  }

  /**
   * Render HTML bridge for mobile OAuth redirects
   */
  public renderOAuthBridge(options: {
    title: string;
    message: string;
    expoUrl: string;
    appUrl: string;
    error?: string;
  }): string {
    const isError = !!options.error;
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Algérie Poste - ${options.title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0D2C74;
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .card {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 24px;
      padding: 36px 24px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 68px;
      height: 68px;
      border-radius: 20px;
      background: ${isError ? '#DC2626' : '#FDB913'};
      color: #0D2C74;
      font-size: 32px;
      font-weight: 900;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 10px 0;
      color: #FFFFFF;
    }
    p {
      color: rgba(255, 255, 255, 0.85);
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .btn {
      display: block;
      width: 100%;
      background: #FDB913;
      color: #0D2C74;
      text-decoration: none;
      font-weight: 800;
      font-size: 16px;
      padding: 16px 20px;
      border-radius: 14px;
      margin-bottom: 12px;
      cursor: pointer;
      border: none;
      transition: opacity 0.2s;
    }
    .btn:active { opacity: 0.8; }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .hint {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-badge">${isError ? '✕' : '✓'}</div>
    <h1>${options.title}</h1>
    <p>${options.message}</p>
    ${!isError ? `
      <a class="btn" href="${options.expoUrl}">Ouvrir dans Expo Go</a>
      <a class="btn btn-secondary" href="${options.appUrl}">Ouvrir l'application installée</a>
      <div class="hint">Redirection automatique en cours...</div>
    ` : `
      <a class="btn btn-secondary" href="${options.expoUrl}">Retourner à l'application</a>
    `}
  </div>
  <script>
    ${!isError ? `
      try {
        window.location.href = "${options.expoUrl}";
      } catch (e) {}
    ` : ''}
  </script>
</body>
</html>`;
  }

  /**
   * Google OAuth Callback
   * GET /api/auth/google/callback
   */
  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      console.log('🔐 Google OAuth Callback - User:', user ? 'Found' : 'Not found');
      console.log('🔐 Query params:', req.query);
      console.log('🔐 User-Agent:', req.headers['user-agent']);

      let stateData: any = {};
      if (req.query.state) {
        try {
          stateData = JSON.parse(req.query.state as string);
        } catch (_) {}
      }

      const isMobile = stateData.mobile ?? (
        req.query.mobile === 'true' || 
        req.headers['user-agent']?.includes('Expo') ||
        req.headers['user-agent']?.includes('Mobile')
      );

      const host = stateData.host || (req.hostname !== 'localhost' ? req.hostname : '172.20.10.4');
      const expoBaseUrl = stateData.returnUrl || `exp://${host}:8081/--/oauth`;
      
      console.log('📱 Is mobile request:', isMobile, 'Host:', host, 'Expo base URL:', expoBaseUrl);

      if (!user) {
        console.error('❌ No user in OAuth callback');
        if (isMobile) {
          res.send(this.renderOAuthBridge({
            title: 'Échec de connexion',
            message: 'Impossible de récupérer votre profil Google. Veuillez réessayer.',
            error: 'oauth_failed',
            expoUrl: `${expoBaseUrl}?error=oauth_failed`,
            appUrl: `ap-ecom://oauth?error=oauth_failed`,
          }));
        } else {
          res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}?error=oauth_failed`);
        }
        return;
      }

      // Check if this is a new OAuth user who needs to complete registration
      if ((user as any).isNewOAuthUser) {
        console.log('✨ New OAuth user - needs setup');
        const oauthData = encodeURIComponent(JSON.stringify({
          email: (user as any).email,
          fullName: (user as any).fullName,
          googleId: (user as any).googleId,
          provider: 'google'
        }));

        if (isMobile) {
          const expoUrl = `${expoBaseUrl}?setup=true&data=${oauthData}`;
          const appUrl = `ap-ecom://oauth?setup=true&data=${oauthData}`;
          res.send(this.renderOAuthBridge({
            title: 'Finalisation de votre compte',
            message: 'Bienvenue chez Algérie Poste. Cliquez ci-dessous pour finaliser votre inscription.',
            expoUrl,
            appUrl
          }));
        } else {
          res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}?oauth_setup=true&data=${oauthData}`);
        }
        return;
      }

      // Check if user needs to set password
      if ((user as any).needsPasswordSetup) {
        console.log('🔑 Existing OAuth user - needs password setup');
        const setupData = encodeURIComponent(JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
        }));

        if (isMobile) {
          const expoUrl = `${expoBaseUrl}?password_setup=true&data=${setupData}`;
          const appUrl = `ap-ecom://oauth?password_setup=true&data=${setupData}`;
          res.send(this.renderOAuthBridge({
            title: 'Configuration du mot de passe',
            message: 'Veuillez configurer un mot de passe pour sécuriser votre compte.',
            expoUrl,
            appUrl
          }));
        } else {
          res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}?password_setup=true&data=${setupData}`);
        }
        return;
      }

      // Existing user with password - generate token and login
      console.log('✅ Existing user with password - generating token');
      const token = authService.generateToken(user);

      if (isMobile) {
        const expoUrl = `${expoBaseUrl}?token=${token}&success=true`;
        const appUrl = `ap-ecom://oauth?token=${token}&success=true`;
        res.send(this.renderOAuthBridge({
          title: 'Connexion Réussie !',
          message: `Ravi de vous revoir, ${user.fullName || user.email}. Redirection vers votre compte Algérie Poste...`,
          expoUrl,
          appUrl
        }));
      } else {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}?token=${token}&oauth=success`);
      }
    } catch (error: any) {
      console.error('❌ Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}?error=oauth_failed`);
    }
  }

  /**
   * Complete OAuth Registration
   * POST /api/auth/oauth/complete
   */
  async completeOAuthRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { email, fullName, password, accountType, googleId } = req.body;

      console.log('📝 OAuth Complete Request:', { email, fullName, accountType, googleId, hasPassword: !!password });

      // Validate input
      if (!email || !password || !accountType) {
        console.error('❌ Missing required fields:', { email: !!email, password: !!password, accountType: !!accountType });
        res.status(400).json({ error: 'Email, password, and account type are required' });
        return;
      }

      if (!['buyer', 'seller', 'delivery', 'both'].includes(accountType)) {
        console.error('❌ Invalid account type:', accountType);
        res.status(400).json({ error: 'Invalid account type' });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        console.error('❌ User already exists:', email);
        res.status(400).json({ error: 'An account with this email already exists' });
        return;
      }

      // Create new user with OAuth data
      const hashedPassword = await authService.hashPassword(password);
      const newUser = new User();
      newUser.email = email;
      newUser.fullName = fullName || '';
      newUser.password = hashedPassword;
      newUser.accountType = accountType as any;
      newUser.accountStatus = AccountStatus.ACTIVE; // OAuth users are pre-verified
      newUser.googleId = googleId || null;

      const savedUser = await userRepository.save(newUser);
      console.log('✅ User created successfully:', savedUser.id, savedUser.email);

      // Generate token
      const token = authService.generateToken(savedUser);

      res.status(201).json({
        message: 'Account created successfully',
        user: {
          id: savedUser.id,
          email: savedUser.email,
          fullName: savedUser.fullName,
          accountType: savedUser.accountType,
          accountStatus: savedUser.accountStatus,
        },
        token,
      });
    } catch (error: any) {
      console.error('❌ OAuth complete error:', error);
      res.status(400).json({ error: error.message || 'Failed to complete registration' });
    }
  }

  /**
   * Set Password for OAuth User
   * POST /api/auth/oauth/set-password
   */
  async setOAuthPassword(req: Request, res: Response): Promise<void> {
    try {
      const { userId, password } = req.body;

      if (!userId || !password) {
        res.status(400).json({ error: 'User ID and password are required' });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (user.password) {
        res.status(400).json({ error: 'Password already set for this account' });
        return;
      }

      // Set password
      const hashedPassword = await authService.hashPassword(password);
      user.password = hashedPassword;
      await userRepository.save(user);

      // Generate token
      const token = authService.generateToken(user);

      res.status(200).json({
        message: 'Password set successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          accountType: user.accountType,
          accountStatus: user.accountStatus,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to set password' });
    }
  }

  /**
   * Facebook OAuth - Redirect to Facebook
   * GET /api/auth/facebook
   */
  async facebookAuth(_req: Request, res: Response): Promise<void> {
    // This will be handled by passport middleware
    res.status(500).json({ error: 'This route should be handled by passport middleware' });
  }

  /**
   * Facebook OAuth Callback
   * GET /api/auth/facebook/callback
   */
  async facebookCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.redirect(`${process.env.FRONTEND_URL}?error=oauth_failed`);
        return;
      }

      // Generate JWT token
      const token = authService.generateToken(user);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}?token=${token}&oauth=success`);
    } catch (error: any) {
      console.error('Facebook OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}?error=oauth_failed`);
    }
  }
}

export const authController = new AuthController();
