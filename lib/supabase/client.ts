// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '../../types/database';

/**
 * Creates a Supabase client for use in client components
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables
 */
export function createSupabaseClient() {
  return createClientComponentClient<Database>();
}

/**
 * Creates a Supabase client with custom options
 * Useful for specific configurations or when using in non-component contexts
 */
export function createSupabaseClientWithOptions(options?: any) {
  return createClientComponentClient<Database>(options);
}

/**
 * Helper function to check if the current user is authenticated
 * @param supabase - Supabase client instance
 * @returns Promise<boolean> - Whether the user is authenticated
 */
export async function isAuthenticated(supabase = createSupabaseClient()) {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/**
 * Helper function to get the current user
 * @param supabase - Supabase client instance
 * @returns Promise<User | null> - The current user or null if not authenticated
 */
export async function getCurrentUser(supabase = createSupabaseClient()) {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}