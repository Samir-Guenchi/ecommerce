import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User';
import { Store } from './Store';
import { Order } from './Order';

@Entity('seller_ratings')
export class SellerRating {
  @PrimaryGeneratedColumn()
  id!: number;

  // Buyer who is rating
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'buyer_id' })
  buyer!: User;

  @Column({ name: 'buyer_id' })
  buyerId!: number;

  // Seller being rated
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @Column({ name: 'seller_id' })
  sellerId!: number;

  // Store being rated
  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn({ name: 'store_id' })
  store?: Store;

  @Column({ name: 'store_id', nullable: true })
  storeId?: number;

  // Order reference
  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'order_id' })
  orderId!: number;

  // Rating (1-5 stars)
  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating!: number;

  // Review text
  @Column({ type: 'text', nullable: true })
  review?: string;

  // Rating categories
  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true, name: 'product_quality' })
  productQuality?: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true, name: 'communication' })
  communication?: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true, name: 'shipping_speed' })
  shippingSpeed?: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true, name: 'packaging' })
  packaging?: number;

  // Seller response
  @Column({ type: 'text', nullable: true, name: 'seller_response' })
  sellerResponse?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'seller_response_date' })
  sellerResponseDate?: Date;

  // Status
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: 'active' | 'hidden' | 'reported';

  // Helpful votes
  @Column({ type: 'int', default: 0, name: 'helpful_count' })
  helpfulCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
