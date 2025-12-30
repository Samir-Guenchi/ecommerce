import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { DeliverySetting } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';

export class DeliveryController {
  private deliveryRepository = AppDataSource.getRepository(DeliverySetting);

  /**
   * Get delivery settings for current user
   * GET /api/delivery
   */
  async getDeliverySettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let delivery = await this.deliveryRepository.findOne({
        where: { userId: req.user.id },
      });

      // Create default if doesn't exist
      if (!delivery) {
        delivery = this.deliveryRepository.create({
          userId: req.user.id,
          shippingCost: 0,
          freeShippingThreshold: null,
          defaultShippingMethod: null,
        });
        delivery = await this.deliveryRepository.save(delivery);
      }

      res.status(200).json({ deliverySetting: delivery });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get delivery settings' });
    }
  }

  /**
   * Update delivery settings
   * PATCH /api/delivery
   */
  async updateDeliverySettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let delivery = await this.deliveryRepository.findOne({
        where: { userId: req.user.id },
      });

      if (!delivery) {
        delivery = this.deliveryRepository.create({
          userId: req.user.id,
        });
      }

      if (req.body.shippingCost !== undefined) {
        delivery.shippingCost = parseFloat(req.body.shippingCost) || 0;
      }
      if (req.body.freeShippingThreshold !== undefined) {
        delivery.freeShippingThreshold = req.body.freeShippingThreshold ? parseFloat(req.body.freeShippingThreshold) : null;
      }
      if (req.body.defaultShippingMethod !== undefined) {
        delivery.defaultShippingMethod = req.body.defaultShippingMethod || null;
      }
      if (req.body.settings !== undefined) {
        delivery.settings = req.body.settings;
      }

      const updatedDelivery = await this.deliveryRepository.save(delivery);

      res.status(200).json({
        message: 'Delivery settings updated successfully',
        deliverySetting: updatedDelivery,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update delivery settings' });
    }
  }
}

export const deliveryController = new DeliveryController();



