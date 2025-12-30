import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { TaxSetting } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';

export class TaxController {
  private taxRepository = AppDataSource.getRepository(TaxSetting);

  /**
   * Get tax settings for current user
   * GET /api/taxes
   */
  async getTaxSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let tax = await this.taxRepository.findOne({
        where: { userId: req.user.id },
      });

      // Create default if doesn't exist
      if (!tax) {
        tax = this.taxRepository.create({
          userId: req.user.id,
          taxRate: 0,
          dutyRate: 0,
          taxIncluded: false,
        });
        tax = await this.taxRepository.save(tax);
      }

      res.status(200).json({ taxSetting: tax });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get tax settings' });
    }
  }

  /**
   * Update tax settings
   * PATCH /api/taxes
   */
  async updateTaxSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let tax = await this.taxRepository.findOne({
        where: { userId: req.user.id },
      });

      if (!tax) {
        tax = this.taxRepository.create({
          userId: req.user.id,
        });
      }

      if (req.body.taxRate !== undefined) {
        tax.taxRate = parseFloat(req.body.taxRate) || 0;
      }
      if (req.body.dutyRate !== undefined) {
        tax.dutyRate = parseFloat(req.body.dutyRate) || 0;
      }
      if (req.body.taxIncluded !== undefined) {
        tax.taxIncluded = req.body.taxIncluded;
      }
      if (req.body.settings !== undefined) {
        tax.settings = req.body.settings;
      }

      const updatedTax = await this.taxRepository.save(tax);

      res.status(200).json({
        message: 'Tax settings updated successfully',
        taxSetting: updatedTax,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update tax settings' });
    }
  }
}

export const taxController = new TaxController();



