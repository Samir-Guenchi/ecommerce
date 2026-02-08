import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';
import { DeliveryLocation } from '../entities/DeliveryLocation';
import { calculateDistance, calculateETA } from '../utils/geo.utils';

const router = Router();

/**
 * GET /api/tracking/:orderId
 * Get current tracking information for an order
 */
router.get('/:orderId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;

        const orderRepo = AppDataSource.getRepository(Order);
        const order = await orderRepo.findOne({
            where: { id: parseInt(orderId) },
        }) as any;

        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        // Get latest location
        const locationRepo = AppDataSource.getRepository(DeliveryLocation);
        const latestLocation = await locationRepo.findOne({
            where: { orderId: parseInt(orderId) },
            order: { recordedAt: 'DESC' },
        });

        if (!latestLocation) {
            res.json({
                orderId: order.id,
                status: order.status,
                hasTracking: false,
                message: 'Tracking will be available once delivery starts',
            });
            return;
        }

        const currentLocation = {
            lat: parseFloat(latestLocation.latitude.toString()),
            lon: parseFloat(latestLocation.longitude.toString()),
        };

        const deliveryAddress = {
            lat: parseFloat(order.address?.latitude || '0'),
            lon: parseFloat(order.address?.longitude || '0'),
        };

        const distance = calculateDistance(currentLocation, deliveryAddress);
        const eta = calculateETA(currentLocation, deliveryAddress, latestLocation.speed || 30);

        res.json({
            orderId: order.id,
            status: order.status,
            hasTracking: true,
            location: {
                latitude: latestLocation.latitude,
                longitude: latestLocation.longitude,
                accuracy: latestLocation.accuracy,
                speed: latestLocation.speed,
                heading: latestLocation.heading,
                timestamp: latestLocation.recordedAt,
            },
            deliveryPerson: order.deliveryPerson ? {
                name: order.deliveryPerson.user?.fullName,
                phone: order.deliveryPerson.phone,
                vehicle: order.deliveryPerson.vehicleType,
                rating: order.deliveryPerson.rating,
                photo: order.deliveryPerson.profilePhoto,
            } : null,
            eta: {
                estimatedArrival: eta,
                distanceRemaining: distance.toFixed(2),
                unit: 'km',
            },
        });
    } catch (error) {
        console.error('Error fetching tracking info:', error);
        res.status(500).json({ error: 'Failed to fetch tracking information' });
    }
});

/**
 * GET /api/tracking/:orderId/history
 */
router.get('/:orderId/history', async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        const { limit = '50' } = req.query;

        const locationRepo = AppDataSource.getRepository(DeliveryLocation);
        const locations = await locationRepo.find({
            where: { orderId: parseInt(orderId) },
            order: { recordedAt: 'DESC' },
            take: parseInt(limit as string),
        });

        res.json({
            orderId: parseInt(orderId),
            locations: locations.map(loc => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
                speed: loc.speed,
                timestamp: loc.recordedAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching location history:', error);
        res.status(500).json({ error: 'Failed to fetch location history' });
    }
});

/**
 * GET /api/tracking/delivery-person/:deliveryPersonId/active
 */
router.get('/delivery-person/:deliveryPersonId/active', async (req: Request, res: Response): Promise<void> => {
    try {
        const { deliveryPersonId } = req.params;

        const orderRepo = AppDataSource.getRepository(Order);
        const activeOrders = await orderRepo.find({
            where: {
                status: 'out_for_delivery' as any,
            },
            relations: ['store'],
        }) as any[];

        const filtered = activeOrders.filter((o: any) => o.deliveryPersonId === parseInt(deliveryPersonId));

        res.json({
            deliveryPersonId: parseInt(deliveryPersonId),
            activeDeliveries: filtered.map((order: any) => ({
                orderId: order.id,
                customerAddress: order.address?.fullAddress || 'N/A',
                storeName: order.store?.name || 'N/A',
                orderTotal: order.totalAmount,
            })),
        });
    } catch (error) {
        console.error('Error fetching active deliveries:', error);
        res.status(500).json({ error: 'Failed to fetch active deliveries' });
    }
});

export default router;
