/**
 * Database Types for TexhPulze
 * Auto-generated types from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // News table
      news: {
        Row: {
          id: string
          title: string
          content: string
          company_id: string | null
          ethics_impact: number | null
          source_url: string
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          company_id?: string | null
          ethics_impact?: number | null
          source_url: string
          published_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          company_id?: string | null
          ethics_impact?: number | null
          source_url?: string
          published_at?: string
          created_at?: string
          updated_at?: string
        }
      }

      // Companies table
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          industry: string
          website: string | null
          description: string
          founded_year: number
          headquarters: string
          employee_count: number | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          industry: string
          website?: string | null
          description: string
          founded_year: number
          headquarters: string
          employee_count?: number | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          industry?: string
          website?: string | null
          description?: string
          founded_year?: number
          headquarters?: string
          employee_count?: number | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Articles table
      articles: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          url: string
          image_url: string | null
          source: string
          category: string
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          url: string
          image_url?: string | null
          source: string
          category: string
          published_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          url?: string
          image_url?: string | null
          source?: string
          category?: string
          published_at?: string
          created_at?: string
          updated_at?: string
        }
      }

      // Users/Profiles table
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'citizen' | 'researcher' | 'policymaker' | 'government' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'citizen' | 'researcher' | 'policymaker' | 'government' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'citizen' | 'researcher' | 'policymaker' | 'government' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }

      // Company Scores table
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
          growth_rate: number | null
          verification_tier: 'unverified' | 'basic' | 'verified' | 'premium'
          updated_at: string
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
          growth_rate?: number | null
          verification_tier?: 'unverified' | 'basic' | 'verified' | 'premium'
          updated_at?: string
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
          growth_rate?: number | null
          verification_tier?: 'unverified' | 'basic' | 'verified' | 'premium'
          updated_at?: string
        }
      }

      // Promises table
      promises: {
        Row: {
          id: string
          company_id: string
          promise_text: string
          category: 'product' | 'ethics' | 'sustainability' | 'privacy' | 'security'
          promised_date: string
          deadline_date: string
          source_url: string
          impact_level: number
          status: 'pending' | 'in-progress' | 'kept' | 'broken' | 'delayed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          promise_text: string
          category: 'product' | 'ethics' | 'sustainability' | 'privacy' | 'security'
          promised_date: string
          deadline_date: string
          source_url: string
          impact_level: number
          status?: 'pending' | 'in-progress' | 'kept' | 'broken' | 'delayed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          promise_text?: string
          category?: 'product' | 'ethics' | 'sustainability' | 'privacy' | 'security'
          promised_date?: string
          deadline_date?: string
          source_url?: string
          impact_level?: number
          status?: 'pending' | 'in-progress' | 'kept' | 'broken' | 'delayed'
          created_at?: string
          updated_at?: string
        }
      }

      // Votes table
      votes: {
        Row: {
          id: string
          user_id: string
          company_id: string
          vote_type: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'
          score: number
          comment: string | null
          evidence_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          vote_type: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'
          score: number
          comment?: string | null
          evidence_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          vote_type?: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation'
          score?: number
          comment?: string | null
          evidence_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Grievances table
      grievances: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          risk_level: 'low' | 'medium' | 'high' | 'critical'
          status: 'pending' | 'reviewing' | 'resolved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: string
          risk_level?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'reviewing' | 'resolved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          risk_level?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'reviewing' | 'resolved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }

      // Discussions table
      discussions: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          upvotes: number
          downvotes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
      }

      // Favorites table
      favorites: {
        Row: {
          id: string
          user_id: string
          article_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          article_id?: string
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
      user_role: 'citizen' | 'researcher' | 'policymaker' | 'government' | 'admin'
      risk_level: 'low' | 'medium' | 'high' | 'critical'
      grievance_status: 'pending' | 'reviewing' | 'resolved' | 'rejected'
    }
  }
}
