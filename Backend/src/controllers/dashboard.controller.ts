import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order, Product, Store, Event } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';
import { Between, In } from 'typeorm';

export class DashboardController {
  private orderRepository = AppDataSource.getRepository(Order);
  private productRepository = AppDataSource.getRepository(Product);
  private storeRepository = AppDataSource.getRepository(Store);
  private eventRepository = AppDataSource.getRepository(Event);

  /**
   * Get dashboard statistics
   * GET /api/dashboard/stats
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user's stores
      const stores = await this.storeRepository.find({
        where: { userId: req.user.id },
        select: ['id'],
      });
      const storeIds = stores.map(s => s.id);

      // Get all orders for user's stores
      let orders: any[] = [];
      if (storeIds.length > 0) {
        orders = await this.orderRepository.find({
          where: { storeId: In(storeIds) },
          order: { orderDate: 'DESC' },
        });
      }

      // Get all products
      let products: any[] = [];
      if (storeIds.length > 0) {
        products = await this.productRepository.find({
          where: { storeId: In(storeIds) },
        });
      }

      // Compute revenue
      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0);
      const totalOrders = orders.length;

      // Product stats
      const activeProducts = products.filter(p => p.status === 'active').length;
      const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
      const outOfStock = products.filter(p => p.stock === 0).length;

      // Weekly order trend (last 7 days)
      const now = new Date();
      const weeklyTrend: number[] = [];
      const dayLabels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(day.getDate() - i);
        const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
        const count = orders.filter(o => {
          const d = new Date(o.orderDate);
          return d >= dayStart && d < dayEnd;
        }).length;
        weeklyTrend.push(count);
        dayLabels.push(day.toLocaleDateString('en', { weekday: 'short' }).substring(0, 3));
      }

      // Previous week orders for trend calculation
      const prevWeekStart = new Date(now);
      prevWeekStart.setDate(prevWeekStart.getDate() - 14);
      const prevWeekEnd = new Date(now);
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
      const prevWeekOrders = orders.filter(o => {
        const d = new Date(o.orderDate);
        return d >= prevWeekStart && d < prevWeekEnd;
      }).length;
      const thisWeekOrders = weeklyTrend.reduce((a, b) => a + b, 0);
      const revenueTrend = prevWeekOrders > 0
        ? ((thisWeekOrders - prevWeekOrders) / prevWeekOrders * 100).toFixed(1)
        : '0';

      // Recent orders (last 5)
      const recentOrders = orders.slice(0, 5).map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        totalAmount: o.totalAmount,
        status: o.status,
        orderDate: o.orderDate,
      }));

      // Order status distribution
      const statusCounts: Record<string, number> = {};
      orders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });

      // Events count
      let eventsCount = 0;
      if (storeIds.length > 0) {
        eventsCount = await this.eventRepository.count({
          where: { storeId: In(storeIds) },
        });
      }

      res.status(200).json({
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts: products.length,
          totalStores: stores.length,
          activeProducts,
          lowStock,
          outOfStock,
          weeklyTrend,
          dayLabels,
          revenueTrend: parseFloat(revenueTrend),
          previousWeekOrders: prevWeekOrders,
          thisWeekOrders,
          recentOrders,
          statusCounts,
          eventsCount,
        },
      });
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to get dashboard stats' });
    }
  }
}

export const dashboardController = new DashboardController();
