// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase'; // optional — add types if you have them

export function createSupabaseServer() {
  // createServerComponentClient automatically reads NEXT_PUBLIC_SUPABASE_* environment vars
  return createServerComponentClient<Database>({ cookies });
}
