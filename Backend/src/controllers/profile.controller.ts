import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProfileController {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Get current user profile
   * GET /api/profile
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: req.user.id },
        select: ['id', 'email', 'fullName', 'phone', 'bio', 'accountType', 'accountStatus', 'languagePreference', 'createdAt', 'lastLogin'],
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get profile' });
    }
  }

  /**
   * Update user profile
   * PATCH /api/profile
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: req.user.id },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Update allowed fields
      if (req.body.fullName !== undefined) user.fullName = req.body.fullName;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.body.languagePreference !== undefined) user.languagePreference = req.body.languagePreference;
      if (req.body.accountType !== undefined) {
        // Validate accountType enum value
        const validTypes = ['buyer', 'seller', 'both'];
        if (validTypes.includes(req.body.accountType)) {
          user.accountType = req.body.accountType as any;
        }
      }

      // Email change requires special handling (not implemented here for security)
      // Account status changes require admin privileges

      const updatedUser = await this.userRepository.save(user);

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
          accountType: updatedUser.accountType,
          accountStatus: updatedUser.accountStatus,
          languagePreference: updatedUser.languagePreference,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update profile' });
    }
  }
}

export const profileController = new ProfileController();

