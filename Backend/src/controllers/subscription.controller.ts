import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Subscription, SubscriptionStatus } from '../entities';
import { Plan } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';

export class SubscriptionController {
  private subscriptionRepository = AppDataSource.getRepository(Subscription);
  private planRepository = AppDataSource.getRepository(Plan);

  /**
   * Get current subscription for user
   * GET /api/subscriptions/current
   */
  async getCurrentSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const subscription = await this.subscriptionRepository.findOne({
        where: { userId: req.user.id, status: SubscriptionStatus.ACTIVE },
        relations: ['plan'],
        order: { createdAt: 'DESC' },
      });

      if (!subscription) {
        // Return default free plan info
        res.status(200).json({
          subscription: null,
          plan: {
            id: 0,
            name: 'Free',
            price: 0,
            period: 'month',
            features: ['Basic features'],
          },
        });
        return;
      }

      res.status(200).json({ subscription, plan: subscription.plan });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get subscription' });
    }
  }

  /**
   * Get all available plans
   * GET /api/subscriptions/plans
   */
  async getPlans(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const plans = await this.planRepository.find({
        order: { price: 'ASC' },
      });

      res.status(200).json({ plans });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get plans' });
    }
  }
}

export const subscriptionController = new SubscriptionController();



