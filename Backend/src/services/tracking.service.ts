import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';
import { calculateETA, calculateDistance } from '../utils/geo.utils';

interface LocationUpdate {
    orderId: number;
    latitude: number;
    longitude: number;
    speed: number;
    accuracy?: number;
    heading?: number;
}

interface ClientSocket extends Socket {
    userId?: number;
    role?: 'customer' | 'delivery_person';
}

export class TrackingService {
    private io: SocketIOServer;
    private activeDeliveries: Map<number, {
        deliveryPersonId: number;
        customerId: number;
        lastUpdate: Date;
    }> = new Map();

    constructor(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        this.setupListeners();
    }

    private setupListeners() {
        this.io.on('connection', (socket: ClientSocket) => {
            console.log(`📡 Client connected: ${socket.id}`);

            // Delivery person authentication
            socket.on('auth:delivery_person', (data: { userId: number; token: string }) => {
                // TODO: Verify JWT token
                socket.userId = data.userId;
                socket.role = 'delivery_person';
                console.log(`✅ Delivery person authenticated: ${data.userId}`);
            });

            // Customer subscribes to order tracking
            socket.on('subscribe:order', async (orderId: number) => {
                try {
                    const orderRepo = AppDataSource.getRepository(Order);
                    const order = await orderRepo.findOne({
                        where: { id: orderId },
                        relations: ['user'],
                    });

                    if (!order) {
                        socket.emit('error', { message: 'Order not found' });
                        return;
                    }

                    // Join room for this order
                    socket.join(`order-${orderId}`);
                    socket.userId = order.userId;
                    socket.role = 'customer';

                    console.log(`👤 Customer subscribed to order #${orderId}`);

                    // Send current delivery status
                    await this.sendCurrentStatus(orderId);
                } catch (error) {
                    console.error('Error subscribing to order:', error);
                    socket.emit('error', { message: 'Failed to subscribe to order' });
                }
            });

            // Delivery person sends location update
            socket.on('delivery:location', async (data: LocationUpdate) => {
                try {
                    await this.handleLocationUpdate(data);
                } catch (error) {
                    console.error('Error handling location update:', error);
                    socket.emit('error', { message: 'Failed to process location update' });
                }
            });

            // Delivery status update
            socket.on('delivery:status', async (data: { orderId: number; status: string }) => {
                try {
                    await this.updateDeliveryStatus(data.orderId, data.status);
                } catch (error) {
                    console.error('Error updating delivery status:', error);
                }
            });

            // Disconnect handling
            socket.on('disconnect', () => {
                console.log(`📴 Client disconnected: ${socket.id}`);
                if (socket.role === 'delivery_person' && socket.userId) {
                    this.handleDeliveryPersonOffline(socket.userId);
                }
            });
        });
    }

    private async handleLocationUpdate(data: LocationUpdate): Promise<void> {
        const { orderId, latitude, longitude, speed, accuracy, heading } = data;

        // Save location to database
        await this.saveLocation(orderId, latitude, longitude, speed, accuracy, heading);

        // Get order details
        const orderRepo = AppDataSource.getRepository(Order);
        const order = await orderRepo.findOne({
            where: { id: orderId },
            relations: ['shippingAddress'],
        });

        if (!order || !order.shippingAddress) {
            return;
        }

        // Calculate ETA
        const currentLocation = { lat: latitude, lon: longitude };
        const deliveryLocation = {
            lat: parseFloat(order.shippingAddress.latitude || '0'),
            lon: parseFloat(order.shippingAddress.longitude || '0'),
        };

        const distance = calculateDistance(currentLocation, deliveryLocation);
        const eta = calculateETA(currentLocation, deliveryLocation, speed || 30);

        // Broadcast to customer
        this.io.to(`order-${orderId}`).emit('tracking:update', {
            orderId,
            latitude,
            longitude,
            speed,
            accuracy,
            heading,
            distance: distance.toFixed(2),
            eta: eta.toISOString(),
            timestamp: new Date().toISOString(),
        });

        // Update active deliveries map
        const delivery = this.activeDeliveries.get(orderId);
        if (delivery) {
            delivery.lastUpdate = new Date();
        }
    }

    private async saveLocation(
        orderId: number,
        latitude: number,
        longitude: number,
        speed: number,
        accuracy?: number,
        heading?: number
    ): Promise<void> {
        // Save to delivery_locations table
        // This will be implemented once DB is set up
        console.log(`📍 Location saved for order ${orderId}: ${latitude}, ${longitude}`);
    }

    private async sendCurrentStatus(orderId: number): Promise<void> {
        // Fetch latest location and send to customer
        // This will be implemented once DB is set up
        this.io.to(`order-${orderId}`).emit('tracking:status', {
            orderId,
            status: 'En cours de livraison',
            message: 'Votre colis est en route',
        });
    }

    private async updateDeliveryStatus(orderId: number, status: string): Promise<void> {
        const orderRepo = AppDataSource.getRepository(Order);
        await orderRepo.update(orderId, {
            status: status as any,
            updatedAt: new Date(),
        });

        // Notify customer
        this.io.to(`order-${orderId}`).emit('delivery:status_changed', {
            orderId,
            status,
            timestamp: new Date().toISOString(),
        });

        console.log(`📦 Order #${orderId} status updated: ${status}`);
    }

    private handleDeliveryPersonOffline(userId: number): void {
        // Find all active deliveries for this person
        for (const [orderId, delivery] of this.activeDeliveries.entries()) {
            if (delivery.deliveryPersonId === userId) {
                this.io.to(`order-${orderId}`).emit('delivery:offline', {
                    message: 'Le livreur est temporairement hors ligne',
                });
            }
        }
    }

    // Public method to get IO instance for other services
    public getIO(): SocketIOServer {
        return this.io;
    }
}
