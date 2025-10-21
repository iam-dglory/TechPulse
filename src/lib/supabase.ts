/**
 * Supabase Client Utilities
 *
 * Provides Supabase client instances for different contexts:
 * - Browser client (client-side)
 * - Server client (server-side API routes)
 * - Server client with cookies (for auth operations)
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Browser/Client-side Supabase client
 * Use this in client components and API routes that don't need auth
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client with cookie handling
 * Use this for authentication operations in API routes
 *
 * @returns Supabase client configured for server-side auth
 */
export function createServerClient() {
  const cookieStore = cookies();

  return createSupabaseServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting might fail in middleware
            // This is acceptable as the auth state will be refreshed on the next request
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Cookie removal might fail in middleware
          }
        },
      },
    }
  );
}
