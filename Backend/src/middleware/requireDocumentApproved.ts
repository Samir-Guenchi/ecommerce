import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { SellerRegistration, VerificationStatus } from '../entities/SellerRegistration';
import { AccountType } from '../entities/User';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware that checks if seller/delivery user has approved documents.
 * Buyers and admins pass through unblocked.
 */
export const requireDocumentApproved = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Admins and buyers skip document check
        if (req.isAdmin || req.user.accountType === AccountType.BUYER) {
            next();
            return;
        }

        // Sellers, delivery, and both need approved documents
        const registrationRepo = AppDataSource.getRepository(SellerRegistration);
        const registration = await registrationRepo.findOne({
            where: { userId: req.user.id },
        });

        if (!registration) {
            res.status(403).json({
                error: 'Documents not uploaded',
                code: 'DOCUMENTS_NOT_UPLOADED',
                message: 'You must upload your verification documents before accessing this feature.',
            });
            return;
        }

        if (registration.verificationStatus === VerificationStatus.PENDING) {
            res.status(403).json({
                error: 'Documents pending review',
                code: 'DOCUMENTS_PENDING',
                message: 'Your documents are being reviewed by our team. Please wait for approval.',
            });
            return;
        }

        if (registration.verificationStatus === VerificationStatus.REJECTED) {
            res.status(403).json({
                error: 'Documents rejected',
                code: 'DOCUMENTS_REJECTED',
                message: 'Your documents were rejected. Please re-upload corrected documents.',
                rejectionReason: registration.rejectionReason,
            });
            return;
        }

        // VerificationStatus.APPROVED — allow through
        next();
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to verify document status' });
    }
};
