import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AppDataSource } from '../config/database';
import { User } from '../entities';

export interface AuthRequest extends Request {
  user?: User;
  isAdmin?: boolean;
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token) as { id: number; email: string };

    // Get user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check if user is admin
    const isAdmin = await authService.isAdmin(user.id);

    // Attach user to request
    req.user = user;
    req.isAdmin = isAdmin;

    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Invalid token' });
  }
};

/**
 * Admin-only middleware
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};








