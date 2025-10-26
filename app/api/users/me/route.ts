// app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'auth');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile with related data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        username, 
        full_name, 
        bio, 
        avatar_url, 
        website, 
        location, 
        user_type,
        social_links,
        preferences,
        created_at
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Get user's companies (if any)
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, slug, logo_url')
      .eq('claimed_by', userId);

    // Get user's review count
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('deleted_at', null);

    // Get user's followed companies
    const { data: following } = await supabase
      .from('user_follows')
      .select('companies(id, name, slug, logo_url)')
      .eq('user_id', userId);

    return NextResponse.json({
      data: {
        ...profile,
        companies: companies || [],
        review_count: reviewCount || 0,
        following: following?.map(f => f.companies) || []
      }
    });
  } catch (err: any) {
    console.error('User profile error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}