import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Product } from './product';
import { Story } from './story';

export type FundingStage = 
  | 'pre-seed' 
  | 'seed' 
  | 'series-a' 
  | 'series-b' 
  | 'series-c' 
  | 'series-d' 
  | 'series-e' 
  | 'ipo' 
  | 'acquired' 
  | 'private';

@Entity('companies')
@Index(['slug'], { unique: true })
@Index(['name'])
@Index(['verified'])
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string;

  @Column({ type: 'text', array: true, default: [] })
  sectorTags: string[];

  @Column({ 
    type: 'enum',
    enum: [
      'pre-seed', 'seed', 'series-a', 'series-b', 
      'series-c', 'series-d', 'series-e', 'ipo', 
      'acquired', 'private'
    ],
    default: 'private'
  })
  fundingStage: FundingStage;

  @Column({ type: 'text', array: true, default: [] })
  investors: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  hqLocation: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ethicsStatementUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  privacyPolicyUrl: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  credibilityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ethicsScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  hypeScore: number;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'unclaimed' })
  claimStatus: 'unclaimed' | 'pending_review' | 'approved' | 'rejected';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Product, product => product.company)
  products: Product[];

  @OneToMany(() => Story, story => story.company)
  stories: Story[];

  // Virtual fields for calculated scores
  get overallScore(): number {
    return (this.credibilityScore + this.ethicsScore + this.hypeScore) / 3;
  }

  get isHighRisk(): boolean {
    return this.ethicsScore < 30 || this.credibilityScore < 30;
  }

  get isVerified(): boolean {
    return this.verified && this.verifiedAt !== null;
  }
}
