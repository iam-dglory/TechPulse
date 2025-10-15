import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from './company';

export interface PriceTier {
  name: string;
  price: number;
  currency: string;
  features: string[];
  billingCycle: 'monthly' | 'yearly' | 'one-time';
}

export interface ProductFeatures {
  core: string[];
  advanced: string[];
  integrations: string[];
  support: string[];
}

@Entity('products')
@Index(['companyId'])
@Index(['name'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  priceTiers: PriceTier[];

  @Column({ type: 'jsonb', nullable: true })
  features: ProductFeatures;

  @Column({ type: 'text', array: true, default: [] })
  targetUsers: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  demoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Company, company => company.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Virtual fields
  get hasFreeTier(): boolean {
    return this.priceTiers?.some(tier => tier.price === 0) || false;
  }

  get startingPrice(): number {
    const paidTiers = this.priceTiers?.filter(tier => tier.price > 0) || [];
    return paidTiers.length > 0 ? Math.min(...paidTiers.map(tier => tier.price)) : 0;
  }

  get totalFeatures(): number {
    return Object.values(this.features || {}).reduce((total, featureList) => {
      return total + (Array.isArray(featureList) ? featureList.length : 0);
    }, 0);
  }
}
