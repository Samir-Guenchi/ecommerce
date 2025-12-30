import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { SellerRegistration } from './SellerRegistration';
import { Store } from './Store';
import { Order } from './Order';
import { Address } from './Address';
import { PaymentMethod } from './PaymentMethod';
import { Subscription } from './Subscription';
import { Notification } from './Notification';
import { Event } from './Event';
import { TaxSetting } from './TaxSetting';
import { DeliverySetting } from './DeliverySetting';
import { UserPermission } from './UserPermission';
import { Transaction } from './Transaction';

export enum AccountType {
  BUYER = 'buyer',
  SELLER = 'seller',
  BOTH = 'both',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'full_name' })
  fullName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.BUYER,
    name: 'account_type',
  })
  @Index()
  accountType: AccountType;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.PENDING,
    name: 'account_status',
  })
  @Index()
  accountStatus: AccountStatus;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'en',
    name: 'language_preference',
  })
  languagePreference: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login' })
  lastLogin: Date | null;

  // Relations
  @OneToOne(() => SellerRegistration, (registration) => registration.user)
  sellerRegistration: SellerRegistration;

  @OneToMany(() => Store, (store) => store.user)
  stores: Store[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethods: PaymentMethod[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @OneToOne(() => TaxSetting, (taxSetting) => taxSetting.user)
  taxSetting: TaxSetting;

  @OneToOne(() => DeliverySetting, (deliverySetting) => deliverySetting.user)
  deliverySetting: DeliverySetting;

  @OneToMany(() => UserPermission, (permission) => permission.user)
  permissions: UserPermission[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}





