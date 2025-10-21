/**
 * Supabase Module - Central Export
 *
 * This module provides a centralized export for all Supabase-related
 * functionality in the TexhPulze application.
 */

// Client exports
export {
  supabase,
  testSupabaseConnection,
  getCurrentUser,
  getCurrentSession,
  signOut,
  handleSupabaseError,
  isSupabaseConfigured,
} from './client';

// Type exports
export type { Database } from '../../types/database';

// Re-export Supabase types for convenience
export type {
  User,
  Session,
  AuthError,
  PostgrestError,
} from '@supabase/supabase-js';
