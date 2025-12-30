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

@Entity('tax_settings')
export class TaxSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true, name: 'user_id' })
  userId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0, name: 'tax_rate' })
  taxRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0, name: 'duty_rate' })
  dutyRate: number;

  @Column({ type: 'boolean', default: false, name: 'tax_included' })
  taxIncluded: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.taxSetting)
  @JoinColumn({ name: 'user_id' })
  user: User;
}










