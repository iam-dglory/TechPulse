import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Story } from './story';

export type VoteValue = 'helpful' | 'harmful' | 'neutral';

@Entity('votes')
@Index(['storyId'])
@Index(['userId'])
@Index(['industry'])
@Index(['voteValue'])
@Index(['createdAt'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  storyId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  industry: string;

  @Column({ 
    type: 'enum',
    enum: ['helpful', 'harmful', 'neutral'],
    default: 'neutral'
  })
  voteValue: VoteValue;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Story, story => story.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storyId' })
  story: Story;

  // Virtual fields
  get isPositive(): boolean {
    return this.voteValue === 'helpful';
  }

  get isNegative(): boolean {
    return this.voteValue === 'harmful';
  }

  get isNeutral(): boolean {
    return this.voteValue === 'neutral';
  }

  get hasComment(): boolean {
    return this.comment && this.comment.trim().length > 0;
  }

  get commentLength(): number {
    return this.comment?.length || 0;
  }

  get voteWeight(): number {
    switch (this.voteValue) {
      case 'helpful': return 1;
      case 'harmful': return -1;
      case 'neutral': return 0;
      default: return 0;
    }
  }
}
