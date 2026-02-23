import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { SellerRating } from '../entities/SellerRating';
import { Order } from '../entities/Order';
import { User } from '../entities/User';
import { Store } from '../entities/Store';

export const ratingController = {
  // Create a rating (buyer rates seller after purchase)
  async createRating(req: Request, res: Response): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { orderId, sellerId, storeId, rating, review, productQuality, communication, shippingSpeed, packaging } = req.body;

      if (!buyerId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Verify order exists and belongs to buyer
      const orderRepo = AppDataSource.getRepository(Order);
      const order = await orderRepo.findOne({
        where: { id: orderId },
        relations: ['user'],
      });

      if (!order || order.user.id !== buyerId) {
        res.status(403).json({ message: 'Order not found or unauthorized' });
        return;
      }

      // Check if order is delivered
      if (order.status !== 'delivered') {
        res.status(400).json({ message: 'Can only rate after order is delivered' });
        return;
      }

      // Check if already rated
      const ratingRepo = AppDataSource.getRepository(SellerRating);
      const existingRating = await ratingRepo.findOne({
        where: { orderId, buyerId },
      });

      if (existingRating) {
        res.status(400).json({ message: 'Order already rated' });
        return;
      }

      // Create rating
      const newRating = ratingRepo.create({
        buyerId,
        sellerId,
        storeId,
        orderId,
        rating,
        review,
        productQuality,
        communication,
        shippingSpeed,
        packaging,
        status: 'active',
      });

      await ratingRepo.save(newRating);

      // Update seller average rating
      await updateSellerAverageRating(sellerId);

      res.status(201).json({
        message: 'Rating submitted successfully',
        rating: newRating,
      });
    } catch (error) {
      console.error('Create rating error:', error);
      res.status(500).json({ message: 'Failed to submit rating' });
    }
  },

  // Get ratings for a seller
  async getSellerRatings(req: Request, res: Response) {
    try {
      const { sellerId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const ratingRepo = AppDataSource.getRepository(SellerRating);
      
      const [ratings, total] = await ratingRepo.findAndCount({
        where: { sellerId: parseInt(sellerId), status: 'active' },
        relations: ['buyer', 'store', 'order'],
        order: { createdAt: 'DESC' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

      // Calculate statistics
      const stats = await ratingRepo
        .createQueryBuilder('rating')
        .select('AVG(rating)', 'averageRating')
        .addSelect('COUNT(*)', 'totalRatings')
        .addSelect('AVG(product_quality)', 'avgProductQuality')
        .addSelect('AVG(communication)', 'avgCommunication')
        .addSelect('AVG(shipping_speed)', 'avgShippingSpeed')
        .addSelect('AVG(packaging)', 'avgPackaging')
        .where('rating.seller_id = :sellerId', { sellerId })
        .andWhere('rating.status = :status', { status: 'active' })
        .getRawOne();

      // Rating distribution
      const distribution = await ratingRepo
        .createQueryBuilder('rating')
        .select('rating.rating', 'stars')
        .addSelect('COUNT(*)', 'count')
        .where('rating.seller_id = :sellerId', { sellerId })
        .andWhere('rating.status = :status', { status: 'active' })
        .groupBy('rating.rating')
        .getRawMany();

      res.json({
        ratings: ratings.map(r => ({
          id: r.id,
          rating: r.rating,
          review: r.review,
          productQuality: r.productQuality,
          communication: r.communication,
          shippingSpeed: r.shippingSpeed,
          packaging: r.packaging,
          sellerResponse: r.sellerResponse,
          sellerResponseDate: r.sellerResponseDate,
          helpfulCount: r.helpfulCount,
          createdAt: r.createdAt,
          buyer: {
            id: r.buyer.id,
            fullName: r.buyer.fullName,
          },
          store: r.store ? {
            id: r.store.id,
            name: r.store.name,
          } : null,
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        stats: {
          averageRating: parseFloat(stats.averageRating || '0'),
          totalRatings: parseInt(stats.totalRatings || '0'),
          avgProductQuality: parseFloat(stats.avgProductQuality || '0'),
          avgCommunication: parseFloat(stats.avgCommunication || '0'),
          avgShippingSpeed: parseFloat(stats.avgShippingSpeed || '0'),
          avgPackaging: parseFloat(stats.avgPackaging || '0'),
        },
        distribution,
      });
    } catch (error) {
      console.error('Get seller ratings error:', error);
      res.status(500).json({ message: 'Failed to fetch ratings' });
    }
  },

  // Seller responds to a rating
  async respondToRating(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user?.id;
      const { ratingId } = req.params;
      const { response } = req.body;

      if (!sellerId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const ratingRepo = AppDataSource.getRepository(SellerRating);
      const rating = await ratingRepo.findOne({
        where: { id: parseInt(ratingId) },
      });

      if (!rating || rating.sellerId !== sellerId) {
        res.status(403).json({ message: 'Rating not found or unauthorized' });
        return;
      }

      rating.sellerResponse = response;
      rating.sellerResponseDate = new Date();
      await ratingRepo.save(rating);

      res.json({
        message: 'Response submitted successfully',
        rating,
      });
    } catch (error) {
      console.error('Respond to rating error:', error);
      res.status(500).json({ message: 'Failed to submit response' });
    }
  },

  // Mark rating as helpful
  async markHelpful(req: Request, res: Response): Promise<void> {
    try {
      const { ratingId } = req.params;

      const ratingRepo = AppDataSource.getRepository(SellerRating);
      const rating = await ratingRepo.findOne({
        where: { id: parseInt(ratingId) },
      });

      if (!rating) {
        res.status(404).json({ message: 'Rating not found' });
        return;
      }

      rating.helpfulCount += 1;
      await ratingRepo.save(rating);

      res.json({
        message: 'Marked as helpful',
        helpfulCount: rating.helpfulCount,
      });
    } catch (error) {
      console.error('Mark helpful error:', error);
      res.status(500).json({ message: 'Failed to mark as helpful' });
    }
  },

  // Check if buyer can rate an order
  async canRateOrder(req: Request, res: Response): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { orderId } = req.params;

      if (!buyerId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const orderRepo = AppDataSource.getRepository(Order);
      const order = await orderRepo.findOne({
        where: { id: parseInt(orderId) },
        relations: ['user'],
      });

      if (!order || order.user.id !== buyerId) {
        res.json({ canRate: false, reason: 'Order not found' });
        return;
      }

      if (order.status !== 'delivered') {
        res.json({ canRate: false, reason: 'Order not delivered yet' });
        return;
      }

      const ratingRepo = AppDataSource.getRepository(SellerRating);
      const existingRating = await ratingRepo.findOne({
        where: { orderId: parseInt(orderId), buyerId },
      });

      if (existingRating) {
        res.json({ canRate: false, reason: 'Already rated' });
        return;
      }

      res.json({ canRate: true });
    } catch (error) {
      console.error('Can rate order error:', error);
      res.status(500).json({ message: 'Failed to check rating eligibility' });
    }
  },
};

// Helper function to update seller average rating
async function updateSellerAverageRating(sellerId: number) {
  try {
    const ratingRepo = AppDataSource.getRepository(SellerRating);
    const stats = await ratingRepo
      .createQueryBuilder('rating')
      .select('AVG(rating)', 'averageRating')
      .addSelect('COUNT(*)', 'totalRatings')
      .where('rating.seller_id = :sellerId', { sellerId })
      .andWhere('rating.status = :status', { status: 'active' })
      .getRawOne();

    const userRepo = AppDataSource.getRepository(User);
    await userRepo.update(sellerId, {
      averageRating: parseFloat(stats.averageRating || '0'),
      totalRatings: parseInt(stats.totalRatings || '0'),
    });
  } catch (error) {
    console.error('Update seller average rating error:', error);
  }
}
