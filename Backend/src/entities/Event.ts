import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Store } from './Store';

export enum EventStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true, name: 'user_id' })
  userId: number | null;

  @Column({ type: 'integer', nullable: true, name: 'store_id' })
  storeId: number | null;

  @Column({ type: 'varchar', length: 100, name: 'event_type' })
  @Index()
  eventType: string;

  @Column({ type: 'jsonb', nullable: true, name: 'event_data' })
  eventData: Record<string, any> | null;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.ACTIVE,
  })
  @Index()
  status: EventStatus;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.events, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Store, (store) => store.events, { nullable: true })
  @JoinColumn({ name: 'store_id' })
  store: Store | null;
}










