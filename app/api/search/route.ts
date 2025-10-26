import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';
import { trackEvent } from '@/lib/analytics';

// =====================================================
// ROUTE: SEARCH API
// Handles: Global search across multiple entities
// =====================================================

const SearchSchema = z.object({
  query: z.string().min(2).max(100),
  type: z.enum(['all', 'companies', 'news', 'reviews']).optional().default('all'),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  industry: z.string().optional(),
  min_score: z.coerce.number().optional(),
  max_score: z.coerce.number().optional(),
  verified: z.enum(['true', 'false']).optional(),
  sort: z.enum(['relevance', 'score', 'recent']).optional().default('relevance'),
});

// =====================================================
// GET /api/search - Search across multiple entities
// =====================================================
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitRequest(request, 'search');
    if (rateLimitResponse) return rateLimitResponse;
    
    const supabase = createSupabaseServer();
    const { searchParams } = new URL(request.url);

    // Parse and validate search parameters
    const params = SearchSchema.parse(Object.fromEntries(searchParams.entries()));

    const page = params.page;
    const limit = Math.min(params.limit, 50);
    const offset = (page - 1) * limit;
    const searchQuery = params.query.trim();

    // Check authentication (optional)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Prepare response object
    const response: any = {
      success: true,
      data: {},
      pagination: {
        page,
        limit,
        total: 0,
        total_pages: 0,
      },
    };

    // Search companies
    if (params.type === 'all' || params.type === 'companies') {
      let companyQuery = supabase
        .from('companies')
        .select('id, name, slug, logo_url, description, industry, overall_score, avg_rating, review_count, verification_tier, claimed_by', { count: 'exact' })
        .or(`name.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%, industry.ilike.%${searchQuery}%`)
        .eq('deleted_at', null);
        
      // Apply filters
      if (params.industry) {
        companyQuery = companyQuery.eq('industry', params.industry);
      }
      
      if (params.min_score !== undefined) {
        companyQuery = companyQuery.gte('overall_score', params.min_score);
      }
      
      if (params.max_score !== undefined) {
        companyQuery = companyQuery.lte('overall_score', params.max_score);
      }
      
      if (params.verified === 'true') {
        companyQuery = companyQuery.not('verification_tier', 'is', null);
      }
      
      // Apply sorting
      if (params.sort === 'score') {
        companyQuery = companyQuery.order('overall_score', { ascending: false });
      } else if (params.sort === 'recent') {
        companyQuery = companyQuery.order('updated_at', { ascending: false });
      } else {
        // Default relevance sorting handled by text search
        companyQuery = companyQuery.order('overall_score', { ascending: false });
      }
      
      // Apply pagination
      companyQuery = companyQuery.range(
        params.type === 'companies' ? offset : 0, 
        params.type === 'companies' ? offset + limit - 1 : 9
      );

      const { data: companies, count: companiesCount, error: companiesError } = await companyQuery;

      if (!companiesError) {
        // Process companies to add is_claimed flag
        const processedCompanies = companies?.map(company => ({
          ...company,
          is_claimed: !!company.claimed_by,
          claimed_by: undefined // Remove claimed_by from response
        }));
        
        response.data.companies = processedCompanies || [];
        if (params.type === 'companies') {
          response.pagination.total = companiesCount || 0;
          response.pagination.total_pages = Math.ceil((companiesCount || 0) / limit);
        }
      }
    }

    // Search news
    if (params.type === 'all' || params.type === 'news') {
      const { data: news, count: newsCount, error: newsError } = await supabase
        .from('news_articles')
        .select('id, title, slug, summary, thumbnail_url, published_at, ethics_impact, ethics_impact_score, company_id', { count: 'exact' })
        .or(`title.ilike.%${searchQuery}%, summary.ilike.%${searchQuery}%, content.ilike.%${searchQuery}%`)
        .eq('deleted_at', null)
        .order('published_at', { ascending: false })
        .range(params.type === 'news' ? offset : 0, params.type === 'news' ? offset + limit - 1 : 9);

      if (!newsError) {
        response.data.news = news || [];
        if (params.type === 'news') {
          response.pagination.total = newsCount || 0;
          response.pagination.total_pages = Math.ceil((newsCount || 0) / limit);
        }
      }
    }

    // Search reviews
    if (params.type === 'all' || params.type === 'reviews') {
      const { data: reviews, count: reviewsCount, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id, title, content, rating, created_at,
          companies:company_id(id, name, slug, logo_url),
          profiles:user_id(id, username, avatar_url)
        `, { count: 'exact' })
        .or(`title.ilike.%${searchQuery}%, content.ilike.%${searchQuery}%`)
        .eq('status', 'approved')
        .eq('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(params.type === 'reviews' ? offset : 0, params.type === 'reviews' ? offset + limit - 1 : 9);

      if (!reviewsError) {
        // Process reviews to handle anonymous reviews
        const processedReviews = reviews?.map(review => {
          if (review.anonymous && (!userId || review.user_id !== userId)) {
            return {
              ...review,
              user_id: null,
              profiles: null
            };
          }
          return review;
        });
        
        response.data.reviews = processedReviews || [];
        if (params.type === 'reviews') {
          response.pagination.total = reviewsCount || 0;
          response.pagination.total_pages = Math.ceil((reviewsCount || 0) / limit);
        }
      }
    }

    // Track search event
    if (userId) {
      await trackEvent({
        event: 'search',
        userId,
        properties: {
          query: searchQuery,
          type: params.type,
          filters: {
            industry: params.industry,
            min_score: params.min_score,
            max_score: params.max_score,
            verified: params.verified,
            sort: params.sort
          }
        }
      });
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Search error:', err);
    if (err?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
        .order('created_at', { ascending: false })
        .range(params.type === 'reviews' ? offset : 0, params.type === 'reviews' ? offset + limit - 1 : 9);

      if (!reviewsError) {
        response.data.reviews = reviews || [];
        if (params.type === 'reviews') {
          response.pagination.total = reviewsCount || 0;
          response.pagination.total_pages = Math.ceil((reviewsCount || 0) / limit);
        }
      }
    }

    // Calculate total results for 'all' type
    if (params.type === 'all') {
      const totalResults = 
        (response.data.companies?.length || 0) + 
        (response.data.news?.length || 0) + 
        (response.data.reviews?.length || 0);
      
      response.pagination.total = totalResults;
      response.pagination.total_pages = 1; // For 'all' type, we just show a preview of each category
    }

    // Track search analytics
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      supabase
        .from('analytics_events')
        .insert([{
          event_type: 'search',
          user_id: session.user.id,
          metadata: { 
            query: searchQuery,
            type: params.type,
            results_count: response.pagination.total
          },
        }])
        .then();
    }

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}