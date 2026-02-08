import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

// Cart item interface (stored in session or database)
interface CartItem {
    id: string;
    productId: number;
    storeId: number;
    quantity: number;
    addedAt: Date;
}

const router = Router();

// In-memory cart storage (in production, use Redis or database)
const userCarts = new Map<number, CartItem[]>();

/**
 * GET /api/marketplace/cart
 * Get user's shopping cart
 */
router.get('/cart', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.query.userId as string);

        if (!userId) {
            res.status(400).json({ error: 'User ID required' });
            return;
        }

        const cart = userCarts.get(userId) || [];

        // Fetch product details for cart items
        const cartWithDetails = await Promise.all(
            cart.map(async (item) => {
                // TODO: Fetch product details from database
                return {
                    ...item,
                    productName: 'Product Name', // Placeholder
                    productPrice: 0,
                    productImage: null,
                };
            })
        );

        res.json({
            userId,
            items: cartWithDetails,
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

/**
 * POST /api/marketplace/cart
 * Add item to cart
 */
router.post('/cart', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, productId, storeId, quantity = 1 } = req.body;

        if (!userId || !productId || !storeId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        let cart = userCarts.get(userId) || [];

        // Check if item already in cart
        const existingIndex = cart.findIndex(item => item.productId === productId);

        if (existingIndex >= 0) {
            // Update quantity
            cart[existingIndex].quantity += quantity;
        } else {
            // Add new item
            cart.push({
                id: `${userId}-${productId}-${Date.now()}`,
                productId,
                storeId,
                quantity,
                addedAt: new Date(),
            });
        }

        userCarts.set(userId, cart);

        res.json({
            message: 'Item added to cart',
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

/**
 * DELETE /api/marketplace/cart/:itemId
 * Remove item from cart
 */
router.delete('/cart/:itemId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { itemId } = req.params;
        const userId = parseInt(req.query.userId as string);

        if (!userId) {
            res.status(400).json({ error: 'User ID required' });
            return;
        }

        let cart = userCarts.get(userId) || [];
        cart = cart.filter(item => item.id !== itemId);
        userCarts.set(userId, cart);

        res.json({
            message: 'Item removed from cart',
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

/**
 * PUT /api/marketplace/cart/:itemId
 * Update cart item quantity
 */
router.put('/cart/:itemId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { itemId } = req.params;
        const { userId, quantity } = req.body;

        if (!userId || quantity === undefined) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        let cart = userCarts.get(userId) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);

        if (itemIndex >= 0) {
            if (quantity <= 0) {
                cart = cart.filter(item => item.id !== itemId);
            } else {
                cart[itemIndex].quantity = quantity;
            }
            userCarts.set(userId, cart);
        }

        res.json({
            message: 'Cart updated',
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

/**
 * POST /api/marketplace/wishlist/:productId
 * Add product to wishlist
 */
router.post('/wishlist/:productId', async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { userId } = req.body;

        // TODO: Save to wishlist table in database

        res.json({ message: 'Added to wishlist', productId: parseInt(productId) });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

/**
 * DELETE /api/marketplace/wishlist/:productId
 * Remove product from wishlist
 */
router.delete('/wishlist/:productId', async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const userId = parseInt(req.query.userId as string);

        // TODO: Remove from wishlist table in database

        res.json({ message: 'Removed from wishlist', productId: parseInt(productId) });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

export default router;
