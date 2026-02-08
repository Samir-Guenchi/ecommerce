import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Order } from './Order';

@Entity('delivery_locations')
export class DeliveryLocation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'integer', name: 'order_id' })
    @Index()
    orderId: number;

    @Column({ type: 'decimal', precision: 10, scale: 8 })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8 })
    longitude: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    accuracy: number | null; // GPS accuracy in meters

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    speed: number | null; // Speed in km/h

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    heading: number | null; // Compass direction (0-360)

    @CreateDateColumn({ name: 'recorded_at' })
    recordedAt: Date;

    // Relations
    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;
}
