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
