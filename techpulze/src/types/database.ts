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
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role: string
          interests?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          interests?: string[]
          created_at?: string
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


















