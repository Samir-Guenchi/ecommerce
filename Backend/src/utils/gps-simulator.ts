import { io, Socket } from 'socket.io-client';

/**
 * GPS Simulator for Testing Delivery Tracking
 * 
 * Simulates a delivery person moving from store to customer address
 * Broadcasts GPS coordinates every 3 seconds
 */

interface SimulationConfig {
    orderId: number;
    startLocation: { lat: number; lon: number; name: string };
    endLocation: { lat: number; lon: number; name: string };
    speed: number; // km/h
    updateInterval: number; // milliseconds
}

export class GPSSimulator {
    private socket: Socket;
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;
    private currentStep: number = 0;
    private route: Array<{ lat: number; lon: number }> = [];

    constructor(private serverUrl: string = 'http://localhost:3000') {
        this.socket = io(serverUrl, {
            transports: ['websocket'],
            reconnection: true,
        });

        this.setupListeners();
    }

    private setupListeners() {
        this.socket.on('connect', () => {
            console.log('✅ GPS Simulator connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ GPS Simulator disconnected');
        });

        this.socket.on('error', (error: any) => {
            console.error('Socket error:', error);
        });
    }

    /**
     * Generate route points between start and end
     */
    private generateRoute(start: { lat: number; lon: number }, end: { lat: number; lon: number }, steps: number = 20): void {
        this.route = [];

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const lat = start.lat + (end.lat - start.lat) * progress;
            const lon = start.lon + (end.lon - start.lon) * progress;

            // Add some randomness to make it realistic
            const jitter = 0.0001;
            const jitteredLat = lat + (Math.random() - 0.5) * jitter;
            const jitteredLon = lon + (Math.random() - 0.5) * jitter;

            this.route.push({ lat: jitteredLat, lon: jitteredLon });
        }
    }

    /**
     * Calculate realistic speed with variations
     */
    private calculateSpeed(baseSpeed: number): number {
        // Add ±20% variation to simulate traffic
        const variation = (Math.random() - 0.5) * 0.4;
        return baseSpeed * (1 + variation);
    }

    /**
     * Start GPS simulation
     */
    public start(config: SimulationConfig): void {
        if (this.isRunning) {
            console.warn('⚠️ Simulation already running');
            return;
        }

        console.log('🚀 Starting GPS simulation...');
        console.log(`📍 From: ${config.startLocation.name}`);
        console.log(`📍 To: ${config.endLocation.name}`);
        console.log(`🏃 Speed: ${config.speed} km/h`);

        // Generate route
        this.generateRoute(config.startLocation, config.endLocation);
        this.currentStep = 0;
        this.isRunning = true;

        // Authenticate as delivery person (mock)
        this.socket.emit('auth:delivery_person', {
            userId: 999, // Mock delivery person ID
            token: 'mock-token-for-testing',
        });

        // Start broadcasting location
        this.intervalId = setInterval(() => {
            if (this.currentStep >= this.route.length) {
                console.log('✅ Delivery completed - arrived at destination!');
                this.stop();

                // Send delivery completed status
                this.socket.emit('delivery:status', {
                    orderId: config.orderId,
                    status: 'delivered',
                });

                return;
            }

            const position = this.route[this.currentStep];
            const speed = this.calculateSpeed(config.speed);
            const heading = this.calculateHeading(this.currentStep);

            // Broadcast location
            this.socket.emit('delivery:location', {
                orderId: config.orderId,
                latitude: position.lat,
                longitude: position.lon,
                speed,
                accuracy: Math.random() * 10 + 5, // 5-15 meters
                heading,
            });

            const progress = ((this.currentStep / this.route.length) * 100).toFixed(1);
            console.log(`📡 Step ${this.currentStep + 1}/${this.route.length} (${progress}%) - Lat: ${position.lat.toFixed(6)}, Lon: ${position.lon.toFixed(6)}, Speed: ${speed.toFixed(1)} km/h`);

            this.currentStep++;
        }, config.updateInterval);
    }

    /**
     * Calculate heading based on direction of movement
     */
    private calculateHeading(step: number): number {
        if (step === 0 || step >= this.route.length - 1) return 0;

        const current = this.route[step];
        const next = this.route[step + 1];

        const dLon = next.lon - current.lon;
        const dLat = next.lat - current.lat;

        let heading = Math.atan2(dLon, dLat) * (180 / Math.PI);
        heading = (heading + 360) % 360;

        return heading;
    }

    /**
     * Stop simulation
     */
    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('⏹️ GPS simulation stopped');
    }

    /**
     * Disconnect from server
     */
    public disconnect(): void {
        this.stop();
        this.socket.disconnect();
    }
}

// Example usage
if (require.main === module) {
    const simulator = new GPSSimulator();

    // Simulate delivery from Boutique Traditional to customer in Alger
    const config: SimulationConfig = {
        orderId: 1,
        startLocation: {
            lat: 36.7538, // Alger center (store location)
            lon: 3.0588,
            name: 'Boutique Traditional, Alger',
        },
        endLocation: {
            lat: 36.7700, // Customer address (slightly north)
            lon: 3.0700,
            name: 'Customer Address, Hussein Dey',
        },
        speed: 30, // 30 km/h average
        updateInterval: 3000, // Update every 3 seconds
    };

    console.log('\n🧪 GPS DELIVERY TRACKING SIMULATOR');
    console.log('==================================\n');

    simulator.start(config);

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n⚠️ Shutting down simulator...');
        simulator.disconnect();
        process.exit(0);
    });
}

export default GPSSimulator;
