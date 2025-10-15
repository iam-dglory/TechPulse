import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';

export enum AuditEventType {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTRATION = 'user_registration',
  USER_PROFILE_UPDATE = 'user_profile_update',
  STORY_CREATED = 'story_created',
  STORY_UPDATED = 'story_updated',
  STORY_DELETED = 'story_deleted',
  STORY_VIEWED = 'story_viewed',
  FLAG_CREATED = 'flag_created',
  FLAG_REVIEWED = 'flag_reviewed',
  MODERATION_ACTION = 'moderation_action',
  COMPANY_CLAIMED = 'company_claimed',
  COMPANY_VERIFIED = 'company_verified',
  VOTE_CAST = 'vote_cast',
  COMMENT_CREATED = 'comment_created',
  API_ACCESS = 'api_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  LEGAL_REQUEST = 'legal_request',
  PRIVACY_REQUEST = 'privacy_request',
  DATA_EXPORT = 'data_export',
  DATA_DELETION = 'data_deletion',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditEventType,
  })
  eventType: AuditEventType;

  @Column({
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.INFO,
  })
  severity: AuditSeverity;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  httpMethod: string;

  @Column({ type: 'int', nullable: true })
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  requestBody: string;

  @Column({ type: 'text', nullable: true })
  responseBody: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    entityId?: string;
    entityType?: string;
    beforeState?: any;
    afterState?: any;
    changes?: any;
    reason?: string;
    legalBasis?: string;
    complianceType?: string;
    dataRetention?: string;
    anonymized?: boolean;
    geolocation?: {
      country?: string;
      region?: string;
      city?: string;
    };
    riskScore?: number;
    automatedAction?: boolean;
  };

  @Column({ type: 'varchar', length: 50, nullable: true })
  correlationId: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'boolean', default: false })
  isRetained: boolean;

  @Column({ type: 'timestamp', nullable: true })
  retentionExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Virtual fields
  get isRetainedForLegal(): boolean {
    return this.isRetained && this.retentionExpiresAt && this.retentionExpiresAt > new Date();
  }

  get daysUntilRetentionExpiry(): number | null {
    if (!this.retentionExpiresAt) return null;
    const now = new Date();
    const diffTime = this.retentionExpiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isHighRisk(): boolean {
    return this.severity === AuditSeverity.CRITICAL || 
           this.severity === AuditSeverity.ERROR ||
           this.eventType === AuditEventType.SUSPICIOUS_ACTIVITY ||
           this.eventType === AuditEventType.LEGAL_REQUEST;
  }

  get requiresLegalReview(): boolean {
    return [
      AuditEventType.LEGAL_REQUEST,
      AuditEventType.PRIVACY_REQUEST,
      AuditEventType.DATA_EXPORT,
      AuditEventType.DATA_DELETION,
      AuditEventType.SUSPICIOUS_ACTIVITY,
    ].includes(this.eventType);
  }
}
