import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';

@Entity('user_impacts')
export class UserImpact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  job: string;

  @Column({ type: 'varchar', length: 200 })
  location: string;

  @Column({ type: 'jsonb' })
  techUsed: string[];

  @Column({ type: 'varchar', length: 100 })
  industry: string;

  // Computed risk metrics
  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  automationRisk: number; // 0-10 scale

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  skillObsolescenceRisk: number; // 0-10 scale

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  privacyRisk: number; // 0-10 scale

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  overallRiskScore: number; // 0-10 scale

  // Additional metadata
  @Column({ type: 'jsonb', nullable: true })
  riskFactors: string[];

  @Column({ type: 'jsonb', nullable: true })
  recommendedActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  lastCalculatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

