// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

const listSchema = z.object({
  q: z.string().optional(),
  role: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
});

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  full_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
  website: z.string().url().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  social_links: z.record(z.string().url()).optional(),
  preferences: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'admin');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Auth check - only admin allowed
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
    
    const isAdmin = profile?.user_type === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(request.url);
    const parsed = listSchema.parse(Object.fromEntries(url.searchParams.entries()));

    // Build query
    let query = supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, user_type, created_at')
      .range((parsed.page - 1) * parsed.limit, parsed.page * parsed.limit - 1);

    if (parsed.q) {
      query = query.or(`username.ilike.%${parsed.q}%,full_name.ilike.%${parsed.q}%`);
    }

    if (parsed.role) {
      query = query.eq('user_type', parsed.role);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get total count
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .conditionalFilter('user_type', parsed.role)
      .conditionalFilter('or', parsed.q ? `username.ilike.%${parsed.q}%,full_name.ilike.%${parsed.q}%` : null);

    return NextResponse.json({
      data,
      count: count ?? 0,
      page: parsed.page,
      limit: parsed.limit,
    });
  } catch (err: any) {
    console.error('Users GET error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'auth');
    if (rateLimit) return rateLimit;

    const body = await request.json();
    const payload = updateProfileSchema.parse(body);

    const supabase = createSupabaseServer();
    
    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Users PATCH error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}