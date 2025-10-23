/**
 * Company validation schemas using Zod
 */

import { z } from 'zod';

// Company query parameters schema
export const CompanyQuerySchema = z.object({
  // Pagination
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),

  // Filters
  industry: z.string().optional(),
  minScore: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxScore: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  verificationTier: z.string().optional().transform(val => val ? val.split(',') : undefined),
  growthStatus: z.string().optional().transform(val => val ? val.split(',') : undefined),
  fundingStage: z.string().optional().transform(val => val ? val.split(',') : undefined),
  foundedYearMin: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  foundedYearMax: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  isVerified: z.string().optional().transform(val => val === 'true'),
  search: z.string().optional(),

  // Sorting
  sort: z.enum(['trending', 'score', 'growth', 'reviews', 'recent', 'name']).optional().default('trending'),
});

export type CompanyQuery = z.infer<typeof CompanyQuerySchema>;

// Create company schema
export const CreateCompanySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  slug: z.string()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  industry: z.string().min(2).max(100),

  // Optional fields
  logo_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  website: z.string().url().optional(),
  founded_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  employee_count: z.number().min(0).optional(),
  headquarters: z.string().max(200).optional(),
  funding_stage: z.string().max(50).optional(),
  funding_amount: z.number().min(0).optional(),

  // Complex fields
  products: z.array(z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().url().optional(),
  })).optional(),
  target_users: z.array(z.string()).optional(),
  official_statement: z.string().max(2000).optional(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;

// Update company schema (all fields optional)
export const UpdateCompanySchema = CreateCompanySchema.partial().extend({
  // Allow updating verification tier (admin only)
  verification_tier: z.enum(['certified', 'trusted', 'exemplary', 'pioneer']).optional(),
  is_verified: z.boolean().optional(),
});

export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;

// Follow company schema
export const FollowCompanySchema = z.object({
  action: z.enum(['follow', 'unfollow']).optional(),
});

export type FollowCompanyInput = z.infer<typeof FollowCompanySchema>;
