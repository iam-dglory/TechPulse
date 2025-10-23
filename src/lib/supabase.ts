/**
 * Supabase Client Utilities
 *
 * Provides Supabase client instance for browser/client-side usage
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

/**
 * Browser/Client-side Supabase client
 * Use this in client components for all Supabase operations
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null as any; // Fallback for missing credentials
