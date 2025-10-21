/**
 * Comprehensive Validation Schemas for TexhPulze
 *
 * Uses Zod for runtime type validation and TypeScript type inference.
 * All schemas include detailed error messages and constraints.
 */

import { z } from 'zod';

// ============================================
// HELPER VALIDATORS
// ============================================

/**
 * Password validation regex
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Username validation regex
 * - 3-20 characters
 * - Alphanumeric and underscore only
 */
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * Slug validation regex
 * - Lowercase letters, numbers, and hyphens
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * UUID validation
 */
const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * URL validation (allows empty string)
 */
const optionalUrlSchema = z
  .string()
  .url('Invalid URL format')
  .or(z.literal(''))
  .optional();

/**
 * Required URL validation
 */
const requiredUrlSchema = z.string().url('Invalid URL format');

/**
 * Date validation (YYYY-MM-DD format)
 */
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: 'Invalid date' }
  );

// ============================================
// 1. USER AUTHENTICATION SCHEMAS
// ============================================

/**
 * User type enumeration
 */
export const UserTypeEnum = z.enum([
  'citizen',
  'researcher',
  'policymaker',
  'government',
  'admin',
]);

/**
 * Sign up validation schema
 */
export const signUpSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(
      usernameRegex,
      'Username can only contain letters, numbers, and underscores'
    )
    .toLowerCase()
    .trim(),

  userType: UserTypeEnum.default('citizen'),

  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .optional(),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
});

/**
 * Password reset confirmation schema
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// ============================================
// 2. COMPANY SCHEMAS
// ============================================

/**
 * Industry enumeration
 */
export const IndustryEnum = z.enum([
  'technology',
  'finance',
  'healthcare',
  'retail',
  'manufacturing',
  'energy',
  'transportation',
  'telecommunications',
  'education',
  'entertainment',
  'hospitality',
  'real-estate',
  'agriculture',
  'consulting',
  'other',
]);

/**
 * Company creation/update schema
 */
export const companySchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .trim(),

  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(slugRegex, 'Slug must be lowercase with hyphens only')
    .toLowerCase()
    .trim(),

  industry: IndustryEnum,

  website: z
    .string()
    .url('Invalid website URL')
    .or(z.literal(''))
    .optional(),

  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),

  founded_year: z
    .number()
    .int('Founded year must be an integer')
    .min(1800, 'Founded year must be after 1800')
    .max(
      new Date().getFullYear(),
      `Founded year cannot be after ${new Date().getFullYear()}`
    ),

  headquarters: z
    .string()
    .min(2, 'Headquarters location must be at least 2 characters')
    .max(100, 'Headquarters location must not exceed 100 characters')
    .trim(),

  employee_count: z
    .number()
    .int('Employee count must be an integer')
    .positive('Employee count must be positive')
    .optional(),

  logo_url: optionalUrlSchema,
});

/**
 * Company search/filter schema
 */
export const companyFilterSchema = z.object({
  industry: IndustryEnum.optional(),
  founded_year_min: z.number().int().min(1800).optional(),
  founded_year_max: z.number().int().max(new Date().getFullYear()).optional(),
  employee_count_min: z.number().int().positive().optional(),
  employee_count_max: z.number().int().positive().optional(),
});

/**
 * Company search query schema (for API)
 */
export const companySearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query must be at least 1 character')
    .max(100, 'Search query must not exceed 100 characters')
    .trim()
    .optional(),

  industry: IndustryEnum.optional(),

  score_min: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(10))
    .optional(),

  score_max: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(10))
    .optional(),

  verification_tier: VerificationTierEnum.optional(),

  sort: z
    .enum(['score', 'trending', 'recent', 'name'])
    .optional()
    .default('score'),

  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default('20'),

  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0))
    .optional()
    .default('0'),
});

// ============================================
// 3. VOTING SCHEMAS
// ============================================

/**
 * Vote type enumeration
 */
export const VoteTypeEnum = z.enum([
  'ethics',
  'credibility',
  'delivery',
  'security',
  'innovation',
]);

/**
 * Vote submission schema
 */
export const voteSchema = z.object({
  company_id: uuidSchema,

  vote_type: VoteTypeEnum,

  score: z
    .number()
    .int('Score must be an integer')
    .min(1, 'Score must be at least 1')
    .max(10, 'Score must not exceed 10'),

  comment: z
    .string()
    .max(500, 'Comment must not exceed 500 characters')
    .trim()
    .optional(),

  evidence_url: optionalUrlSchema,
});

/**
 * Vote update schema (allows partial updates)
 */
export const voteUpdateSchema = voteSchema.partial().omit({ company_id: true });

/**
 * Vote filter schema
 */
export const voteFilterSchema = z.object({
  company_id: uuidSchema.optional(),
  vote_type: VoteTypeEnum.optional(),
  score_min: z.number().int().min(1).max(10).optional(),
  score_max: z.number().int().min(1).max(10).optional(),
  user_id: uuidSchema.optional(),
});

/**
 * Vote query schema for GET requests
 */
export const voteQuerySchema = z.object({
  company_id: z.string().uuid('Invalid company ID format'),
  user_id: z.string().uuid('Invalid user ID format').optional(),
  vote_type: VoteTypeEnum.optional(),
});

// ============================================
// 4. PROMISES SCHEMAS
// ============================================

/**
 * Promise category enumeration
 */
export const PromiseCategoryEnum = z.enum([
  'product',
  'ethics',
  'sustainability',
  'privacy',
  'security',
]);

/**
 * Promise status enumeration
 */
export const PromiseStatusEnum = z.enum([
  'pending',
  'in-progress',
  'kept',
  'broken',
  'delayed',
]);

/**
 * Promise creation schema
 */
export const promiseSchema = z
  .object({
    company_id: uuidSchema,

    promise_text: z
      .string()
      .min(20, 'Promise text must be at least 20 characters')
      .max(500, 'Promise text must not exceed 500 characters')
      .trim(),

    category: PromiseCategoryEnum,

    promised_date: dateSchema,

    deadline_date: dateSchema,

    source_url: requiredUrlSchema,

    impact_level: z
      .number()
      .int('Impact level must be an integer')
      .min(1, 'Impact level must be at least 1')
      .max(5, 'Impact level must not exceed 5'),

    status: PromiseStatusEnum.default('pending'),
  })
  .refine(
    (data) => {
      const promised = new Date(data.promised_date);
      const deadline = new Date(data.deadline_date);
      return deadline >= promised;
    },
    {
      message: 'Deadline date must be on or after promised date',
      path: ['deadline_date'],
    }
  );

/**
 * Promise update schema
 */
export const promiseUpdateSchema = z
  .object({
    promise_text: z
      .string()
      .min(20, 'Promise text must be at least 20 characters')
      .max(500, 'Promise text must not exceed 500 characters')
      .trim()
      .optional(),

    category: PromiseCategoryEnum.optional(),

    promised_date: dateSchema.optional(),

    deadline_date: dateSchema.optional(),

    source_url: requiredUrlSchema.optional(),

    impact_level: z.number().int().min(1).max(5).optional(),

    status: PromiseStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.promised_date && data.deadline_date) {
        const promised = new Date(data.promised_date);
        const deadline = new Date(data.deadline_date);
        return deadline >= promised;
      }
      return true;
    },
    {
      message: 'Deadline date must be on or after promised date',
      path: ['deadline_date'],
    }
  );

/**
 * Promise filter schema
 */
export const promiseFilterSchema = z.object({
  company_id: uuidSchema.optional(),
  category: PromiseCategoryEnum.optional(),
  status: PromiseStatusEnum.optional(),
  impact_level_min: z.number().int().min(1).max(5).optional(),
  impact_level_max: z.number().int().min(1).max(5).optional(),
  deadline_before: dateSchema.optional(),
  deadline_after: dateSchema.optional(),
});

/**
 * Promise query schema for GET requests
 */
export const promiseQuerySchema = z.object({
  company_id: z.string().uuid('Invalid company ID format'),
  status: PromiseStatusEnum.optional(),
});

/**
 * Promise vote verdict enumeration
 */
export const PromiseVoteVerdictEnum = z.enum([
  'kept',
  'broken',
  'partial',
]);

/**
 * Promise vote schema
 */
export const promiseVoteSchema = z.object({
  promise_id: uuidSchema,

  verdict: PromiseVoteVerdictEnum,

  comment: z
    .string()
    .max(500, 'Comment must not exceed 500 characters')
    .trim()
    .optional(),
});

// ============================================
// 5. REVIEWS SCHEMAS
// ============================================

/**
 * Review creation schema
 */
export const reviewSchema = z.object({
  company_id: uuidSchema,

  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5'),

  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),

  content: z
    .string()
    .min(50, 'Review content must be at least 50 characters')
    .max(2000, 'Review content must not exceed 2000 characters')
    .trim(),

  is_employee: z.boolean().default(false),

  is_customer: z.boolean().default(false),

  pros: z
    .string()
    .max(500, 'Pros must not exceed 500 characters')
    .trim()
    .optional(),

  cons: z
    .string()
    .max(500, 'Cons must not exceed 500 characters')
    .trim()
    .optional(),
});

/**
 * Review update schema
 */
export const reviewUpdateSchema = reviewSchema
  .partial()
  .omit({ company_id: true });

/**
 * Review filter schema
 */
export const reviewFilterSchema = z.object({
  company_id: uuidSchema.optional(),
  rating_min: z.number().int().min(1).max(5).optional(),
  rating_max: z.number().int().min(1).max(5).optional(),
  is_employee: z.boolean().optional(),
  is_customer: z.boolean().optional(),
});

// ============================================
// 6. SEARCH SCHEMAS
// ============================================

/**
 * Verification tier enumeration
 */
export const VerificationTierEnum = z.enum([
  'unverified',
  'basic',
  'verified',
  'premium',
]);

/**
 * Sort order enumeration
 */
export const SortOrderEnum = z.enum([
  'relevance',
  'score_high',
  'score_low',
  'name_asc',
  'name_desc',
  'founded_year_asc',
  'founded_year_desc',
  'reviews_count',
]);

/**
 * Search schema
 */
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query must be at least 1 character')
    .max(100, 'Search query must not exceed 100 characters')
    .trim(),

  industry: IndustryEnum.optional(),

  score_min: z
    .number()
    .min(0, 'Minimum score must be at least 0')
    .max(10, 'Minimum score must not exceed 10')
    .optional(),

  score_max: z
    .number()
    .min(0, 'Maximum score must be at least 0')
    .max(10, 'Maximum score must not exceed 10')
    .optional(),

  verification_tier: VerificationTierEnum.optional(),

  sort: SortOrderEnum.default('relevance'),

  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .default(20),

  offset: z
    .number()
    .int('Offset must be an integer')
    .min(0, 'Offset must be at least 0')
    .default(0),
});

// ============================================
// 7. GRIEVANCE SCHEMAS (TexhPulze Specific)
// ============================================

/**
 * Grievance category enumeration
 */
export const GrievanceCategoryEnum = z.enum([
  'infrastructure',
  'healthcare',
  'education',
  'transportation',
  'environment',
  'safety',
  'corruption',
  'public-service',
  'other',
]);

/**
 * Risk level enumeration
 */
export const RiskLevelEnum = z.enum(['low', 'medium', 'high', 'critical']);

/**
 * Grievance status enumeration
 */
export const GrievanceStatusEnum = z.enum([
  'pending',
  'reviewing',
  'resolved',
  'rejected',
]);

/**
 * Grievance creation schema
 */
export const grievanceSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),

  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),

  category: GrievanceCategoryEnum,

  risk_level: RiskLevelEnum.default('medium'),

  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters')
    .trim()
    .optional(),

  evidence_urls: z
    .array(z.string().url('Invalid URL format'))
    .max(5, 'Maximum 5 evidence URLs allowed')
    .optional(),
});

/**
 * Grievance update schema (for status changes)
 */
export const grievanceUpdateSchema = z.object({
  status: GrievanceStatusEnum,
  admin_notes: z
    .string()
    .max(1000, 'Admin notes must not exceed 1000 characters')
    .trim()
    .optional(),
});

// ============================================
// 8. DISCUSSION SCHEMAS (TexhPulze Specific)
// ============================================

/**
 * Discussion category enumeration
 */
export const DiscussionCategoryEnum = z.enum([
  'policy',
  'technology',
  'governance',
  'community',
  'announcements',
  'feedback',
  'general',
]);

/**
 * Discussion creation schema
 */
export const discussionSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),

  content: z
    .string()
    .min(50, 'Content must be at least 50 characters')
    .max(5000, 'Content must not exceed 5000 characters')
    .trim(),

  category: DiscussionCategoryEnum,

  tags: z
    .array(z.string().min(2).max(30).toLowerCase().trim())
    .max(5, 'Maximum 5 tags allowed')
    .optional(),
});

/**
 * Discussion update schema
 */
export const discussionUpdateSchema = discussionSchema.partial();

/**
 * Comment creation schema
 */
export const commentSchema = z.object({
  discussion_id: uuidSchema,

  content: z
    .string()
    .min(5, 'Comment must be at least 5 characters')
    .max(1000, 'Comment must not exceed 1000 characters')
    .trim(),

  parent_comment_id: uuidSchema.optional(),
});

// ============================================
// EXPORTED TYPESCRIPT TYPES
// ============================================

// Authentication Types
export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type UserType = z.infer<typeof UserTypeEnum>;

// Company Types
export type CompanyInput = z.infer<typeof companySchema>;
export type CompanyFilterInput = z.infer<typeof companyFilterSchema>;
export type CompanySearchInput = z.infer<typeof companySearchSchema>;
export type Industry = z.infer<typeof IndustryEnum>;

// Voting Types
export type VoteInput = z.infer<typeof voteSchema>;
export type VoteUpdateInput = z.infer<typeof voteUpdateSchema>;
export type VoteFilterInput = z.infer<typeof voteFilterSchema>;
export type VoteQueryInput = z.infer<typeof voteQuerySchema>;
export type VoteType = z.infer<typeof VoteTypeEnum>;

// Promise Types
export type PromiseInput = z.infer<typeof promiseSchema>;
export type PromiseUpdateInput = z.infer<typeof promiseUpdateSchema>;
export type PromiseFilterInput = z.infer<typeof promiseFilterSchema>;
export type PromiseQueryInput = z.infer<typeof promiseQuerySchema>;
export type PromiseCategory = z.infer<typeof PromiseCategoryEnum>;
export type PromiseStatus = z.infer<typeof PromiseStatusEnum>;
export type PromiseVoteInput = z.infer<typeof promiseVoteSchema>;
export type PromiseVoteVerdict = z.infer<typeof PromiseVoteVerdictEnum>;

// Review Types
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
export type ReviewFilterInput = z.infer<typeof reviewFilterSchema>;

// Search Types
export type SearchInput = z.infer<typeof searchSchema>;
export type VerificationTier = z.infer<typeof VerificationTierEnum>;
export type SortOrder = z.infer<typeof SortOrderEnum>;

// Grievance Types
export type GrievanceInput = z.infer<typeof grievanceSchema>;
export type GrievanceUpdateInput = z.infer<typeof grievanceUpdateSchema>;
export type GrievanceCategory = z.infer<typeof GrievanceCategoryEnum>;
export type RiskLevel = z.infer<typeof RiskLevelEnum>;
export type GrievanceStatus = z.infer<typeof GrievanceStatusEnum>;

// Discussion Types
export type DiscussionInput = z.infer<typeof discussionSchema>;
export type DiscussionUpdateInput = z.infer<typeof discussionUpdateSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type DiscussionCategory = z.infer<typeof DiscussionCategoryEnum>;

// ============================================
// 9. NEWS SCHEMAS
// ============================================

/**
 * News creation schema
 */
export const newsSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),

  content: z
    .string()
    .min(100, 'Content must be at least 100 characters')
    .max(10000, 'Content must not exceed 10000 characters')
    .trim(),

  company_id: uuidSchema.optional().nullable(),

  ethics_impact: z
    .number()
    .int('Ethics impact must be an integer')
    .min(1, 'Ethics impact must be at least 1')
    .max(10, 'Ethics impact must not exceed 10')
    .optional()
    .nullable(),

  source_url: requiredUrlSchema,

  published_at: dateSchema,
});

/**
 * News update schema
 */
export const newsUpdateSchema = newsSchema.partial();

/**
 * News query/filter schema
 */
export const newsQuerySchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default('20'),

  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(0))
    .optional()
    .default('0'),

  industry: IndustryEnum.optional(),

  impact: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(10))
    .optional(),

  company_id: uuidSchema.optional(),

  search: z
    .string()
    .min(1)
    .max(100)
    .trim()
    .optional(),
});

// News Types
export type NewsInput = z.infer<typeof newsSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
export type NewsQueryInput = z.infer<typeof newsQuerySchema>;
