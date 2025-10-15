import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Story } from './story';
import { User } from './user';

export enum FlagReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  FALSE_INFORMATION = 'false_information',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  PRIVACY_VIOLATION = 'privacy_violation',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  ILLEGAL_CONTENT = 'illegal_content',
  PERSONAL_ATTACK = 'personal_attack',
  MISINFORMATION = 'misinformation',
  MANIPULATED_MEDIA = 'manipulated_media',
  OTHER = 'other',
}

export enum FlagStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

export enum FlagPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('flags')
export class Flag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'story_id' })
  storyId: string;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'reporter_id' })
  reporterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({
    type: 'enum',
    enum: FlagReason,
  })
  reason: FlagReason;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  evidence: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    reporterIP?: string;
    userAgent?: string;
    reportedAt?: string;
    relatedFlags?: string[];
    severityScore?: number;
  };

  @Column({
    type: 'enum',
    enum: FlagStatus,
    default: FlagStatus.PENDING,
  })
  status: FlagStatus;

  @Column({
    type: 'enum',
    enum: FlagPriority,
    default: FlagPriority.MEDIUM,
  })
  priority: FlagPriority;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'boolean', default: false })
  isAutoHidden: boolean;

  @Column({ type: 'timestamp', nullable: true })
  autoHiddenAt: Date;

  @Column({ type: 'boolean', default: false })
  requiresLegalReview: boolean;

  @Column({ type: 'timestamp', nullable: true })
  escalatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  get isPending(): boolean {
    return this.status === FlagStatus.PENDING;
  }

  get isUnderReview(): boolean {
    return this.status === FlagStatus.UNDER_REVIEW;
  }

  get isResolved(): boolean {
    return [FlagStatus.APPROVED, FlagStatus.REJECTED].includes(this.status);
  }

  get isEscalated(): boolean {
    return this.status === FlagStatus.ESCALATED;
  }

  get daysSinceReported(): number {
    return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  get isOverdue(): boolean {
    return this.daysSinceReported > this.getSLAHours() / 24;
  }

  getSLAHours(): number {
    switch (this.priority) {
      case FlagPriority.CRITICAL: return 2; // 2 hours
      case FlagPriority.HIGH: return 8; // 8 hours
      case FlagPriority.MEDIUM: return 24; // 24 hours
      case FlagPriority.LOW: return 72; // 72 hours
      default: return 24;
    }
  }
}
