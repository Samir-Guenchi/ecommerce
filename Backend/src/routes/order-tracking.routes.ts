import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';

const router = Router();

/**
 * Wilaya-based delivery time estimates (in business days)
 * Based on Algérie Poste standard delivery times
 */
const DELIVERY_ESTIMATES: { [key: string]: { min: number; max: number } } = {
    // Same wilaya - Express delivery
    'same_wilaya': { min: 1, max: 2 },

    // Major cities - Fast delivery
    'Alger': { min: 2, max: 3 },
    'Oran': { min: 2, max: 4 },
    'Constantine': { min: 3, max: 4 },
    'Annaba': { min: 3, max: 4 },
    'Blida': { min: 2, max: 3 },
    'Sétif': { min: 3, max: 4 },
    'Batna': { min: 3, max: 5 },

    // Regional centers
    'Tlemcen': { min: 3, max: 5 },
    'Béjaïa': { min: 3, max: 4 },
    'Biskra': { min: 4, max: 5 },
    'Tébessa': { min: 4, max: 6 },
    'Tiaret': { min: 3, max: 5 },

    // Remote areas
    'Béchar': { min: 5, max: 7 },
    'Tamanrasset': { min: 7, max: 10 },
    'Adrar': { min: 6, max: 9 },
    'Illizi': { min: 7, max: 10 },

    // Default for other wilayas
    'default': { min: 3, max: 5 },
};

/**
 * Calculate estimated delivery date
 */
function calculateDeliveryEstimate(
    orderDate: Date,
    storeWilaya: string,
    customerWilaya: string
): { minDate: Date; maxDate: Date; businessDays: string } {
    const isSameWilaya = storeWilaya.toLowerCase() === customerWilaya.toLowerCase();

    let estimate = isSameWilaya
        ? DELIVERY_ESTIMATES['same_wilaya']
        : DELIVERY_ESTIMATES[customerWilaya] || DELIVERY_ESTIMATES['default'];

    const minDate = addBusinessDays(orderDate, estimate.min);
    const maxDate = addBusinessDays(orderDate, estimate.max);

    return {
        minDate,
        maxDate,
        businessDays: `${estimate.min}-${estimate.max} jours ouvrables`,
    };
}

/**
 * Add business days (excluding weekends)
 */
function addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        // Skip weekends (Friday = 5, Saturday = 6 in Algeria)
        if (result.getDay() !== 5 && result.getDay() !== 6) {
            addedDays++;
        }
    }

    return result;
}

/**
 * GET /api/orders/:orderId/tracking
 * Get order tracking information with delivery estimate
 */
router.get('/:orderId/tracking', async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;

        const orderRepo = AppDataSource.getRepository(Order);
        const order = await orderRepo.findOne({
            where: { id: parseInt(orderId) },
            relations: ['store', 'user'],
        }) as any;

        if (!order) {
            res.status(404).json({ error: 'Commande non trouvée' });
            return;
        }

        // Calculate delivery estimate
        const estimate = calculateDeliveryEstimate(
            order.createdAt,
            order.store.location,
            order.address.wilaya
        );

        // Determine current status
        const statusTimeline = [
            {
                status: 'pending',
                label: 'Commande reçue',
                completed: true,
                date: order.createdAt,
                icon: '📦',
            },
            {
                status: 'confirmed',
                label: 'Confirmée par le vendeur',
                completed: order.status !== 'pending',
                date: order.updatedAt,
                icon: '✅',
            },
            {
                status: 'processing',
                label: 'En préparation',
                completed: ['processing', 'shipped', 'delivered'].includes(order.status),
                date: null,
                icon: '📋',
            },
            {
                status: 'shipped',
                label: 'Expédiée',
                completed: ['shipped', 'delivered'].includes(order.status),
                date: null,
                icon: '🚚',
            },
            {
                status: 'delivered',
                label: 'Livrée',
                completed: order.status === 'delivered',
                date: order.status === 'delivered' ? order.updatedAt : null,
                icon: '✓',
            },
        ];

        res.json({
            orderId: order.id,
            orderNumber: `AP-${order.id.toString().padStart(6, '0')}`,
            status: order.status,
            createdAt: order.createdAt,

            // Delivery estimate
            estimatedDelivery: {
                minDate: estimate.minDate,
                maxDate: estimate.maxDate,
                businessDays: estimate.businessDays,
                formatted: `Entre le ${formatDate(estimate.minDate)} et le ${formatDate(estimate.maxDate)}`,
            },

            // Status timeline
            timeline: statusTimeline,

            // Order details
            items: {
                count: 1, // TODO: Get from order items
                total: order.totalAmount,
            },

            // Shipping info
            shipping: {
                from: order.store.location,
                to: `${order.address.wilaya}, ${order.address.commune}`,
                address: order.address.fullAddress,
            },

            // Store info
            store: {
                name: order.store.name,
                phone: order.user.phone, // Store owner phone
            },
        });
    } catch (error) {
        console.error('Error fetching tracking:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du suivi' });
    }
});

/**
 * Format date for display (French format)
 */
function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-DZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

/**
 * POST /api/orders/:orderId/status
 * Update order status (seller only)
 */
router.post('/:orderId/status', async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Statut invalide' });
            return;
        }

        const orderRepo = AppDataSource.getRepository(Order);
        await orderRepo.update(parseInt(orderId), {
            status: status as any,
            updatedAt: new Date(),
        });

        // TODO: Send SMS notification to customer
        // await sendSMSNotification(order.user.phone, `Votre commande #${orderId} est maintenant: ${status}`);

        res.json({ message: 'Statut mis à jour', status });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

export default router;
