import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, AccountStatus, AccountType } from '../entities/User';
import { SellerRegistration, VerificationStatus } from '../entities/SellerRegistration';
import { Store, StoreStatus } from '../entities/Store';
import { Order, OrderStatus } from '../entities/Order';
import { Product } from '../entities/Product';
import { AuthRequest } from '../middleware/auth.middleware';

export class AdminController {
  private userRepository = AppDataSource.getRepository(User);
  private sellerRegistrationRepository = AppDataSource.getRepository(SellerRegistration);
  private productRepository = AppDataSource.getRepository(Product);

  /**
   * Get all users with filters
   * GET /api/admin/users
   */
  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { accountType, accountStatus, search } = req.query;

      const queryBuilder = this.userRepository.createQueryBuilder('user');

      if (accountType) {
        queryBuilder.andWhere('user.accountType = :accountType', { accountType });
      }

      if (accountStatus) {
        queryBuilder.andWhere('user.accountStatus = :accountStatus', { accountStatus });
      }

      if (search) {
        queryBuilder.andWhere(
          '(user.fullName LIKE :search OR user.email LIKE :search)',
          { search: `%${search}%` }
        );
      }

      const users = await queryBuilder
        .orderBy('user.createdAt', 'DESC')
        .getMany();

      // Remove password hashes
      const sanitizedUsers = users.map(user => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.status(200).json({ users: sanitizedUsers });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/admin/stats
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const totalUsers = await this.userRepository.count();
      const totalBuyers = await this.userRepository.count({ where: { accountType: AccountType.BUYER } });
      const totalSellers = await this.userRepository.count({ where: { accountType: AccountType.SELLER } });

      const totalDelivery = await this.userRepository.count({ where: { accountType: AccountType.DELIVERY } });
      
      const pendingUsers = await this.userRepository.count({ where: { accountStatus: AccountStatus.PENDING } });
      const activeUsers = await this.userRepository.count({ where: { accountStatus: AccountStatus.ACTIVE } });
      const suspendedUsers = await this.userRepository.count({ where: { accountStatus: AccountStatus.SUSPENDED } });

      const pendingSellerRegistrations = await this.sellerRegistrationRepository.count({
        where: { verificationStatus: VerificationStatus.PENDING }
      });

      const pendingDeliveryRegistrations = await this.userRepository.count({
        where: { accountType: AccountType.DELIVERY, accountStatus: AccountStatus.PENDING }
      });

      // Get transaction stats (if Transaction entity exists)
      const storeRepository = AppDataSource.getRepository(Store);
      const totalStores = await storeRepository.count();
      const activeStores = await storeRepository.count({ where: { status: StoreStatus.ACTIVE } });

      // Get order stats
      const orderRepository = AppDataSource.getRepository(Order);
      const totalOrders = await orderRepository.count();
      const completedOrders = await orderRepository.count({ where: { status: OrderStatus.DELIVERED } });
      
      // Calculate total revenue from completed orders
      const revenueResult = await orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totalAmount)', 'total')
        .where('order.status = :status', { status: 'delivered' })
        .getRawOne();
      const totalRevenue = parseFloat(revenueResult?.total || '0');

      // Get user growth data for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentBuyers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.accountType = :type', { type: AccountType.BUYER })
        .andWhere('user.createdAt >= :date', { date: sevenDaysAgo })
        .getCount();

      const recentSellers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.accountType = :type', { type: AccountType.SELLER })
        .andWhere('user.createdAt >= :date', { date: sevenDaysAgo })
        .getCount();

      const recentDelivery = await this.userRepository
        .createQueryBuilder('user')
        .where('user.accountType = :type', { type: AccountType.DELIVERY })
        .andWhere('user.createdAt >= :date', { date: sevenDaysAgo })
        .getCount();

      // Get weekly growth data for charts (last 7 days)
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayBuyers = await this.userRepository
          .createQueryBuilder('user')
          .where('user.accountType = :type', { type: AccountType.BUYER })
          .andWhere('user.createdAt >= :start', { start: date })
          .andWhere('user.createdAt < :end', { end: nextDate })
          .getCount();

        const daySellers = await this.userRepository
          .createQueryBuilder('user')
          .where('user.accountType = :type', { type: AccountType.SELLER })
          .andWhere('user.createdAt >= :start', { start: date })
          .andWhere('user.createdAt < :end', { end: nextDate })
          .getCount();

        const dayDelivery = await this.userRepository
          .createQueryBuilder('user')
          .where('user.accountType = :type', { type: AccountType.DELIVERY })
          .andWhere('user.createdAt >= :start', { start: date })
          .andWhere('user.createdAt < :end', { end: nextDate })
          .getCount();

        const dayOrders = await orderRepository
          .createQueryBuilder('order')
          .where('order.createdAt >= :start', { start: date })
          .andWhere('order.createdAt < :end', { end: nextDate })
          .getCount();

        weeklyData.push({
          date: date.toISOString().split('T')[0],
          buyers: dayBuyers,
          sellers: daySellers,
          delivery: dayDelivery,
          orders: dayOrders,
        });
      }

      res.status(200).json({
        stats: {
          totalUsers,
          totalBuyers,
          totalSellers,
          totalDelivery,
          pendingUsers,
          activeUsers,
          suspendedUsers,
          pendingSellerRegistrations,
          pendingDeliveryRegistrations,
          totalStores,
          activeStores,
          totalOrders,
          completedOrders,
          totalRevenue,
          recentBuyers,
          recentSellers,
          recentDelivery,
          weeklyData,
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch stats' });
    }
  }

  /**
   * Get pending seller/delivery registrations
   * GET /api/admin/pending-registrations
   */
  async getPendingRegistrations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sellerRegistrations = await this.sellerRegistrationRepository
        .createQueryBuilder('registration')
        .leftJoinAndSelect('registration.user', 'user')
        .where('registration.verificationStatus = :status', { status: VerificationStatus.PENDING })
        .orderBy('registration.createdAt', 'DESC')
        .getMany();

      res.status(200).json({ registrations: sellerRegistrations });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch pending registrations' });
    }
  }

  /**
   * Approve seller/delivery registration
   * POST /api/admin/approve-registration/:id
   */
  async approveRegistration(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const registration = await this.sellerRegistrationRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['user']
      });

      if (!registration) {
        res.status(404).json({ error: 'Registration not found' });
        return;
      }

      // Update registration status
      registration.verificationStatus = VerificationStatus.APPROVED;
      registration.verifiedAt = new Date();
      await this.sellerRegistrationRepository.save(registration);

      // Update user status to active
      if (registration.user) {
        registration.user.accountStatus = AccountStatus.ACTIVE;
        await this.userRepository.save(registration.user);
      }

      res.status(200).json({ 
        message: 'Registration approved successfully',
        registration 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to approve registration' });
    }
  }

  /**
   * Reject seller/delivery registration
   * POST /api/admin/reject-registration/:id
   */
  async rejectRegistration(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({ error: 'Rejection reason is required' });
        return;
      }

      const registration = await this.sellerRegistrationRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['user']
      });

      if (!registration) {
        res.status(404).json({ error: 'Registration not found' });
        return;
      }

      // Update registration status
      registration.verificationStatus = VerificationStatus.REJECTED;
      registration.rejectionReason = reason;
      registration.verifiedAt = new Date();
      await this.sellerRegistrationRepository.save(registration);

      res.status(200).json({ 
        message: 'Registration rejected successfully',
        registration 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to reject registration' });
    }
  }

  /**
   * Suspend user account
   * POST /api/admin/suspend-user/:id
   */
  async suspendUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        res.status(400).json({ error: 'Suspension reason is required' });
        return;
      }

      const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (user.isAdmin) {
        res.status(403).json({ error: 'Cannot suspend admin users' });
        return;
      }

      user.accountStatus = AccountStatus.SUSPENDED;
      user.suspensionReason = reason.trim();
      user.suspendedAt = new Date();
      user.suspendedById = req.user?.id || null;
      await this.userRepository.save(user);

      // TODO: Send notification email to user about suspension
      // await emailService.sendSuspensionNotification(user.email, reason);

      res.status(200).json({ 
        message: 'User suspended successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          accountStatus: user.accountStatus,
          suspensionReason: user.suspensionReason,
          suspendedAt: user.suspendedAt
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to suspend user' });
    }
  }

  /**
   * Activate user account
   * POST /api/admin/activate-user/:id
   */
  async activateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user.accountStatus = AccountStatus.ACTIVE;
      // Clear suspension fields
      user.suspensionReason = null;
      user.suspendedAt = null;
      user.suspendedById = null;
      await this.userRepository.save(user);

      res.status(200).json({ 
        message: 'User activated successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          accountStatus: user.accountStatus
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to activate user' });
    }
  }

  /**
   * Delete user account (soft delete)
   * DELETE /api/admin/delete-user/:id
   */
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        res.status(400).json({ error: 'Deletion reason is required' });
        return;
      }

      const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (user.isAdmin) {
        res.status(403).json({ error: 'Cannot delete admin users' });
        return;
      }

      // Soft delete: mark as deleted instead of removing from database
      user.deletedAt = new Date();
      user.deletionReason = reason.trim();
      user.deletedById = req.user?.id || null;
      user.accountStatus = AccountStatus.SUSPENDED; // Also suspend the account
      await this.userRepository.save(user);

      // TODO: Send notification email to user about deletion
      // await emailService.sendDeletionNotification(user.email, reason);

      res.status(200).json({ 
        message: 'User deleted successfully',
        user: {
          id: user.id,
          email: user.email,
          deletedAt: user.deletedAt,
          deletionReason: user.deletionReason
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
  }

  /**
   * Get all stores (admin view)
   * GET /api/admin/stores
   */
  async getAllStores(req: AuthRequest, res: Response): Promise<void> {
    try {
      const storeRepository = AppDataSource.getRepository(Store);
      const stores = await storeRepository
        .createQueryBuilder('store')
        .leftJoinAndSelect('store.user', 'user')
        .select([
          'store',
          'user.id',
          'user.email',
          'user.fullName',
          'user.accountStatus'
        ])
        .orderBy('store.createdAt', 'DESC')
        .getMany();

      res.status(200).json({ stores });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch stores' });
    }
  }

  /**
   * Suspend/Activate store
   * PATCH /api/admin/stores/:id/status
   */
  async updateStoreStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'suspended', 'draft'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const storeRepository = AppDataSource.getRepository(Store);
      const store = await storeRepository.findOne({ where: { id: parseInt(id) } });

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      await storeRepository.update(parseInt(id), { status });

      res.status(200).json({ 
        message: `Store ${status === 'suspended' ? 'suspended' : 'activated'} successfully`,
        store: { ...store, status }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update store status' });
    }
  }

  /**
   * Get all delivery personnel
   * GET /api/admin/delivery-personnel
   */
  async getDeliveryPersonnel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const deliveryUsers = await this.userRepository.find({
        where: { accountType: AccountType.DELIVERY },
        order: { createdAt: 'DESC' }
      });

      const sanitized = deliveryUsers.map(user => {
        const { passwordHash, ...rest } = user;
        return rest;
      });

      res.status(200).json({ deliveryPersonnel: sanitized });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch delivery personnel' });
    }
  }

  /**
   * Get all sellers with their stores
   * GET /api/admin/sellers
   */
  async getSellers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sellers = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.sellerRegistration', 'registration')
        .leftJoinAndSelect('user.stores', 'stores')
        .where('user.accountType = :type', { type: AccountType.SELLER })
        .orderBy('user.createdAt', 'DESC')
        .getMany();

      const sanitized = sellers.map(user => {
        const { passwordHash, ...rest } = user;
        return rest;
      });

      res.status(200).json({ sellers: sanitized });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch sellers' });
    }
  }

  /**
   * Get all products from all stores
   * GET /api/admin/products
   */
  async getAllProducts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.store', 'store')
        .leftJoinAndSelect('store.user', 'user')
        .orderBy('product.createdAt', 'DESC')
        .getMany();

      res.status(200).json({ products });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch products' });
    }
  }

  /**
   * Delete product with reason
   * DELETE /api/admin/products/:id
   */
  async deleteProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      if (isNaN(productId)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      if (!reason || !reason.trim()) {
        res.status(400).json({ error: 'Reason is required' });
        return;
      }

      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['store', 'store.user'],
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // TODO: Send notification to store owner with reason
      // For now, just delete the product
      await this.productRepository.remove(product);

      res.status(200).json({ 
        message: 'Product deleted successfully',
        reason,
        storeOwner: product.store.user.email,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete product' });
    }
  }

  /**
   * Delete store with reason
   * DELETE /api/admin/stores/:id
   */
  async deleteStore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      if (isNaN(storeId)) {
        res.status(400).json({ error: 'Invalid store ID' });
        return;
      }

      if (!reason || !reason.trim()) {
        res.status(400).json({ error: 'Reason is required' });
        return;
      }

      const storeRepository = AppDataSource.getRepository(Store);
      const store = await storeRepository.findOne({
        where: { id: storeId },
        relations: ['user'],
      });

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      // TODO: Send notification to store owner with reason
      await storeRepository.remove(store);

      res.status(200).json({ 
        message: 'Store deleted successfully',
        reason,
        storeOwner: store.user.email,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete store' });
    }
  }

  /**
   * Suspend store with reason
   * PATCH /api/admin/stores/:id/suspend
   */
  async suspendStore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      if (isNaN(storeId)) {
        res.status(400).json({ error: 'Invalid store ID' });
        return;
      }

      if (!reason || !reason.trim()) {
        res.status(400).json({ error: 'Reason is required' });
        return;
      }

      const storeRepository = AppDataSource.getRepository(Store);
      const store = await storeRepository.findOne({
        where: { id: storeId },
        relations: ['user'],
      });

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      store.status = 'suspended' as any;
      await storeRepository.save(store);

      // TODO: Send notification to store owner with reason

      res.status(200).json({ 
        message: 'Store suspended successfully',
        reason,
        storeOwner: store.user.email,
        store,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to suspend store' });
    }
  }

  /**
   * Suspend seller with reason
   * PATCH /api/admin/sellers/:id/suspend
   */
  async suspendSeller(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sellerId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      if (isNaN(sellerId)) {
        res.status(400).json({ error: 'Invalid seller ID' });
        return;
      }

      if (!reason || !reason.trim()) {
        res.status(400).json({ error: 'Reason is required' });
        return;
      }

      const seller = await this.userRepository.findOne({
        where: { id: sellerId },
      });

      if (!seller) {
        res.status(404).json({ error: 'Seller not found' });
        return;
      }

      seller.accountStatus = AccountStatus.SUSPENDED;
      await this.userRepository.save(seller);

      // TODO: Send notification to seller with reason

      res.status(200).json({ 
        message: 'Seller suspended successfully',
        reason,
        seller: { id: seller.id, email: seller.email, accountStatus: seller.accountStatus },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to suspend seller' });
    }
  }

  /**
   * Delete seller with reason
   * DELETE /api/admin/sellers/:id
   */
  async deleteSeller(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sellerId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      if (isNaN(sellerId)) {
        res.status(400).json({ error: 'Invalid seller ID' });
        return;
      }

      if (!reason || !reason.trim()) {
        res.status(400).json({ error: 'Reason is required' });
        return;
      }

      const seller = await this.userRepository.findOne({
        where: { id: sellerId },
      });

      if (!seller) {
        res.status(404).json({ error: 'Seller not found' });
        return;
      }

      // TODO: Send notification to seller with reason
      await this.userRepository.remove(seller);

      res.status(200).json({ 
        message: 'Seller deleted successfully',
        reason,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete seller' });
    }
  }

  /**
   * Suspend delivery personnel with reason
   * PATCH /api/admin/delivery/:id/suspend
   */
  async suspendDelivery(req: AuthRequest, res: Response): Promise<void> {
    try {
      const deliveryId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      if (isNaN(deliveryId)) {
        res.status(400).json({ error: 'Invalid delivery personnel ID' });
        return;
      }

      if (!reason || !reason.trim()) {
        res.status(400).json({ error: 'Reason is required' });
        return;
      }

      const delivery = await this.userRepository.findOne({
        where: { id: deliveryId },
      });

      if (!delivery) {
        res.status(404).json({ error: 'Delivery personnel not found' });
        return;
      }

      delivery.accountStatus = AccountStatus.SUSPENDED;
      await this.userRepository.save(delivery);

      // TODO: Send notification to delivery personnel with reason

      res.status(200).json({ 
        message: 'Delivery personnel suspended successfully',
        reason,
        delivery: { id: delivery.id, email: delivery.email, accountStatus: delivery.accountStatus },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to suspend delivery personnel' });
    }
  }

  /**
   * Delete delivery personnel with reason
   * DELETE /api/admin/delivery/:id
   */
  async deleteDelivery(req: AuthRequest, res: Response): Promise<void> {
    try {
      const deliveryId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      if (isNaN(deliveryId)) {
        res.status(400).json({ error: 'Invalid delivery personnel ID' });
        return;
      }

      if (!reason || !reason.trim()) {
        res.status(400).json({ error: 'Reason is required' });
        return;
      }

      const delivery = await this.userRepository.findOne({
        where: { id: deliveryId },
      });

      if (!delivery) {
        res.status(404).json({ error: 'Delivery personnel not found' });
        return;
      }

      // TODO: Send notification to delivery personnel with reason
      await this.userRepository.remove(delivery);

      res.status(200).json({ 
        message: 'Delivery personnel deleted successfully',
        reason,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete delivery personnel' });
    }
  }
}

