import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('delivery_settings')
export class DeliverySetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true, name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'default_shipping_method' })
  defaultShippingMethod: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0, name: 'shipping_cost' })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'free_shipping_threshold' })
  freeShippingThreshold: number | null;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.deliverySetting)
  @JoinColumn({ name: 'user_id' })
  user: User;
}










