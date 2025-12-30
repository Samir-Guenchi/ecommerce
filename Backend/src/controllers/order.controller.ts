import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order, OrderStatus } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';
import { Store } from '../entities';

export class OrderController {
  private orderRepository = AppDataSource.getRepository(Order);
  private storeRepository = AppDataSource.getRepository(Store);

  /**
   * Get all orders for authenticated user's stores
   * GET /api/orders
   */
  async getAllOrders(req: AuthRequest, res: Response): Promise<void> {
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

      if (storeIds.length === 0) {
        res.status(200).json({ orders: [] });
        return;
      }

      const orders = await this.orderRepository.find({
        where: storeIds.map(storeId => ({ storeId })),
        relations: ['store', 'user', 'shippingAddress', 'orderItems'],
        order: { createdAt: 'DESC' },
      });

      res.status(200).json({ orders });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get orders' });
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const orderId = parseInt(req.params.id, 10);

      if (isNaN(orderId)) {
        res.status(400).json({ error: 'Invalid order ID' });
        return;
      }

      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['store', 'user', 'shippingAddress', 'orderItems'],
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      // Verify order belongs to user's store
      const store = await this.storeRepository.findOne({
        where: { id: order.storeId },
      });

      if (!store || store.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.status(200).json({ order });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get order' });
    }
  }

  /**
   * Update order status
   * PATCH /api/orders/:id/status
   */
  async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const orderId = parseInt(req.params.id, 10);
      const { status, trackingNumber } = req.body;

      if (isNaN(orderId)) {
        res.status(400).json({ error: 'Invalid order ID' });
        return;
      }

      if (!status || !Object.values(OrderStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid order status' });
        return;
      }

      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      // Verify order belongs to user's store
      const store = await this.storeRepository.findOne({
        where: { id: order.storeId },
      });

      if (!store || store.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      order.status = status as OrderStatus;
      if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;

      // Update dates based on status
      if (status === OrderStatus.SHIPPED && !order.shippedDate) {
        order.shippedDate = new Date();
      }
      if (status === OrderStatus.DELIVERED && !order.deliveredDate) {
        order.deliveredDate = new Date();
      }

      const updatedOrder = await this.orderRepository.save(order);

      res.status(200).json({
        message: 'Order status updated successfully',
        order: updatedOrder,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update order status' });
    }
  }
}

export const orderController = new OrderController();



