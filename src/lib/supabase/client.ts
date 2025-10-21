/**
 * Supabase Client Configuration for TexhPulze (Vite + React)
 *
 * This module provides Supabase client instances with proper error handling
 * and environment variable validation for a Vite React application.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

// Environment variable validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validates required environment variables
 * @throws Error if required variables are missing
 */
function validateEnvVariables(): void {
  if (!SUPABASE_URL) {
    throw new Error(
      'Missing VITE_SUPABASE_URL environment variable. ' +
      'Please add it to your .env file.'
    );
  }

  if (!SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
      'Please add it to your .env file.'
    );
  }

  // Validate URL format
  try {
    new URL(SUPABASE_URL);
  } catch {
    throw new Error(
      'Invalid VITE_SUPABASE_URL format. ' +
      'Please ensure it is a valid URL (e.g., https://xxx.supabase.co)'
    );
  }
}

// Validate on module load
validateEnvVariables();

/**
 * Supabase client for client-side operations
 *
 * Features:
 * - Auto-refresh tokens
 * - Persist session in localStorage
 * - Automatic retry on network errors
 *
 * Use this for:
 * - Authentication
 * - Real-time subscriptions
 * - Client-side queries
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'texhpulze-auth-token',
    },
    global: {
      headers: {
        'X-Client-Info': 'texhpulze-web',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Test Supabase connection
 *
 * @returns Promise<{success: boolean, message: string, data?: any}>
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    // Test 1: Basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();

    if (healthError && healthError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is OK for health check
      return {
        success: false,
        message: `Connection test failed: ${healthError.message}`,
      };
    }

    // Test 2: Auth status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return {
      success: true,
      message: 'Supabase connection successful',
      data: {
        connected: true,
        authenticated: !!session,
        url: SUPABASE_URL,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get current authenticated user
 *
 * @returns Promise with user data or null
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Exception getting current user:', error);
    return null;
  }
}

/**
 * Get current session
 *
 * @returns Promise with session data or null
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Exception getting session:', error);
    return null;
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (error) {
    console.error('Exception signing out:', error);
    throw error;
  }
}

/**
 * Error handler for Supabase operations
 *
 * @param error - The error from Supabase
 * @param context - Context where the error occurred
 * @returns Formatted error message
 */
export function handleSupabaseError(error: any, context: string = 'Operation'): string {
  console.error(`${context} error:`, error);

  if (error?.message) {
    return error.message;
  }

  if (error?.error_description) {
    return error.error_description;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if Supabase is properly configured
 *
 * @returns boolean indicating if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// Export the client as default
export default supabase;
