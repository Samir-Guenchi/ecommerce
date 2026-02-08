import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
    Index,
    JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Order } from './Order';

@Entity('delivery_persons')
export class DeliveryPerson {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'integer', name: 'user_id', unique: true })
    @Index()
    userId: number;

    @Column({ type: 'varchar', length: 50, name: 'vehicle_type' })
    vehicleType: string; // 'bike', 'moto', 'car', 'van'

    @Column({ type: 'varchar', length: 20, nullable: true, name: 'license_plate' })
    licensePlate: string | null;

    @Column({ type: 'varchar', length: 20 })
    phone: string;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
    rating: number; // 0.00 to 5.00

    @Column({ type: 'integer', default: 0, name: 'total_deliveries' })
    totalDeliveries: number;

    @Column({ type: 'boolean', default: false, name: 'is_online' })
    isOnline: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true, name: 'current_latitude' })
    currentLatitude: number | null;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true, name: 'current_longitude' })
    currentLongitude: number | null;

    @Column({ type: 'timestamp', nullable: true, name: 'last_location_update' })
    lastLocationUpdate: Date | null;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'profile_photo' })
    profilePhoto: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Order, (order) => order.deliveryPerson)
    orders: Order[];
}
