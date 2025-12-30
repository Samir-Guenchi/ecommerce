import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import {
  Product,
  ProductStatus,
  Store,
  StoreStatus,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../entities';

const buildReference = (domain: string): string => {
  const random = Math.random().toString(36).slice(2, 8);
  return `${domain}-${Date.now()}-${random}`;
};

export class StorefrontController {
  private storeRepository = AppDataSource.getRepository(Store);
  private productRepository = AppDataSource.getRepository(Product);
  private transactionRepository = AppDataSource.getRepository(Transaction);

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

      const mappedProducts = products.map(p => ({ ...p, price: parseFloat(p.price as string) }));

      res.status(200).json({ store, products: mappedProducts });
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

      const mappedProduct = { ...product, price: parseFloat(product.price as string) };

      res.status(200).json({ store, product: mappedProduct });
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
}

export const storefrontController = new StorefrontController();



