import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';
import { trackEvent } from '@/lib/analytics';

// =====================================================
// ROUTE: ANALYTICS API
// Handles: Get analytics data for companies and platform
// =====================================================

const AnalyticsQuerySchema = z.object({
  entity: z.enum(['company', 'platform']).default('platform'),
  entity_id: z.string().uuid().optional(),
  timeframe: z.enum(['day', 'week', 'month', 'year', 'all']).default('month'),
  metric: z.enum(['views', 'follows', 'reviews', 'scores', 'all']).default('all'),
});

// =====================================================
// GET /api/analytics - Get analytics data
// =====================================================
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitRequest(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;
    
    const supabase = createSupabaseServer();
    const { searchParams } = new URL(request.url);
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = AnalyticsQuerySchema.parse({
      entity: searchParams.get('entity') || 'platform',
      entity_id: searchParams.get('entity_id'),
      timeframe: searchParams.get('timeframe') || 'month',
      metric: searchParams.get('metric') || 'all',
    });

    // If entity is company, entity_id is required
    if (params.entity === 'company' && !params.entity_id) {
      return NextResponse.json(
        { error: 'entity_id is required when entity is company' },
        { status: 400 }
      );
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, subscription_tier')
      .eq('id', session.user.id)
      .single();

    // For company analytics, check if user is owner or admin
    if (params.entity === 'company' && params.entity_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('claimed_by')
        .eq('id', params.entity_id)
        .single();

      const isOwner = company && company.claimed_by === session.user.id;
      const isAdmin = profile && profile.user_type === 'admin';
      
      if (!isOwner && !isAdmin) {
        // Check if user has premium subscription for company insights
        const hasPremium = profile && ['premium', 'enterprise'].includes(profile.subscription_tier || '');
        
        if (!hasPremium) {
          return NextResponse.json(
            { error: 'Premium subscription required for company analytics' },
            { status: 403 }
          );
        }
      }
    }

    // For platform analytics, check if user is admin
    if (params.entity === 'platform' && (!profile || profile.user_type !== 'admin')) {
      return NextResponse.json(
        { error: 'Admin access required for platform analytics' },
        { status: 403 }
      );
    }

    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();
    
    switch (params.timeframe) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    const response: any = {
      success: true,
      data: {},
      metadata: {
        entity: params.entity,
        entity_id: params.entity_id,
        timeframe: params.timeframe,
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    };

    // Fetch analytics based on entity and metrics
    if (params.entity === 'company') {
      // Get company details
      const { data: company } = await supabase
        .from('companies')
        .select('name, slug, logo_url')
        .eq('id', params.entity_id)
        .single();
      
      response.metadata.company = company;

      // Fetch metrics based on requested type
      if (params.metric === 'all' || params.metric === 'views') {
        const { data: viewEvents } = await supabase
          .from('analytics_events')
          .select('created_at')
          .eq('event_type', 'company_view')
          .contains('metadata', { company_id: params.entity_id })
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
        
        response.data.views = {
          total: viewEvents?.length || 0,
          timeline: groupEventsByDate(viewEvents || []),
        };
      }

      if (params.metric === 'all' || params.metric === 'follows') {
        const { data: followEvents } = await supabase
          .from('analytics_events')
          .select('created_at, metadata')
          .in('event_type', ['company_follow', 'company_unfollow'])
          .contains('metadata', { company_id: params.entity_id })
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
        
        const follows = followEvents?.filter(e => e.event_type === 'company_follow') || [];
        const unfollows = followEvents?.filter(e => e.event_type === 'company_unfollow') || [];
        
        response.data.follows = {
          total_follows: follows.length,
          total_unfollows: unfollows.length,
          net_follows: follows.length - unfollows.length,
          timeline: {
            follows: groupEventsByDate(follows),
            unfollows: groupEventsByDate(unfollows),
          },
        };
      }

      if (params.metric === 'all' || params.metric === 'reviews') {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('id, rating, created_at, helpful_count')
          .eq('company_id', params.entity_id)
          .eq('status', 'published')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
        
        const ratings = reviews?.map(r => r.rating) || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0;
        
        response.data.reviews = {
          total: reviews?.length || 0,
          average_rating: avgRating,
          rating_distribution: calculateRatingDistribution(reviews || []),
          timeline: groupReviewsByDate(reviews || []),
        };
      }

      if (params.metric === 'all' || params.metric === 'scores') {
        const { data: scoreHistory } = await supabase
          .from('score_history')
          .select('*')
          .eq('company_id', params.entity_id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
        
        response.data.scores = {
          history: scoreHistory || [],
          timeline: groupScoresByDate(scoreHistory || []),
        };
      }
    } else if (params.entity === 'platform') {
      // Platform-wide analytics for admins
      if (params.metric === 'all' || params.metric === 'views') {
        const { data: viewCounts, error } = await supabase
          .rpc('get_platform_view_counts', { 
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          });
        
        response.data.views = viewCounts || {
          total_views: 0,
          company_views: 0,
          news_views: 0,
          review_views: 0,
        };
      }

      if (params.metric === 'all' || params.metric === 'users') {
        const { data: userStats, error } = await supabase
          .rpc('get_user_growth_stats', { 
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          });
        
        response.data.users = userStats || {
          total_users: 0,
          new_users: 0,
          active_users: 0,
        };
      }

      if (params.metric === 'all' || params.metric === 'content') {
        const { data: contentStats, error } = await supabase
          .rpc('get_content_growth_stats', { 
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          });
        
        response.data.content = contentStats || {
          total_companies: 0,
          new_companies: 0,
          total_reviews: 0,
          new_reviews: 0,
          total_news: 0,
          new_news: 0,
        };
      }
    }

    // Track analytics view event
    supabase
      .from('analytics_events')
      .insert([{
        event_type: 'analytics_view',
        user_id: session.user.id,
        metadata: { 
          entity: params.entity,
          entity_id: params.entity_id,
          timeframe: params.timeframe,
          metric: params.metric
        },
      }])
      .then();

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for data processing
function groupEventsByDate(events: any[]) {
  const grouped: Record<string, number> = {};
  
  events.forEach(event => {
    const date = event.created_at.split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });
  
  return grouped;
}

function groupReviewsByDate(reviews: any[]) {
  const grouped: Record<string, { count: number, avg_rating: number }> = {};
  
  reviews.forEach(review => {
    const date = review.created_at.split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { count: 0, avg_rating: 0, sum: 0 };
    }
    
    grouped[date].count += 1;
    grouped[date].sum = (grouped[date].sum || 0) + review.rating;
    grouped[date].avg_rating = grouped[date].sum / grouped[date].count;
  });
  
  // Remove the sum property used for calculations
  Object.values(grouped).forEach(value => {
    delete (value as any).sum;
  });
  
  return grouped;
}

function calculateRatingDistribution(reviews: any[]) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    const rating = Math.round(review.rating);
    if (rating >= 1 && rating <= 5) {
      distribution[rating as keyof typeof distribution] += 1;
    }
  });
  
  return distribution;
}

function groupScoresByDate(scores: any[]) {
  const grouped: Record<string, { overall_score: number, ethics_score: number, transparency_score: number }> = {};
  
  scores.forEach(score => {
    const date = score.created_at.split('T')[0];
    grouped[date] = {
      overall_score: score.overall_score,
      ethics_score: score.ethics_score,
      transparency_score: score.transparency_score,
    };
  });
  
  return grouped;
}