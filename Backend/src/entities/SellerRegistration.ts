import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('seller_registrations')
export class SellerRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'user_id' })
  @Index()
  userId: number;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ssid: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'business_id' })
  businessId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'document1_path' })
  document1Path: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'document2_path' })
  document2Path: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'document3_path' })
  document3Path: string | null;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
    name: 'verification_status',
  })
  @Index()
  verificationStatus: VerificationStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'verified_at' })
  verifiedAt: Date | null;

  @Column({ type: 'integer', nullable: true, name: 'verified_by' })
  verifiedById: number | null;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.sellerRegistration)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: User | null;
}










