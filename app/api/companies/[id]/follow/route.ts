// app/api/companies/[id]/follow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'auth');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const companyId = params.id;
    const userId = session.user.id;

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (existingFollow) {
      // Unfollow - delete the record
      const { error: deleteError } = await supabase
        .from('user_follows')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (deleteError) throw deleteError;

      // Decrement follower count
      await supabase.rpc('decrement_follower_count', { company_id: companyId });

      return NextResponse.json({ 
        followed: false, 
        message: 'Successfully unfollowed company' 
      });
    } else {
      // Follow - create new record
      const { error: insertError } = await supabase
        .from('user_follows')
        .insert({
          user_id: userId,
          company_id: companyId,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Increment follower count
      await supabase.rpc('increment_follower_count', { company_id: companyId });

      // Track analytics event
      await supabase.from('analytics_events').insert({
        event_type: 'company_follow',
        user_id: userId,
        company_id: companyId,
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        followed: true, 
        message: 'Successfully followed company' 
      });
    }
  } catch (err: any) {
    console.error('Follow error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// GET endpoint to check follow status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request);
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const companyId = params.id;
    const userId = session.user.id;

    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    return NextResponse.json({ 
      followed: !!data 
    });
  } catch (err: any) {
    console.error('Follow status error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}