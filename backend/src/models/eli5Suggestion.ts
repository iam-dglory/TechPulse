import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Story } from './story';
import { User } from './user';

@Entity('eli5_suggestions')
export class Eli5Suggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'story_id' })
  storyId: string;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20 })
  mode: 'simple' | 'technical';

  @Column({ type: 'text' })
  suggestedText: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'int', default: 0 })
  upvotes: number;

  @Column({ type: 'int', default: 0 })
  downvotes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  get netVotes(): number {
    return this.upvotes - this.downvotes;
  }

  get isApproved(): boolean {
    return this.status === 'approved';
  }

  get isPending(): boolean {
    return this.status === 'pending';
  }

  get isRejected(): boolean {
    return this.status === 'rejected';
  }
}

