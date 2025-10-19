export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          industry: string
          funding_stage: string
          investors: string[]
          products: Product[]
          target_users: string
          ethical_policy: EthicalPolicy
          ethics_score: number
          verified: boolean
          website: string | null
          description: string | null
          employee_count: number | null
          founded_year: number | null
          headquarters: string | null
          verification_tier: 'none' | 'certified' | 'trusted' | 'exemplary' | 'pioneer'
          verification_date: string | null
          growth_rate: number | null
          impact_score: number
          innovation_score: number
          review_count: number
          average_rating: number
          follower_count: number
          credibility_score: number
          delivery_score: number
          security_score: number
          overall_score: number
          total_community_votes: number
          score_confidence: 'low' | 'medium' | 'high' | 'very_high'
          promises_kept_count: number
          promises_broken_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          industry: string
          funding_stage: string
          investors?: string[]
          products?: Product[]
          target_users: string
          ethical_policy?: EthicalPolicy
          ethics_score?: number
          verified?: boolean
          website?: string | null
          description?: string | null
          employee_count?: number | null
          founded_year?: number | null
          headquarters?: string | null
          verification_tier?: 'none' | 'certified' | 'trusted' | 'exemplary' | 'pioneer'
          verification_date?: string | null
          growth_rate?: number | null
          impact_score?: number
          innovation_score?: number
          review_count?: number
          average_rating?: number
          follower_count?: number
          credibility_score?: number
          delivery_score?: number
          security_score?: number
          overall_score?: number
          total_community_votes?: number
          score_confidence?: 'low' | 'medium' | 'high' | 'very_high'
          promises_kept_count?: number
          promises_broken_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          industry?: string
          funding_stage?: string
          investors?: string[]
          products?: Product[]
          target_users?: string
          ethical_policy?: EthicalPolicy
          ethics_score?: number
          verified?: boolean
          website?: string | null
          description?: string | null
          employee_count?: number | null
          founded_year?: number | null
          headquarters?: string | null
          verification_tier?: 'none' | 'certified' | 'trusted' | 'exemplary' | 'pioneer'
          verification_date?: string | null
          growth_rate?: number | null
          impact_score?: number
          innovation_score?: number
          review_count?: number
          average_rating?: number
          follower_count?: number
          credibility_score?: number
          delivery_score?: number
          security_score?: number
          overall_score?: number
          total_community_votes?: number
          score_confidence?: 'low' | 'medium' | 'high' | 'very_high'
          promises_kept_count?: number
          promises_broken_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      news_updates: {
        Row: {
          id: string
          headline: string
          summary: string
          sector: string
          company_id: string | null
          ethical_impact_tags: string[]
          ethics_score: number
          hype_score: number
          source_url: string
          published_at: string
          created_at: string
        }
        Insert: {
          id?: string
          headline: string
          summary: string
          sector: string
          company_id?: string | null
          ethical_impact_tags?: string[]
          ethics_score?: number
          hype_score?: number
          source_url: string
          published_at: string
          created_at?: string
        }
        Update: {
          id?: string
          headline?: string
          summary?: string
          sector?: string
          company_id?: string | null
          ethical_impact_tags?: string[]
          ethics_score?: number
          hype_score?: number
          source_url?: string
          published_at?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          company_id: string
          user_id: string
          rating: number
          comment: string
          verified: boolean
          moderation_status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          rating: number
          comment: string
          verified?: boolean
          moderation_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          rating?: number
          comment?: string
          verified?: boolean
          moderation_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          role: string
          interests: string[]
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          expertise_areas: string[]
          reputation_score: number
          is_expert: boolean
          preferences: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: string
          interests?: string[]
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          expertise_areas?: string[]
          reputation_score?: number
          is_expert?: boolean
          preferences?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          interests?: string[]
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          expertise_areas?: string[]
          reputation_score?: number
          is_expert?: boolean
          preferences?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      discussions: {
        Row: {
          id: string
          news_update_id: string
          user_id: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          news_update_id: string
          user_id: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          news_update_id?: string
          user_id?: string
          comment?: string
          created_at?: string
        }
      }
      user_recommendations: {
        Row: {
          id: string
          user_id: string
          news_update_id: string
          reason: string
          relevance_score: number
          shown: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          news_update_id: string
          reason: string
          relevance_score?: number
          shown?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          news_update_id?: string
          reason?: string
          relevance_score?: number
          shown?: boolean
          created_at?: string
        }
      }
      company_badges: {
        Row: {
          id: string
          company_id: string
          badge_type: 'certified' | 'trusted' | 'exemplary' | 'pioneer'
          awarded_at: string
          expires_at: string | null
          criteria_met: Record<string, any>
          auto_awarded: boolean
          reviewed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          badge_type: 'certified' | 'trusted' | 'exemplary' | 'pioneer'
          awarded_at?: string
          expires_at?: string | null
          criteria_met?: Record<string, any>
          auto_awarded?: boolean
          reviewed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          badge_type?: 'certified' | 'trusted' | 'exemplary' | 'pioneer'
          awarded_at?: string
          expires_at?: string | null
          criteria_met?: Record<string, any>
          auto_awarded?: boolean
          reviewed_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      company_metrics_history: {
        Row: {
          id: string
          company_id: string
          metric_date: string
          ethics_score: number | null
          impact_score: number | null
          innovation_score: number | null
          review_count: number | null
          average_rating: number | null
          follower_count: number | null
          news_mentions: number
          engagement_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          metric_date: string
          ethics_score?: number | null
          impact_score?: number | null
          innovation_score?: number | null
          review_count?: number | null
          average_rating?: number | null
          follower_count?: number | null
          news_mentions?: number
          engagement_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          metric_date?: string
          ethics_score?: number | null
          impact_score?: number | null
          innovation_score?: number | null
          review_count?: number | null
          average_rating?: number | null
          follower_count?: number | null
          news_mentions?: number
          engagement_score?: number | null
          created_at?: string
        }
      }
      company_follows: {
        Row: {
          id: string
          user_id: string
          company_id: string
          notify_on_news: boolean
          notify_on_updates: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          notify_on_news?: boolean
          notify_on_updates?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          notify_on_news?: boolean
          notify_on_updates?: boolean
          created_at?: string
        }
      }
      user_bookmarks: {
        Row: {
          id: string
          user_id: string
          item_type: 'company' | 'news' | 'discussion'
          item_id: string
          notes: string | null
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: 'company' | 'news' | 'discussion'
          item_id: string
          notes?: string | null
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: 'company' | 'news' | 'discussion'
          item_id?: string
          notes?: string | null
          tags?: string[]
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'follow' | 'news' | 'review' | 'badge' | 'discussion' | 'system'
          title: string
          message: string
          link: string | null
          read: boolean
          data: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'follow' | 'news' | 'review' | 'badge' | 'discussion' | 'system'
          title: string
          message: string
          link?: string | null
          read?: boolean
          data?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'follow' | 'news' | 'review' | 'badge' | 'discussion' | 'system'
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          data?: Record<string, any>
          created_at?: string
        }
      }
      user_activity: {
        Row: {
          id: string
          user_id: string
          activity_type: 'view_company' | 'view_news' | 'post_review' | 'post_discussion' | 'follow' | 'bookmark' | 'search'
          item_type: string | null
          item_id: string | null
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: 'view_company' | 'view_news' | 'post_review' | 'post_discussion' | 'follow' | 'bookmark' | 'search'
          item_type?: string | null
          item_id?: string | null
          metadata?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: 'view_company' | 'view_news' | 'post_review' | 'post_discussion' | 'follow' | 'bookmark' | 'search'
          item_type?: string | null
          item_id?: string | null
          metadata?: Record<string, any>
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          company_id: string
          vote_type: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'
          score: number
          weight: number
          comment: string | null
          evidence_urls: string[]
          voted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          vote_type: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'
          score: number
          weight?: number
          comment?: string | null
          evidence_urls?: string[]
          voted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          vote_type?: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'
          score?: number
          weight?: number
          comment?: string | null
          evidence_urls?: string[]
          voted_at?: string
          updated_at?: string
        }
      }
      promises: {
        Row: {
          id: string
          company_id: string
          promise_text: string
          category: 'product' | 'ethics' | 'sustainability' | 'privacy' | 'security' | 'other' | null
          promised_date: string
          deadline_date: string | null
          status: 'pending' | 'kept' | 'broken' | 'delayed' | 'cancelled'
          community_verdict: 'kept' | 'broken' | 'partial' | 'unknown' | null
          verdict_votes_count: number
          source_url: string | null
          evidence_url: string | null
          impact_score: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          promise_text: string
          category?: 'product' | 'ethics' | 'sustainability' | 'privacy' | 'security' | 'other' | null
          promised_date: string
          deadline_date?: string | null
          status?: 'pending' | 'kept' | 'broken' | 'delayed' | 'cancelled'
          community_verdict?: 'kept' | 'broken' | 'partial' | 'unknown' | null
          verdict_votes_count?: number
          source_url?: string | null
          evidence_url?: string | null
          impact_score?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          promise_text?: string
          category?: 'product' | 'ethics' | 'sustainability' | 'privacy' | 'security' | 'other' | null
          promised_date?: string
          deadline_date?: string | null
          status?: 'pending' | 'kept' | 'broken' | 'delayed' | 'cancelled'
          community_verdict?: 'kept' | 'broken' | 'partial' | 'unknown' | null
          verdict_votes_count?: number
          source_url?: string | null
          evidence_url?: string | null
          impact_score?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expert_reviews: {
        Row: {
          id: string
          user_id: string
          company_id: string
          review_text: string
          ethics_score: number | null
          credibility_score: number | null
          delivery_score: number | null
          security_score: number | null
          innovation_score: number | null
          verified: boolean
          verified_by: string | null
          verified_at: string | null
          expertise_areas: string[]
          citations: string[]
          weight: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          review_text: string
          ethics_score?: number | null
          credibility_score?: number | null
          delivery_score?: number | null
          security_score?: number | null
          innovation_score?: number | null
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          expertise_areas?: string[]
          citations?: string[]
          weight?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          review_text?: string
          ethics_score?: number | null
          credibility_score?: number | null
          delivery_score?: number | null
          security_score?: number | null
          innovation_score?: number | null
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          expertise_areas?: string[]
          citations?: string[]
          weight?: number
          created_at?: string
          updated_at?: string
        }
      }
      company_scores: {
        Row: {
          id: string
          company_id: string
          overall_score: number
          ethics_score: number
          credibility_score: number
          delivery_score: number
          security_score: number
          innovation_score: number
          confidence_level: 'low' | 'medium' | 'high' | 'very_high'
          total_votes: number
          expert_reviews_count: number
          promises_kept_ratio: number
          calculation_metadata: Record<string, any>
          last_calculated: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          overall_score?: number
          ethics_score?: number
          credibility_score?: number
          delivery_score?: number
          security_score?: number
          innovation_score?: number
          confidence_level?: 'low' | 'medium' | 'high' | 'very_high'
          total_votes?: number
          expert_reviews_count?: number
          promises_kept_ratio?: number
          calculation_metadata?: Record<string, any>
          last_calculated?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          overall_score?: number
          ethics_score?: number
          credibility_score?: number
          delivery_score?: number
          security_score?: number
          innovation_score?: number
          confidence_level?: 'low' | 'medium' | 'high' | 'very_high'
          total_votes?: number
          expert_reviews_count?: number
          promises_kept_ratio?: number
          calculation_metadata?: Record<string, any>
          last_calculated?: string
          created_at?: string
        }
      }
      score_history: {
        Row: {
          id: string
          company_id: string
          score_type: 'overall' | 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'
          score_value: number
          change_amount: number | null
          confidence_level: string | null
          total_votes: number
          recorded_at: string
        }
        Insert: {
          id?: string
          company_id: string
          score_type: 'overall' | 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'
          score_value: number
          change_amount?: number | null
          confidence_level?: string | null
          total_votes?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          score_type?: 'overall' | 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'
          score_value?: number
          change_amount?: number | null
          confidence_level?: string | null
          total_votes?: number
          recorded_at?: string
        }
      }
      promise_votes: {
        Row: {
          id: string
          promise_id: string
          user_id: string
          verdict: 'kept' | 'broken' | 'partial'
          comment: string | null
          voted_at: string
        }
        Insert: {
          id?: string
          promise_id: string
          user_id: string
          verdict: 'kept' | 'broken' | 'partial'
          comment?: string | null
          voted_at?: string
        }
        Update: {
          id?: string
          promise_id?: string
          user_id?: string
          verdict?: 'kept' | 'broken' | 'partial'
          comment?: string | null
          voted_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Supporting types
export interface Product {
  name: string
  description: string
  url: string
}

export interface EthicalPolicy {
  privacy: string
  ai_transparency: string
  carbon_footprint: string
  data_handling: string
}

// Type aliases for easier use
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export type NewsUpdate = Database['public']['Tables']['news_updates']['Row']
export type NewsUpdateInsert = Database['public']['Tables']['news_updates']['Insert']
export type NewsUpdateUpdate = Database['public']['Tables']['news_updates']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type Discussion = Database['public']['Tables']['discussions']['Row']
export type DiscussionInsert = Database['public']['Tables']['discussions']['Insert']
export type DiscussionUpdate = Database['public']['Tables']['discussions']['Update']

export type UserRecommendation = Database['public']['Tables']['user_recommendations']['Row']
export type UserRecommendationInsert = Database['public']['Tables']['user_recommendations']['Insert']
export type UserRecommendationUpdate = Database['public']['Tables']['user_recommendations']['Update']

export type CompanyBadge = Database['public']['Tables']['company_badges']['Row']
export type CompanyBadgeInsert = Database['public']['Tables']['company_badges']['Insert']
export type CompanyBadgeUpdate = Database['public']['Tables']['company_badges']['Update']

export type CompanyMetricsHistory = Database['public']['Tables']['company_metrics_history']['Row']
export type CompanyMetricsHistoryInsert = Database['public']['Tables']['company_metrics_history']['Insert']
export type CompanyMetricsHistoryUpdate = Database['public']['Tables']['company_metrics_history']['Update']

export type CompanyFollow = Database['public']['Tables']['company_follows']['Row']
export type CompanyFollowInsert = Database['public']['Tables']['company_follows']['Insert']
export type CompanyFollowUpdate = Database['public']['Tables']['company_follows']['Update']

export type UserBookmark = Database['public']['Tables']['user_bookmarks']['Row']
export type UserBookmarkInsert = Database['public']['Tables']['user_bookmarks']['Insert']
export type UserBookmarkUpdate = Database['public']['Tables']['user_bookmarks']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type UserActivity = Database['public']['Tables']['user_activity']['Row']
export type UserActivityInsert = Database['public']['Tables']['user_activity']['Insert']
export type UserActivityUpdate = Database['public']['Tables']['user_activity']['Update']

// Scoring system types
export type Vote = Database['public']['Tables']['votes']['Row']
export type VoteInsert = Database['public']['Tables']['votes']['Insert']
export type VoteUpdate = Database['public']['Tables']['votes']['Update']

export type Promise = Database['public']['Tables']['promises']['Row']
export type PromiseInsert = Database['public']['Tables']['promises']['Insert']
export type PromiseUpdate = Database['public']['Tables']['promises']['Update']

export type ExpertReview = Database['public']['Tables']['expert_reviews']['Row']
export type ExpertReviewInsert = Database['public']['Tables']['expert_reviews']['Insert']
export type ExpertReviewUpdate = Database['public']['Tables']['expert_reviews']['Update']

export type CompanyScore = Database['public']['Tables']['company_scores']['Row']
export type CompanyScoreInsert = Database['public']['Tables']['company_scores']['Insert']
export type CompanyScoreUpdate = Database['public']['Tables']['company_scores']['Update']

export type ScoreHistory = Database['public']['Tables']['score_history']['Row']
export type ScoreHistoryInsert = Database['public']['Tables']['score_history']['Insert']
export type ScoreHistoryUpdate = Database['public']['Tables']['score_history']['Update']

export type PromiseVote = Database['public']['Tables']['promise_votes']['Row']
export type PromiseVoteInsert = Database['public']['Tables']['promise_votes']['Insert']
export type PromiseVoteUpdate = Database['public']['Tables']['promise_votes']['Update']

// Badge tier type
export type BadgeTier = 'none' | 'certified' | 'trusted' | 'exemplary' | 'pioneer'

// Vote type
export type VoteType = 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'

// Score confidence level
export type ScoreConfidence = 'low' | 'medium' | 'high' | 'very_high'

// Promise status
export type PromiseStatus = 'pending' | 'kept' | 'broken' | 'delayed' | 'cancelled'

// Promise verdict
export type PromiseVerdict = 'kept' | 'broken' | 'partial' | 'unknown'


















