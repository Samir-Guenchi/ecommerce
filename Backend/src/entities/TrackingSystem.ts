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
import { Store } from './Store';

@Entity('tracking_systems')
export class TrackingSystem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'store_id' })
  @Index()
  storeId: number;

  @Column({ type: 'varchar', length: 100, name: 'system_name' })
  systemName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'api_key' })
  apiKey: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Store, (store) => store.trackingSystems)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}





