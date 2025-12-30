import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { PaymentMethod, PaymentMethodType } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';

export class PaymentController {
  private paymentRepository = AppDataSource.getRepository(PaymentMethod);

  /**
   * Get all payment methods for current user
   * GET /api/payments
   */
  async getAllPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const payments = await this.paymentRepository.find({
        where: { userId: req.user.id, isActive: true },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });

      res.status(200).json({ paymentMethods: payments });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get payment methods' });
    }
  }

  /**
   * Create payment method
   * POST /api/payments
   */
  async createPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { type, cardLast4, cardExpiry, isDefault } = req.body;

      if (!type) {
        res.status(400).json({ error: 'Payment type is required' });
        return;
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await this.paymentRepository.update(
          { userId: req.user.id },
          { isDefault: false }
        );
      }

      const payment = this.paymentRepository.create({
        userId: req.user.id,
        type: type as PaymentMethodType,
        cardLast4: cardLast4 || null,
        cardExpiry: cardExpiry || null,
        isDefault: isDefault || false,
        isActive: true,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      res.status(201).json({
        message: 'Payment method created successfully',
        paymentMethod: savedPayment,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create payment method' });
    }
  }

  /**
   * Update payment method
   * PATCH /api/payments/:id
   */
  async updatePayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const paymentId = parseInt(req.params.id, 10);
      if (isNaN(paymentId)) {
        res.status(400).json({ error: 'Invalid payment ID' });
        return;
      }

      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId, userId: req.user.id },
      });

      if (!payment) {
        res.status(404).json({ error: 'Payment method not found' });
        return;
      }

      // If setting as default, unset other defaults
      if (req.body.isDefault && !payment.isDefault) {
        await this.paymentRepository.update(
          { userId: req.user.id },
          { isDefault: false }
        );
      }

      if (req.body.isDefault !== undefined) payment.isDefault = req.body.isDefault;
      if (req.body.cardLast4 !== undefined) payment.cardLast4 = req.body.cardLast4;
      if (req.body.cardExpiry !== undefined) payment.cardExpiry = req.body.cardExpiry;

      const updatedPayment = await this.paymentRepository.save(payment);

      res.status(200).json({
        message: 'Payment method updated successfully',
        paymentMethod: updatedPayment,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update payment method' });
    }
  }

  /**
   * Delete payment method
   * DELETE /api/payments/:id
   */
  async deletePayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const paymentId = parseInt(req.params.id, 10);
      if (isNaN(paymentId)) {
        res.status(400).json({ error: 'Invalid payment ID' });
        return;
      }

      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId, userId: req.user.id },
      });

      if (!payment) {
        res.status(404).json({ error: 'Payment method not found' });
        return;
      }

      // Soft delete by setting isActive to false
      payment.isActive = false;
      await this.paymentRepository.save(payment);

      res.status(200).json({ message: 'Payment method deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to delete payment method' });
    }
  }
}

export const paymentController = new PaymentController();



