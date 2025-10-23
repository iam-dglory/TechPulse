// =====================================================
// TECHPULZE DATABASE TYPES
// Auto-generated types for Supabase tables
// =====================================================

export type UserType = 'consumer' | 'investor' | 'employee' | 'researcher';
export type VerificationTier = 'certified' | 'trusted' | 'exemplary' | 'pioneer';
export type ReviewerType = 'employee' | 'customer' | 'investor' | 'researcher';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type EthicsImpact = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
export type BiasLevel = 'low' | 'medium' | 'high';
export type DiscussionCategory = 'general' | 'privacy' | 'ai_ml' | 'sustainability' | 'labor' | 'governance' | 'investment' | 'spotlight';
export type DiscussionStatus = 'active' | 'closed' | 'archived';
export type VoteType = 'upvote' | 'downvote';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  level: number;
  points: number;
  bio: string | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  industry: string | null;
  founded_year: number | null;
  employee_count: number | null;
  headquarters: string | null;
  website: string | null;
  funding_stage: string | null;
  funding_amount: number | null;
  verification_tier: VerificationTier | null;
  overall_score: number;
  privacy_score: number;
  transparency_score: number;
  labor_score: number;
  environment_score: number;
  community_score: number;
  growth_rate: number;
  review_count: number;
  view_count: number;
  follower_count: number;
  trending_score: number;
  claimed_by: string | null;
  is_verified: boolean;
  products: any;
  target_users: string[] | null;
  official_statement: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  company_id: string;
  user_id: string;
  overall_rating: number;
  privacy_rating: number | null;
  transparency_rating: number | null;
  labor_rating: number | null;
  environment_rating: number | null;
  community_rating: number | null;
  title: string;
  content: string;
  reviewer_type: ReviewerType;
  is_verified: boolean;
  verification_proof_url: string | null;
  helpful_count: number;
  report_count: number;
  status: ReviewStatus;
  company_response: string | null;
  company_response_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnail_url: string | null;
  source_url: string | null;
  source_name: string | null;
  author: string | null;
  company_ids: string[] | null;
  ethics_impact: EthicsImpact;
  ethics_impact_score: number;
  hype_score: number;
  credibility_score: number;
  bias_level: BiasLevel;
  fact_checked: boolean;
  discussion_count: number;
  view_count: number;
  published_at: string;
  created_at: string;
}

export interface Discussion {
  id: string;
  title: string;
  slug: string;
  content: string;
  user_id: string;
  category: DiscussionCategory;
  company_ids: string[] | null;
  upvote_count: number;
  reply_count: number;
  view_count: number;
  is_pinned: boolean;
  is_expert_verified: boolean;
  status: DiscussionStatus;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TrendingCompany {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  overall_score: number;
  verification_tier: VerificationTier | null;
  growth_rate: number;
  trending_score: number;
  review_count: number;
  follower_count: number;
}

export interface CompanyWithDetails extends Company {
  is_following?: boolean;
  claimed_by_profile?: Profile;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}
