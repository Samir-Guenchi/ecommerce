import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { SellerRegistration, VerificationStatus } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';

export class SellerRegistrationController {
  private sellerRegistrationRepository = AppDataSource.getRepository(SellerRegistration);

  /**
   * Create or update seller registration with documents
   * POST /api/seller-registrations/upload
   */
  async uploadDocuments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      console.log('📤 Document upload request from user:', req.user.id);
      console.log('📎 Files received:', req.files ? Object.keys(req.files) : 'none');

      // Get uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || Object.keys(files).length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      // Extract file paths (relative to uploads directory)
      let document1Path: string | null = null;
      let document2Path: string | null = null;

      // Check for business_license or businessLicense
      if (files.business_license && files.business_license[0]) {
        document1Path = `uploads/${files.business_license[0].filename}`;
      } else if (files.businessLicense && files.businessLicense[0]) {
        document1Path = `uploads/${files.businessLicense[0].filename}`;
      }

      // Check for id_card or idCard
      if (files.id_card && files.id_card[0]) {
        document2Path = `uploads/${files.id_card[0].filename}`;
      } else if (files.idCard && files.idCard[0]) {
        document2Path = `uploads/${files.idCard[0].filename}`;
      }

      console.log('📁 Document paths:', { document1Path, document2Path });

      // Check if user already has a registration
      let registration = await this.sellerRegistrationRepository.findOne({
        where: { userId: req.user.id },
      });

      if (registration) {
        // Update existing registration
        if (document1Path) registration.document1Path = document1Path;
        if (document2Path) registration.document2Path = document2Path;
        registration.verificationStatus = VerificationStatus.PENDING;
        registration.verifiedAt = null;
        registration.verifiedById = null;
        registration.rejectionReason = null;
        
        console.log('✏️ Updating existing registration:', registration.id);
      } else {
        // Create new registration
        registration = this.sellerRegistrationRepository.create({
          userId: req.user.id,
          fullName: req.user.fullName || '',
          document1Path,
          document2Path,
          verificationStatus: VerificationStatus.PENDING,
        });
        
        console.log('✨ Creating new registration');
      }

      const savedRegistration = await this.sellerRegistrationRepository.save(registration);
      console.log('✅ Registration saved:', savedRegistration.id);

      res.status(200).json({
        message: 'Documents uploaded successfully',
        registration: savedRegistration,
      });
    } catch (error: any) {
      console.error('❌ Document upload error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload documents' });
    }
  }

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