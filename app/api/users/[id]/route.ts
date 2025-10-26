// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request);
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    const userId = params.id;

    // Get public user profile
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
        created_at
      `)
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw error;
    }

    // Get user's review count
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('deleted_at', null)
      .eq('anonymous', false);

    // Get user's public reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        id,
        title,
        rating,
        created_at,
        companies (id, name, slug, logo_url)
      `)
      .eq('user_id', userId)
      .eq('deleted_at', null)
      .eq('anonymous', false)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      data: {
        ...profile,
        review_count: reviewCount || 0,
        recent_reviews: reviews || []
      }
    });
  } catch (err: any) {
    console.error('User profile error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}