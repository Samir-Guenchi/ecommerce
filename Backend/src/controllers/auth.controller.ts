import { Request, Response } from 'express';
import { authService, SignUpData, LoginData, VerificationData } from '../services/auth.service';
import { AppDataSource } from '../config/database';
import { User } from '../entities';

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
   * Google OAuth Callback
   * GET /api/auth/google/callback
   */
  async googleCallback(req: Request, res: Response): Promise<void> {
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
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}?error=oauth_failed`);
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
