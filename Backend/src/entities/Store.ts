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
import { Theme } from './Theme';
import { Product } from './Product';
import { Order } from './Order';
import { Event } from './Event';
import { UserPermission } from './UserPermission';
import { TrackingSystem } from './TrackingSystem';

export enum StoreStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  SUSPENDED = 'suspended',
}

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'user_id' })
  @Index()
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: StoreStatus,
    default: StoreStatus.DRAFT,
  })
  @Index()
  status: StoreStatus;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metapixleid: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tiktokpixleid: string | null;

  @Column({ type: 'integer', nullable: true, name: 'theme_id' })
  themeId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  domain: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.stores)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Theme, (theme) => theme.stores, { nullable: true })
  @JoinColumn({ name: 'theme_id' })
  theme: Theme | null;

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];

  @OneToMany(() => Event, (event) => event.store)
  events: Event[];

  @OneToMany(() => UserPermission, (permission) => permission.store)
  permissions: UserPermission[];

  @OneToMany(() => TrackingSystem, (trackingSystem) => trackingSystem.store)
  trackingSystems: TrackingSystem[];
}





