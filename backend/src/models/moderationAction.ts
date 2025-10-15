import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';
import { Story } from './story';
import { Flag } from './flag';

export enum ModerationActionType {
  STORY_HIDDEN = 'story_hidden',
  STORY_RESTORED = 'story_restored',
  STORY_DELETED = 'story_deleted',
  FLAG_APPROVED = 'flag_approved',
  FLAG_REJECTED = 'flag_rejected',
  FLAG_ESCALATED = 'flag_escalated',
  CONTENT_EDITED = 'content_edited',
  USER_WARNED = 'user_warned',
  USER_SUSPENDED = 'user_suspended',
  USER_BANNED = 'user_banned',
  LEGAL_NOTICE_SENT = 'legal_notice_sent',
  DMCA_TAKEDOWN = 'dmca_takedown',
  PRIVACY_VIOLATION_HANDLED = 'privacy_violation_handled',
}

export enum ModerationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

@Entity('moderation_actions')
export class ModerationAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ModerationActionType,
  })
  actionType: ModerationActionType;

  @Column({
    type: 'enum',
    enum: ModerationSeverity,
    default: ModerationSeverity.INFO,
  })
  severity: ModerationSeverity;

  @Column({ name: 'moderator_id' })
  moderatorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moderator_id' })
  moderator: User;

  @Column({ name: 'target_user_id', nullable: true })
  targetUserId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User;

  @Column({ name: 'story_id', nullable: true })
  storyId: string;

  @ManyToOne(() => Story, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'flag_id', nullable: true })
  flagId: string;

  @ManyToOne(() => Flag, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'flag_id' })
  flag: Flag;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    originalContent?: string;
    editedContent?: string;
    affectedFields?: string[];
    ipAddress?: string;
    userAgent?: string;
    legalBasis?: string;
    complianceNotes?: string;
    appealProcess?: string;
    duration?: number; // for suspensions
    previousWarnings?: number;
  };

  @Column({ type: 'boolean', default: false })
  isAppealable: boolean;

  @Column({ type: 'timestamp', nullable: true })
  effectiveUntil: Date;

  @Column({ type: 'boolean', default: false })
  isReversed: boolean;

  @Column({ name: 'reversed_by', nullable: true })
  reversedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reversed_by' })
  reversedByUser: User;

  @Column({ type: 'timestamp', nullable: true })
  reversedAt: Date;

  @Column({ type: 'text', nullable: true })
  reversalReason: string;

  @CreateDateColumn()
  createdAt: Date;

  // Virtual fields
  get isActive(): boolean {
    return !this.isReversed && (!this.effectiveUntil || this.effectiveUntil > new Date());
  }

  get isExpired(): boolean {
    return this.effectiveUntil && this.effectiveUntil <= new Date();
  }

  get isAppealPeriodActive(): boolean {
    if (!this.isAppealable) return false;
    const appealDeadline = new Date(this.createdAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    return appealDeadline > new Date();
  }

  get daysUntilExpiry(): number | null {
    if (!this.effectiveUntil) return null;
    const now = new Date();
    const diffTime = this.effectiveUntil.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
