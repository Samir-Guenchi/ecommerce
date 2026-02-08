import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { Store } from '../entities/Store';
import { Like, ILike } from 'typeorm';

const router = Router();

/**
 * GET /api/marketplace/search
 * Global product search across all stores
 */
router.get('/search', async (req: Request, res: Response) => {
    try {
        const {
            q = '',
            category,
            minPrice,
            maxPrice,
            wilaya,
            page = '1',
            limit = '20',
        } = req.query;

        const productRepo = AppDataSource.getRepository(Product);
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        // Build query
        const queryBuilder = productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.store', 'store')
            .where('product.status = :status', { status: 'active' });

        // Search by name/description
        if (q) {
            queryBuilder.andWhere(
                '(product.name ILIKE :search OR product.description ILIKE :search)',
                { search: `%${q}%` }
            );
        }

        // Filter by category
        if (category) {
            queryBuilder.andWhere('product.category = :category', { category });
        }

        // Filter by price range
        if (minPrice) {
            queryBuilder.andWhere('product.price >= :minPrice', {
                minPrice: parseFloat(minPrice as string),
            });
        }
        if (maxPrice) {
            queryBuilder.andWhere('product.price <= :maxPrice', {
                maxPrice: parseFloat(maxPrice as string),
            });
        }

        // Filter by wilaya
        if (wilaya) {
            queryBuilder.andWhere('store.location ILIKE :wilaya', {
                wilaya: `%${wilaya}%`,
            });
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const products = await queryBuilder
            .skip(skip)
            .take(parseInt(limit as string))
            .orderBy('product.createdAt', 'DESC')
            .getMany();

        res.json({
            products: products.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                imagePath: p.imagePath,
                category: p.category,
                stock: p.stock,
                store: {
                    id: p.store.id,
                    name: p.store.name,
                    domain: p.store.domain,
                    location: p.store.location,
                },
            })),
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages: Math.ceil(total / parseInt(limit as string)),
            },
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

/**
 * GET /api/marketplace/stores
 * Get all active stores
 */
router.get('/stores', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', wilaya } = req.query;

        const storeRepo = AppDataSource.getRepository(Store);
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const queryBuilder = storeRepo
            .createQueryBuilder('store')
            .leftJoinAndSelect('store.products', 'product')
            .where('store.status = :status', { status: 'active' });

        if (wilaya) {
            queryBuilder.andWhere('store.location ILIKE :wilaya', {
                wilaya: `%${wilaya}%`,
            });
        }

        const total = await queryBuilder.getCount();
        const stores = await queryBuilder
            .skip(skip)
            .take(parseInt(limit as string))
            .getMany();

        res.json({
            stores: stores.map(s => ({
                id: s.id,
                name: s.name,
                domain: s.domain,
                location: s.location,
                description: s.description,
                productCount: s.products?.length || 0,
            })),
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages: Math.ceil(total / parseInt(limit as string)),
            },
        });
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
});

/**
 * GET /api/marketplace/stores/:domain
 * Get store details by domain
 */
router.get('/stores/:domain', async (req: Request, res: Response): Promise<void> => {
    try {
        const { domain } = req.params;

        const storeRepo = AppDataSource.getRepository(Store);
        const store = await storeRepo.findOne({
            where: { domain },
            relations: ['products', 'user'],
        });

        if (!store) {
            res.status(404).json({ error: 'Store not found' });
            return;
        }

        res.json({
            id: store.id,
            name: store.name,
            domain: store.domain,
            location: store.location,
            description: store.description,
            products: store.products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                imagePath: p.imagePath,
                category: p.category,
            })),
        });
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ error: 'Failed to fetch store' });
    }
});

/**
 * GET /api/marketplace/categories
 * Get all unique categories
 */
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const productRepo = AppDataSource.getRepository(Product);

        const categories = await productRepo
            .createQueryBuilder('product')
            .select('DISTINCT product.category', 'category')
            .where('product.category IS NOT NULL')
            .andWhere('product.status = :status', { status: 'active' })
            .getRawMany();

        res.json({
            categories: categories
                .map(c => c.category)
                .filter(Boolean)
                .sort(),
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;
