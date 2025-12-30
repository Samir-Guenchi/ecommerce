import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product, ProductStatus } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';
import { Store } from '../entities';

export class ProductController {
  private productRepository = AppDataSource.getRepository(Product);
  private storeRepository = AppDataSource.getRepository(Store);

  /**
   * Get all products for authenticated user's stores
   * GET /api/products
   */
  async getAllProducts(req: AuthRequest, res: Response): Promise<void> {
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
        res.status(200).json({ products: [] });
        return;
      }

      const products = await this.productRepository.find({
        where: storeIds.map(storeId => ({ storeId })),
        relations: ['store'],
        order: { createdAt: 'DESC' },
      });

      res.status(200).json({ products });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get products' });
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  async getProductById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const productId = parseInt(req.params.id, 10);

      if (isNaN(productId)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['store'],
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // Verify product belongs to user's store
      const store = await this.storeRepository.findOne({
        where: { id: product.storeId },
      });

      if (!store || store.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.status(200).json({ product });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get product' });
    }
  }

  /**
   * Create new product
   * POST /api/products
   */
  async createProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { storeId, name, description, price, stock, category, imagePath, status } = req.body;

      if (!storeId || !name || price === undefined) {
        res.status(400).json({ error: 'Store ID, name, and price are required' });
        return;
      }

      // Verify store belongs to user
      const store = await this.storeRepository.findOne({
        where: { id: storeId },
      });

      if (!store || store.userId !== req.user.id) {
        res.status(403).json({ error: 'Store not found or access denied' });
        return;
      }

      const product = this.productRepository.create({
        storeId,
        name,
        description: description || null,
        price: parseFloat(price),
        stock: stock ? parseInt(stock, 10) : 0,
        category: category || null,
        imagePath: imagePath || null,
        status: status || ProductStatus.DRAFT,
      });

      const savedProduct = await this.productRepository.save(product);

      res.status(201).json({
        message: 'Product created successfully',
        product: savedProduct,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create product' });
    }
  }

  /**
   * Update product
   * PATCH /api/products/:id
   */
  async updateProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const productId = parseInt(req.params.id, 10);

      if (isNaN(productId)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // Verify product belongs to user's store
      const store = await this.storeRepository.findOne({
        where: { id: product.storeId },
      });

      if (!store || store.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Update fields
      if (req.body.name !== undefined) product.name = req.body.name;
      if (req.body.description !== undefined) product.description = req.body.description;
      if (req.body.price !== undefined) product.price = parseFloat(req.body.price);
      if (req.body.stock !== undefined) product.stock = parseInt(req.body.stock, 10);
      if (req.body.category !== undefined) product.category = req.body.category;
      if (req.body.imagePath !== undefined) product.imagePath = req.body.imagePath;
      if (req.body.status !== undefined) product.status = req.body.status;

      const updatedProduct = await this.productRepository.save(product);

      res.status(200).json({
        message: 'Product updated successfully',
        product: updatedProduct,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update product' });
    }
  }

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  async deleteProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const productId = parseInt(req.params.id, 10);

      if (isNaN(productId)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // Verify product belongs to user's store
      const store = await this.storeRepository.findOne({
        where: { id: product.storeId },
      });

      if (!store || store.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      await this.productRepository.remove(product);

      res.status(200).json({
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete product' });
    }
  }
}

export const productController = new ProductController();



