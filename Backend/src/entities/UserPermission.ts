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

@Entity('user_permissions')
export class UserPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'user_id' })
  userId: number;

  @Column({ type: 'integer', nullable: true, name: 'store_id' })
  storeId: number | null;

  @Column({ type: 'varchar', length: 100, name: 'permission_type' })
  permissionType: string;

  @Column({ type: 'boolean', default: false, name: 'can_edit' })
  canEdit: boolean;

  @Column({ type: 'boolean', default: false, name: 'can_delete' })
  canDelete: boolean;

  @Column({ type: 'boolean', default: true, name: 'can_view' })
  canView: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.permissions)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Store, (store) => store.permissions, { nullable: true })
  @JoinColumn({ name: 'store_id' })
  store: Store | null;
}

