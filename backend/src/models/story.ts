import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Company } from './company';
import { Vote } from './vote';

@Entity('stories')
@Index(['companyId'])
@Index(['sectorTag'])
@Index(['publishedAt'])
@Index(['createdBy'])
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  sourceUrl: string;

  @Column({ type: 'uuid', nullable: true })
  companyId: string;

  @Column({ type: 'varchar', length: 100 })
  sectorTag: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  hypeScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ethicsScore: number;

  @Column({ type: 'text', nullable: true })
  realityCheck: string;

  @Column({ type: 'text', nullable: true })
  eli5Summary: string;

  @Column({ type: 'text', nullable: true })
  simpleSummary: string;

  @Column({ type: 'text', nullable: true })
  technicalSummary: string;

  @Column({ type: 'text', array: true, default: [] })
  impactTags: string[];

  @Column({ type: 'varchar', length: 255 })
  createdBy: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Company, company => company.stories, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => Vote, vote => vote.story)
  votes: Vote[];

  // Virtual fields
  get isPublished(): boolean {
    return this.publishedAt !== null && this.publishedAt <= new Date();
  }

  get overallScore(): number {
    return (this.hypeScore + this.ethicsScore) / 2;
  }

  get voteCount(): number {
    return this.votes?.length || 0;
  }

  get helpfulVotes(): number {
    return this.votes?.filter(vote => vote.voteValue === 'helpful').length || 0;
  }

  get harmfulVotes(): number {
    return this.votes?.filter(vote => vote.voteValue === 'harmful').length || 0;
  }

  get neutralVotes(): number {
    return this.votes?.filter(vote => vote.voteValue === 'neutral').length || 0;
  }

  get sentimentScore(): number {
    const total = this.voteCount;
    if (total === 0) return 0;
    return (this.helpfulVotes - this.harmfulVotes) / total;
  }

  get isHighImpact(): boolean {
    return this.impactTags.some(tag => 
      ['critical', 'breaking', 'major', 'urgent'].includes(tag.toLowerCase())
    );
  }

  get isEthicsRelated(): boolean {
    return this.impactTags.some(tag => 
      ['ethics', 'privacy', 'bias', 'discrimination', 'transparency'].includes(tag.toLowerCase())
    );
  }
}
