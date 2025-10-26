// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';
import { trackEvent } from '@/lib/analytics';

const listSchema = z.object({
  company_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'all']).optional().default('approved'),
  sort: z.enum(['recent', 'helpful', 'highest', 'lowest']).optional().default('recent'),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
});

const createSchema = z.object({
  company_id: z.string().uuid(),
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(5000),
  rating: z.number().min(1).max(5),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  anonymous: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'reviews');
    if (rateLimit) return rateLimit;

    const supabase = createSupabaseServer();
    
    // Check authentication (optional)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Check if user is admin
    let isAdmin = false;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();
        
      isAdmin = profile?.user_type === 'admin';
    }

    // Parse query parameters
    const url = new URL(request.url);
    const parsed = listSchema.parse(Object.fromEntries(url.searchParams.entries()));

    // Build query
    let query = supabase
      .from('reviews')
      .select(`
        id, 
        title, 
        content, 
        rating, 
        pros, 
        cons, 
        helpful_count,
        status,
        created_at,
        companies (id, name, slug, logo_url),
        profiles (id, username, avatar_url)
      `)
      .range((parsed.page - 1) * parsed.limit, parsed.page * parsed.limit - 1);

    // Apply filters
    if (parsed.company_id) {
      query = query.eq('company_id', parsed.company_id);
    }
    
    if (parsed.user_id) {
      query = query.eq('user_id', parsed.user_id);
    }
    
    // Apply status filter based on user role
    if (isAdmin || (userId && parsed.user_id === userId)) {
      // Admins and users viewing their own reviews can see all statuses
      if (parsed.status !== 'all') {
        query = query.eq('status', parsed.status);
      }
    } else {
      // Non-admins can only see approved reviews
      query = query.eq('status', 'approved');
    }
    
    // Apply soft delete filter
    query = query.eq('deleted_at', null);

    // Sorting
    if (parsed.sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (parsed.sort === 'helpful') {
      query = query.order('helpful_count', { ascending: false });
    } else if (parsed.sort === 'highest') {
      query = query.order('rating', { ascending: false });
    } else if (parsed.sort === 'lowest') {
      query = query.order('rating', { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get total count
    let countQuery = supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('deleted_at', null);
      
    if (parsed.company_id) {
      countQuery = countQuery.eq('company_id', parsed.company_id);
    }
    
    if (parsed.user_id) {
      countQuery = countQuery.eq('user_id', parsed.user_id);
    }
    
    // Apply status filter for count
    if (isAdmin || (userId && parsed.user_id === userId)) {
      if (parsed.status !== 'all') {
        countQuery = countQuery.eq('status', parsed.status);
      }
    } else {
      countQuery = countQuery.eq('status', 'approved');
    }
    
    const { count } = await countQuery;

    // Process reviews to handle anonymous reviews
    const processedReviews = data?.map(review => {
      if (review.anonymous && !isAdmin && (!userId || review.user_id !== userId)) {
        return {
          ...review,
          user_id: null,
          profiles: null
        };
      }
      return review;
    });

    return NextResponse.json({
      data: processedReviews,
      count: count ?? 0,
      page: parsed.page,
      total_pages: count ? Math.ceil(count / parsed.limit) : 1,
    });
  } catch (err: any) {
    console.error('Reviews GET error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = await rateLimitRequest(request, 'reviews');
    if (rateLimit) return rateLimit;

    const body = await request.json();
    const payload = createSchema.parse(body);

    const supabase = createSupabaseServer();
    
    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', payload.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if user already reviewed this company
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('company_id', payload.company_id)
      .eq('user_id', userId)
      .eq('deleted_at', null)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json({ 
        error: 'You have already reviewed this company',
        review_id: existingReview.id
      }, { status: 400 });
    }

    // Create review
    const now = new Date().toISOString();
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        company_id: payload.company_id,
        user_id: userId,
        title: payload.title,
        content: payload.content,
        rating: payload.rating,
        pros: payload.pros || [],
        cons: payload.cons || [],
        categories: payload.categories || [],
        anonymous: payload.anonymous || false,
        status: 'approved', // Auto-approve for now, can be changed to 'pending' if moderation is needed
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update company rating
    await updateCompanyRating(payload.company_id);

    // Trigger AI scoring via Edge Function
    const supabaseAdmin = createSupabaseAdmin();
    await supabaseAdmin.functions.invoke('ai_score', {
      body: { companyId: payload.company_id }
    });

    // Track analytics event
    await trackEvent({
      event: 'review_created',
      userId: userId,
      properties: {
        company_id: payload.company_id,
        review_id: review.id,
        rating: payload.rating
      }
    });

    // Create notification for company owner if claimed
    const { data: companyDetails } = await supabase
      .from('companies')
      .select('claimed_by, name')
      .eq('id', payload.company_id)
      .single();

    if (companyDetails?.claimed_by) {
      await supabase.from('notifications').insert({
        user_id: companyDetails.claimed_by,
        type: 'new_review',
        title: 'New Review',
        message: `Your company ${companyDetails.name} has received a new ${payload.rating}-star review`,
        entity_type: 'review',
        entity_id: review.id,
        created_at: now
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (err: any) {
    console.error('Review creation error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

// Helper function to update company rating
async function updateCompanyRating(companyId: string) {
  const supabase = createSupabaseServer();
  
  // Get average rating from approved reviews
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('company_id', companyId)
    .eq('status', 'approved')
    .eq('deleted_at', null);
    
  if (error || !data || data.length === 0) return;
  
  // Calculate average rating
  const sum = data.reduce((acc, review) => acc + review.rating, 0);
  const avgRating = sum / data.length;
  
  // Update company record
  await supabase
    .from('companies')
    .update({
      avg_rating: avgRating,
      review_count: data.length,
      updated_at: new Date().toISOString()
    })
    .eq('id', companyId);
}

    if (existingReview) {
      return NextResponse.json({ 
        error: 'You have already reviewed this company. Please edit your existing review instead.' 
      }, { status: 409 });
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        company_id: payload.company_id,
        user_id: userId,
        title: payload.title,
        content: payload.content,
        rating: payload.rating,
        pros: payload.pros || [],
        cons: payload.cons || [],
        categories: payload.categories || [],
        anonymous: payload.anonymous || false,
        helpful_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reviewError) throw reviewError;

    // Update company review stats
    await supabase.rpc('update_company_review_stats', { 
      company_id: payload.company_id 
    });

    // Track analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'review_created',
      user_id: userId,
      company_id: payload.company_id,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      data: review
    }, { status: 201 });
  } catch (err: any) {
    console.error('Reviews POST error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}