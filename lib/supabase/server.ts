// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type Database } from '../../types/database';

/**
 * Creates a Supabase client for use in server components
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables
 */
export function createSupabaseServer() {
  return createServerComponentClient<Database>({ cookies });
}

/**
 * Creates a Supabase admin client with service role permissions
 * Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 * WARNING: This has admin privileges and should only be used in trusted server contexts
 */
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin credentials');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

/**
 * Creates a Supabase client for use in API routes
 * @param cookieStore - Cookie store from the request
 */
export function createSupabaseServerClient(cookieStore: any) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}
