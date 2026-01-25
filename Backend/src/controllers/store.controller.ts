import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Store, StoreStatus } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';

export class StoreController {
  private storeRepository = AppDataSource.getRepository(Store);

  /**
   * Get all stores for authenticated user
   * GET /api/stores
   */
  async getAllStores(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stores = await this.storeRepository.find({
        where: { userId: req.user.id },
        relations: ['theme'],
        order: { createdAt: 'DESC' },
      });

      res.status(200).json({ stores });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get stores' });
    }
  }

  /**
   * Get store by ID
   * GET /api/stores/:id
   */
  async getStoreById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const storeId = parseInt(req.params.id, 10);

      if (isNaN(storeId)) {
        res.status(400).json({ error: 'Invalid store ID' });
        return;
      }

      const store = await this.storeRepository.findOne({
        where: { id: storeId },
        relations: ['theme', 'products'],
      });

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      if (store.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.status(200).json({ store });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get store' });
    }
  }

  /**
   * Create new store
   * POST /api/stores
   */
  async createStore(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, location, description, themeId, domain, status, metapixleid, tiktokpixleid } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Store name is required' });
        return;
      }

      if (!location) {
        res.status(400).json({ error: 'Store location is required' });
        return;
      }

      // Auto-generate domain if not provided: storename.algeriepost.dz
      let finalDomain = domain;
      if (!finalDomain) {
        // Convert store name to URL-friendly format
        const domainName = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        finalDomain = `${domainName}.algeriepost.dz`;
      }

      // Check if domain is unique
      const existingStore = await this.storeRepository.findOne({
        where: { domain: finalDomain },
      });

      if (existingStore) {
        res.status(400).json({ error: 'Domain already in use. Please choose a different store name or domain.' });
        return;
      }

      const store = this.storeRepository.create({
        userId: req.user.id,
        name,
        location,
        description: description || null,
        metapixleid: metapixleid || null,
        tiktokpixleid: tiktokpixleid || null,
        themeId: themeId || null,
        domain: finalDomain,
        status: status || StoreStatus.DRAFT,
      });

      const savedStore = await this.storeRepository.save(store);

      res.status(201).json({
        message: 'Store created successfully',
        store: savedStore,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create store' });
    }
  }

  /**
   * Update store
   * PATCH /api/stores/:id
   */
  async updateStore(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const storeId = parseInt(req.params.id, 10);

      if (isNaN(storeId)) {
        res.status(400).json({ error: 'Invalid store ID' });
        return;
      }

      const store = await this.storeRepository.findOne({
        where: { id: storeId },
      });

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      if (store.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Check domain uniqueness if changing domain
      if (req.body.domain && req.body.domain !== store.domain) {
        const existingStore = await this.storeRepository.findOne({
          where: { domain: req.body.domain },
        });

        if (existingStore) {
          res.status(400).json({ error: 'Domain already in use' });
          return;
        }
      }

      // Update fields
      if (req.body.name !== undefined) store.name = req.body.name;
      if (req.body.location !== undefined) store.location = req.body.location;
      if (req.body.description !== undefined) store.description = req.body.description;
      if (req.body.metapixleid !== undefined) store.metapixleid = req.body.metapixleid;
      if (req.body.tiktokpixleid !== undefined) store.tiktokpixleid = req.body.tiktokpixleid;
      if (req.body.themeId !== undefined) store.themeId = req.body.themeId;
      if (req.body.domain !== undefined) store.domain = req.body.domain;
      if (req.body.status !== undefined) store.status = req.body.status;

      const updatedStore = await this.storeRepository.save(store);

      res.status(200).json({
        message: 'Store updated successfully',
        store: updatedStore,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update store' });
    }
  }

  /**
   * Delete store
   * DELETE /api/stores/:id
   */
  async deleteStore(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const storeId = parseInt(req.params.id, 10);

      if (isNaN(storeId)) {
        res.status(400).json({ error: 'Invalid store ID' });
        return;
      }

      const store = await this.storeRepository.findOne({
        where: { id: storeId },
      });

      if (!store) {
        res.status(404).json({ error: 'Store not found' });
        return;
      }

      if (store.userId !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      await this.storeRepository.remove(store);

      res.status(200).json({
        message: 'Store deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete store' });
    }
  }
}

export const storeController = new StoreController();

