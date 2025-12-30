import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Store } from './Store';
import { Address } from './Address';
import { OrderItem } from './OrderItem';
import { Transaction } from './Transaction';

export enum OrderStatus {
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface TrackingEvent {
  wilaya: string;
  wilayaCode: string;
  timestamp: string;
  status: 'in_transit' | 'arrived' | 'departed' | 'delivered';
  description?: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'order_number' })
  orderNumber: string;

  @Column({ type: 'integer', name: 'user_id' })
  @Index()
  userId: number;

  @Column({ type: 'integer', name: 'store_id' })
  @Index()
  storeId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PROCESSING,
  })
  @Index()
  status: OrderStatus;

  @Column({ type: 'integer', nullable: true, name: 'shipping_address_id' })
  shippingAddressId: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'tracking_number' })
  trackingNumber: string | null;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'::jsonb", name: 'tracking_history' })
  trackingHistory: TrackingEvent[] | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'order_date' })
  orderDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'shipped_date' })
  shippedDate: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'delivered_date' })
  deliveredDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Store, (store) => store.orders)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Address, (address) => address.orders, { nullable: true })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: Address | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];
}

