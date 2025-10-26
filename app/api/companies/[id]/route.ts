// app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logo_url: z.string().url().optional(),
  cover_url: z.string().url().optional(),
  industry: z.string().optional(),
  hq_location: z.string().optional(),
  employee_count: z.number().int().positive().optional(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  funding_stage: z.enum(['bootstrapped', 'seed', 'series_a', 'series_b', 'series_c', 'public', 'acquired', 'other']).optional(),
  privacy_policy_url: z.string().url().optional(),
  terms_url: z.string().url().optional(),
  transparency_report_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  source_repos: z.array(z.string().url()).optional(),
  verification_tier: z.enum(['certified','trusted','exemplary','pioneer']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request);
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    const id = params.id;
    
    // Check if user is authenticated for additional data
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.user;
    
    // Track view
    await trackCompanyView(id, supabase, session?.user?.id);
    
    // Get company data
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) throw error;
    if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Get latest reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id, title, rating, summary, created_at, user_id')
      .eq('company_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(5);
      
    // Get latest news
    const { data: news } = await supabase
      .from('news')
      .select('id, title, summary, url, published_at')
      .eq('company_id', id)
      .order('published_at', { ascending: false })
      .limit(3);
      
    // Check if user owns this company
    let isOwner = false;
    let isPremium = false;
    
    if (isAuthenticated) {
      isOwner = company.claimed_by === session.user.id;
      
      // Check if user has premium subscription
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', session.user.id)
        .single();
        
      isPremium = profile?.subscription_tier === 'premium';
    }
    
    return NextResponse.json({ 
      data: company,
      reviews,
      news,
      user_relationship: {
        is_owner: isOwner,
        is_premium: isPremium
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// Helper function to track company views
async function trackCompanyView(companyId: string, supabase: any, userId?: string) {
  try {
    // Increment view count
    await supabase.rpc('increment_view_count', { company_id: companyId });
    
    // Track analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'company_view',
      company_id: companyId,
      user_id: userId || null,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    // Don't throw - we don't want to fail the main request if tracking fails
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const payload = updateSchema.parse(body);

    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Owner or admin check - simplistic example:
    const id = params.id;
    const { data: existing } = await supabase.from('companies').select('claimed_by').eq('id', id).single();
    const isOwner = existing?.claimed_by === session.user.id;
    // Replace with robust admin check
    const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', session.user.id).single();
    const isAdmin = (profile as any)?.user_type === 'admin';

    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updates = { ...payload, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Soft delete
    const id = params.id;
    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', session.user.id).single();
    const isAdmin = (profile as any)?.user_type === 'admin';
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase.from('companies').update({ deleted_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ data, message: 'Soft deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
