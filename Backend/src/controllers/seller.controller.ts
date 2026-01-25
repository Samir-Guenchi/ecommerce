import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { SellerRegistration, VerificationStatus } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';

export class SellerRegistrationController {
  private sellerRegistrationRepository = AppDataSource.getRepository(SellerRegistration);

  /**
   * Get all seller registrations
   * GET /api/seller-registrations
   */
  async getAllSellerRegistrations(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Admin check - you might want to add role-based auth here
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const registrations = await this.sellerRegistrationRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });

      res.status(200).json({ registrations });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get seller registrations' });
    }
  }

  /**
   * Get seller registration by ID
   * GET /api/seller-registrations/:id
   */
  async getSellerRegistrationById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const registrationId = parseInt(req.params.id, 10);

      if (isNaN(registrationId)) {
        res.status(400).json({ error: 'Invalid registration ID' });
        return;
      }

      const registration = await this.sellerRegistrationRepository.findOne({
        where: { id: registrationId },
        relations: ['user'],
      });

      if (!registration) {
        res.status(404).json({ error: 'Seller registration not found' });
        return;
      }

      res.status(200).json({ registration });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get seller registration' });
    }
  }

  /**
   * Approve seller registration
   * PUT /api/seller-registrations/:id/approve
   */
  async approveSellerRegistration(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const registrationId = parseInt(req.params.id, 10);

      if (isNaN(registrationId)) {
        res.status(400).json({ error: 'Invalid registration ID' });
        return;
      }

      const registration = await this.sellerRegistrationRepository.findOne({
        where: { id: registrationId },
        relations: ['user'],
      });

      if (!registration) {
        res.status(404).json({ error: 'Seller registration not found' });
        return;
      }

      registration.verificationStatus = VerificationStatus.APPROVED;
      registration.verifiedById = req.user.id;
      registration.verifiedAt = new Date();

      await this.sellerRegistrationRepository.save(registration);

      res.status(200).json({ message: 'Seller registration approved', registration });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to approve seller registration' });
    }
  }

  /**
   * Reject seller registration
   * PUT /api/seller-registrations/:id/reject
   */
  async rejectSellerRegistration(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const registrationId = parseInt(req.params.id, 10);

      if (isNaN(registrationId)) {
        res.status(400).json({ error: 'Invalid registration ID' });
        return;
      }

      const registration = await this.sellerRegistrationRepository.findOne({
        where: { id: registrationId },
        relations: ['user'],
      });

      if (!registration) {
        res.status(404).json({ error: 'Seller registration not found' });
        return;
      }

      registration.verificationStatus = VerificationStatus.REJECTED;
      registration.verifiedById = req.user.id;
      registration.verifiedAt = new Date();

      await this.sellerRegistrationRepository.save(registration);

      res.status(200).json({ message: 'Seller registration rejected', registration });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to reject seller registration' });
    }
  }
}