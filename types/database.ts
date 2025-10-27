export type UserRole = 'user' | 'moderator' | 'admin' | 'company_owner'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type ReviewerType = 'employee' | 'customer' | 'investor' | 'researcher'
export type VerificationTier = 'none' | 'basic' | 'verified' | 'certified'

export interface Profile {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  points: number
  level: number
  created_at: string
}

export interface Company {
  id: string
  name: string
  slug: string
  logo_url?: string
  website?: string
  industry?: string
  description?: string
  overall_score: number
  privacy_score: number
  transparency_score: number
  labor_score: number
  environment_score: number
  community_score: number
  review_count: number
  follower_count: number
  created_at: string
}

export interface Review {
  id: string
  company_id: string
  user_id: string
  overall_rating: number
  privacy_rating?: number
  transparency_rating?: number
  labor_rating?: number
  environment_rating?: number
  community_rating?: number
  title: string
  content: string
  reviewer_type: ReviewerType
  helpful_count: number
  status: ReviewStatus
  created_at: string
  profiles?: Profile
  companies?: Company
}

export interface UserFollow {
  id: string
  user_id: string
  company_id: string
}

export interface ReviewVote {
  id: string
  review_id: string
  user_id: string
  is_helpful: boolean
}
