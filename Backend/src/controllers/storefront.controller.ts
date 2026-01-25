import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import {
  Product,
  ProductStatus,
  Store,
  StoreStatus,
  Transaction,
  TransactionStatus,
  TransactionType,
  Order,
  OrderItem,
  Address,
  User,
  AccountType,
} from '../entities';
import { eventService } from '../services/event.service';

const buildReference = (domain: string): string => {
  const random = Math.random().toString(36).slice(2, 8);
  return `${domain}-${Date.now()}-${random}`;
};

export class StorefrontController {
  private storeRepository = AppDataSource.getRepository(Store);
  private productRepository = AppDataSource.getRepository(Product);
  private transactionRepository = AppDataSource.getRepository(Transaction);
  private orderRepository = AppDataSource.getRepository(Order);
  private orderItemRepository = AppDataSource.getRepository(OrderItem);
  private addressRepository = AppDataSource.getRepository(Address);
  private userRepository = AppDataSource.getRepository(User);

  private async getStoreByDomain(domain: string): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { domain },
      relations: ['user'],
    });
  }

  /**
   * Public endpoint to resolve a store by its domain and load its products
   * GET /api/storefront/:domain
   */
  async resolveStore(req: Request, res: Response): Promise<void> {
    try {
      const { domain } = req.params;

      if (!domain) {
        res.status(400).json({ error: 'Store domain is required' });
        return;
      }

      const store = await this.getStoreByDomain(domain);

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      if (store.status !== StoreStatus.ACTIVE) {
        res.status(403).json({ error: 'Store is not active' });
        return;
      }

      const products = await this.productRepository.find({
        where: { storeId: store.id, status: ProductStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });

      const mappedProducts = products.map(p => ({ ...p, price: Number(p.price) }));

      res.status(200).json({ store, products: mappedProducts });

      // Track page view event
      try {
        await eventService.createEvent('page_view', null, store.id, {
          page: 'store',
          domain: domain,
          productCount: products.length,
        });
      } catch (error) {
        console.error('Failed to track page view event:', error);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load store' });
    }
  }

  /**
   * Public endpoint to fetch a single product for a store domain
   * GET /api/storefront/:domain/products/:productId
   */
  async getProductForStore(req: Request, res: Response): Promise<void> {
    try {
      const { domain, productId } = req.params;
      const parsedId = parseInt(productId, 10);

      if (!domain || Number.isNaN(parsedId)) {
        res.status(400).json({ error: 'Domain and valid product ID are required' });
        return;
      }

      const store = await this.getStoreByDomain(domain);

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      const product = await this.productRepository.findOne({
        where: { id: parsedId, storeId: store.id, status: ProductStatus.ACTIVE },
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found for this store' });
        return;
      }

      const mappedProduct = { ...product, price: Number(product.price) };

      res.status(200).json({ store, product: mappedProduct });

      // Track view content event
      try {
        await eventService.createEvent('view_content', null, store.id, {
          page: 'product',
          productId: parsedId,
          productName: product.name,
          domain: domain,
        });
      } catch (error) {
        console.error('Failed to track view content event:', error);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load product' });
    }
  }

  /**
   * Record a transaction for a store domain ensuring it is tied to the seller
   * POST /api/storefront/:domain/transactions
   */
  async recordTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { domain } = req.params;
      const { amount, orderId, paymentMethodId, transactionType, status, transactionReference } = req.body;

      if (!domain) {
        res.status(400).json({ error: 'Store domain is required' });
        return;
      }

      if (amount === undefined || amount === null) {
        res.status(400).json({ error: 'Transaction amount is required' });
        return;
      }

      const numericAmount = parseFloat(amount);

      if (Number.isNaN(numericAmount)) {
        res.status(400).json({ error: 'Transaction amount must be a number' });
        return;
      }

      const store = await this.getStoreByDomain(domain);

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      const resolvedType = Object.values(TransactionType).includes(transactionType)
        ? transactionType
        : TransactionType.PAYMENT;

      const resolvedStatus = Object.values(TransactionStatus).includes(status)
        ? status
        : TransactionStatus.PENDING;

      const transaction = this.transactionRepository.create({
        userId: store.userId, // ensure seller receives the transaction
        orderId: orderId ? parseInt(orderId, 10) : null,
        paymentMethodId: paymentMethodId ? parseInt(paymentMethodId, 10) : null,
        amount: numericAmount,
        currency: 'DZD',
        transactionType: resolvedType,
        status: resolvedStatus,
        transactionReference: transactionReference || buildReference(domain),
      });

      const savedTransaction = await this.transactionRepository.save(transaction);

      res.status(201).json({
        message: 'Transaction recorded for store',
        transaction: savedTransaction,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to record transaction' });
    }
  }

  /**
   * Create an order for a store
   * POST /api/storefront/:domain/orders
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { domain } = req.params;
      const { productId, quantity, fullName, phone, wilaya, commune, deliveryType } = req.body;

      if (!domain) {
        res.status(400).json({ error: 'Store domain is required' });
        return;
      }

      const store = await this.getStoreByDomain(domain);
      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      const product = await this.productRepository.findOne({ where: { id: productId, storeId: store.id } });
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // Create a new guest user for each order
      const guestUser = this.userRepository.create({
        email: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@algeriepost.dz`,
        passwordHash: await bcrypt.hash('guest', 10),
        fullName: fullName,
        phone: phone,
        accountType: AccountType.BUYER,
      });
      await this.userRepository.save(guestUser);

      // Create address
      const address = this.addressRepository.create({
        userId: guestUser.id,
        name: fullName,
        addressLine1: `${wilaya}, ${commune}`,
        addressLine2: deliveryType,
        city: commune,
        stateProvince: wilaya,
        country: 'Algeria',
      });
      await this.addressRepository.save(address);

      // Calculate shipping
      const shippingPrices = require('../../../static/shipping prices/shipping_prices.json');
      const shippingKey = deliveryType === 'stop_desk' ? 'Tarif Stop Desk Classique' : 'Tarif à Domicile Classique';
      const shippingCost = shippingPrices[wilaya]?.[shippingKey] || 0;

      const totalAmount = (product.price * (quantity || 1)) + shippingCost;

      // Create order
      const order = this.orderRepository.create({
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId: guestUser.id,
        storeId: store.id,
        totalAmount,
        shippingAddressId: address.id,
      });
      const savedOrder = await this.orderRepository.save(order);

      // Create order item
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: product.id,
        quantity: quantity || 1,
        unitPrice: product.price,
        subtotal: product.price * (quantity || 1),
      });
      await this.orderItemRepository.save(orderItem);

      // Create transaction
      const transaction = this.transactionRepository.create({
        userId: store.userId,
        orderId: savedOrder.id,
        amount: totalAmount,
        currency: 'DZD',
        transactionType: TransactionType.PAYMENT,
        status: TransactionStatus.PENDING,
        transactionReference: buildReference(domain),
      });
      const savedTransaction = await this.transactionRepository.save(transaction);

      res.status(201).json({
        message: 'Order created successfully',
        order: savedOrder,
        transaction: savedTransaction,
      });

      // Track product order event
      try {
        await eventService.createEvent('product_order', guestUser.id, store.id, {
          orderId: savedOrder.id,
          productId: productId,
          quantity: quantity || 1,
          totalAmount: totalAmount,
          domain: domain,
        });
      } catch (error) {
        console.error('Failed to track product order event:', error);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create order' });
    }
  }

  /**
   * Track an event for a store
   * POST /api/storefront/:domain/events
   */
  async trackEvent(req: Request, res: Response): Promise<void> {
    try {
      const { domain } = req.params;
      const { eventType, eventData } = req.body;

      if (!domain) {
        res.status(400).json({ error: 'Store domain is required' });
        return;
      }

      if (!eventType) {
        res.status(400).json({ error: 'Event type is required' });
        return;
      }

      const store = await this.getStoreByDomain(domain);

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      const event = await eventService.createEvent(eventType, null, store.id, eventData || {});

      res.status(201).json({ message: 'Event tracked successfully', event });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to track event' });
    }
  }
}

export const storefrontController = new StorefrontController();



