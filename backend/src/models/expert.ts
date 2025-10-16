import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Vote } from './vote';

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // References User.id

  @Column()
  name: string;

  @Column()
  title: string;

  @Column()
  organization: string;

  @Column('text', { array: true })
  expertiseAreas: string[]; // e.g., ['AI', 'Cybersecurity', 'Privacy']

  @Column('text', { array: true })
  credentials: string[]; // e.g., ['PhD Computer Science', 'Former CTO at Google']

  @Column({ type: 'int', default: 1 })
  verificationLevel: number; // 1-5, higher = more verified

  @Column({ type: 'int', default: 1 })
  voteWeight: number; // Multiplier for their votes (1-5x)

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedBy: string; // Admin user ID who verified them

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  twitterHandle: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'int', default: 0 })
  totalVotes: number;

  @Column({ type: 'float', default: 0 })
  accuracyScore: number; // Track how often their predictions are right

  @Column({ type: 'text', nullable: true })
  bio: string;

  @OneToMany(() => Vote, vote => vote.expert)
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
