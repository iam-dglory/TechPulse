import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Story } from './story';
import { Company } from './company';
import { User } from './user';

@Entity('graveyard')
export class Graveyard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_claim_story_id' })
  originalClaimStoryId: string;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'original_claim_story_id' })
  originalClaimStory: Story;

  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  followUpSummary: string;

  @Column({ type: 'text' })
  actualOutcome: string;

  @Column({ type: 'timestamp' })
  outcomeDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'broken-promise' })
  failureType: 'broken-promise' | 'overhyped' | 'failed-delivery' | 'misleading-claims' | 'cancelled-project' | 'delayed-indefinitely';

  @Column({ type: 'jsonb', nullable: true })
  impactAssessment: {
    usersAffected?: number;
    financialImpact?: string;
    reputationDamage?: string;
    lessonsLearned?: string[];
  };

  @Column({ type: 'text', nullable: true })
  originalPromises: string;

  @Column({ type: 'jsonb', nullable: true })
  sources: Array<{
    url: string;
    title: string;
    date: string;
    type: 'follow-up-article' | 'official-statement' | 'news-report' | 'social-media' | 'other';
  }>;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
