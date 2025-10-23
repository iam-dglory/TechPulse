// app/api/companies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer } from '../../../lib/supabase/server';
import { rateLimit, lim } from '../../../lib/rateLimiter';

const listSchema = z.object({
  q: z.string().optional(),
  industry: z.string().optional(),
  sort: z.enum(['trending', 'score', 'growth', 'reviews', 'recent']).optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  minScore: z.coerce.number().optional(),
  maxScore: z.coerce.number().optional(),
});

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional(),
  logo_url: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Rate limit keyed by IP
    const ip = request.headers.get('x-forwarded-for') ?? request.ip ?? 'anon';
    const rl = await rateLimit(ip);
    if (!rl.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const url = new URL(request.url);
    const parsed = listSchema.parse(Object.fromEntries(url.searchParams.entries()));

    const supabase = createSupabaseServer();

    // Build query
    let query = supabase.from('companies').select('id, name, slug, logo_url, overall_score, verification_tier, growth_rate').range((parsed.page - 1) * parsed.limit, parsed.page * parsed.limit - 1);

    if (parsed.q) {
      // Full text search if you implemented tsvector; fallback to ilike
      query = query.ilike('name', `%${parsed.q}%`);
    }
    if (parsed.industry) query = query.eq('industry', parsed.industry);

    // Sorting
    if (parsed.sort === 'trending') query = query.order('trending_score', { ascending: false });
    else if (parsed.sort === 'score') query = query.order('overall_score', { ascending: false });
    else if (parsed.sort === 'growth') query = query.order('growth_rate', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // count (lightweight approach)
    const { count } = await supabase.from('companies').select('id', { count: 'exact', head: true });

    return NextResponse.json({ data, count: count ?? null, page: parsed.page });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = createSchema.parse(body);

    const supabase = createSupabaseServer();
    // Auth check - only admin allowed
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Replace this with your own role check: e.g., check a custom claim or 'profiles' table
    const { data: profile } = await supabase.from('profiles').select('id, user_type').eq('id', session.user.id).single();
    const isAdmin = (profile as any)?.user_type === 'admin' || (session.user?.email?.endsWith('@youradmin.com'));
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const init = {
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      industry: payload.industry ?? null,
      website: payload.website ?? null,
      logo_url: payload.logo_url ?? null,
      overall_score: 0,
      privacy_score: 0,
      transparency_score: 0,
      labor_score: 0,
      environment_score: 0,
      community_score: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('companies').insert(init).select().single();
    if (error) throw error;

    // Optionally insert score_history row (trigger could do this)
    await supabase.from('score_history').insert({
      company_id: data.id,
      overall_score: 0,
      recorded_at: new Date().toISOString(),
      reason: 'initial',
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    if (err?.issues) {
      // Zod validation error
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
