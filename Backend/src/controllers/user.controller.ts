import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, AccountStatus } from '../entities';
import { AuthRequest, requireAdmin } from '../middleware/auth.middleware';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Get all users (Admin only)
   * GET /api/users
   */
  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      await requireAdmin(req, res, async () => {
        const users = await this.userRepository.find({
          select: ['id', 'email', 'fullName', 'accountType', 'accountStatus', 'createdAt', 'lastLogin'],
          order: { createdAt: 'DESC' },
        });

        res.status(200).json({
          users,
        });
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get users' });
    }
  }

  /**
   * Get user by ID (Admin only)
   * GET /api/users/:id
   */
  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.isAdmin) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'fullName', 'accountType', 'accountStatus', 'createdAt', 'lastLogin', 'phone', 'bio'],
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        user,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get user' });
    }
  }

  /**
   * Update user account status (Admin only)
   * PATCH /api/users/:id/status
   */
  async updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.isAdmin) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const userId = parseInt(req.params.id, 10);
      const { accountStatus } = req.body;

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      if (!accountStatus || !Object.values(AccountStatus).includes(accountStatus)) {
        res.status(400).json({ error: 'Invalid account status' });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Prevent admin from changing their own status
      const { authService } = await import('../services/auth.service');
      const isAdmin = await authService.isAdmin(userId);
      if (isAdmin) {
        res.status(403).json({ error: 'Cannot change admin account status' });
        return;
      }

      user.accountStatus = accountStatus as AccountStatus;
      await this.userRepository.save(user);

      res.status(200).json({
        message: 'User status updated successfully',
        user: {
          id: user.id,
          email: user.email,
          accountStatus: user.accountStatus,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update user status' });
    }
  }

  /**
   * Delete user (Admin only)
   * DELETE /api/users/:id
   */
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.isAdmin) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Prevent admin from deleting themselves
      const { authService } = await import('../services/auth.service');
      const isAdmin = await authService.isAdmin(userId);
      if (isAdmin) {
        res.status(403).json({ error: 'Cannot delete admin account' });
        return;
      }

      await this.userRepository.remove(user);

      res.status(200).json({
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
  }
}

export const userController = new UserController();

