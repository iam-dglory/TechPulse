// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

const updateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  content: z.string().min(10).max(5000).optional(),
  rating: z.number().min(1).max(5).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  anonymous: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request);
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    const id = params.id;

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, 
        title, 
        content, 
        rating, 
        pros, 
        cons, 
        categories,
        anonymous,
        helpful_count,
        created_at,
        updated_at,
        companies (id, name, slug, logo_url),
        profiles (id, username, avatar_url)
      `)
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Review GET error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'auth');
    if (rateLimit) return rateLimit;

    const body = await request.json();
    const payload = updateSchema.parse(body);
    const id = params.id;

    const supabase = createSupabaseServer();
    
    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if review exists and belongs to user
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, user_id, company_id')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (reviewError) {
      if (reviewError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      throw reviewError;
    }

    // Check ownership or admin status
    const userId = session.user.id;
    const isOwner = review.user_id === userId;
    
    // Check if admin (in a real app, you'd check admin status properly)
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    const isAdmin = profile?.user_type === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to edit this review' }, { status: 403 });
    }

    // Update review
    const updates = {
      ...payload,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If rating changed, update company stats
    if (payload.rating !== undefined) {
      await supabase.rpc('update_company_review_stats', { 
        company_id: review.company_id 
      });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Review PUT error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'auth');
    if (rateLimit) return rateLimit;

    const id = params.id;
    const supabase = createSupabaseServer();
    
    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if review exists and belongs to user
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, user_id, company_id')
      .eq('id', id)
      .eq('deleted_at', null)
      .single();

    if (reviewError) {
      if (reviewError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      throw reviewError;
    }

    // Check ownership or admin status
    const userId = session.user.id;
    const isOwner = review.user_id === userId;
    
    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    const isAdmin = profile?.user_type === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to delete this review' }, { status: 403 });
    }

    // Soft delete the review
    const { data, error } = await supabase
      .from('reviews')
      .update({ 
        deleted_at: new Date().toISOString(),
        deleted_by: userId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update company review stats
    await supabase.rpc('update_company_review_stats', { 
      company_id: review.company_id 
    });

    return NextResponse.json({ 
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err: any) {
    console.error('Review DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}