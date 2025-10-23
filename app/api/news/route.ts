import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// =====================================================
// ROUTE: NEWS API
// Handles: List news (GET), Create news (POST)
// =====================================================

const ListNewsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  category: z.enum(['all', 'ai', 'privacy', 'labor', 'environment', 'corporate']).optional(),
  time_filter: z.enum(['week', 'month', 'all']).optional().default('all'),
  sort: z.enum(['latest', 'discussed', 'impact']).optional().default('latest'),
  company_id: z.string().uuid().optional(),
});

const CreateNewsSchema = z.object({
  title: z.string().min(10).max(500),
  slug: z.string().min(5).max(300).regex(/^[a-z0-9-]+$/),
  summary: z.string().min(20).max(1000).optional(),
  content: z.string().min(100),
  thumbnail_url: z.string().url().optional(),
  source_url: z.string().url(),
  source_name: z.string().min(2).max(200),
  author: z.string().max(200).optional(),
  company_ids: z.array(z.string().uuid()).optional(),
  ethics_impact: z.enum(['very_positive', 'positive', 'neutral', 'negative', 'very_negative']).default('neutral'),
  ethics_impact_score: z.number().min(-5).max(5).default(0),
  hype_score: z.number().min(0).max(10).default(5),
  credibility_score: z.number().min(0).max(10).default(7),
  bias_level: z.enum(['low', 'medium', 'high']).default('medium'),
  fact_checked: z.boolean().default(false),
});

// =====================================================
// GET /api/news - List news articles with filters
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    const params = ListNewsSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      category: searchParams.get('category'),
      time_filter: searchParams.get('time_filter'),
      sort: searchParams.get('sort'),
      company_id: searchParams.get('company_id'),
    });

    const page = parseInt(params.page);
    const limit = Math.min(parseInt(params.limit), 100);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('news_articles')
      .select('*', { count: 'exact' });

    // Time filter
    if (params.time_filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('published_at', weekAgo.toISOString());
    } else if (params.time_filter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('published_at', monthAgo.toISOString());
    }

    // Company filter
    if (params.company_id) {
      query = query.contains('company_ids', [params.company_id]);
    }

    // Sorting
    switch (params.sort) {
      case 'latest':
        query = query.order('published_at', { ascending: false });
        break;
      case 'discussed':
        query = query.order('discussion_count', { ascending: false });
        break;
      case 'impact':
        query = query.order('ethics_impact_score', { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('News fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch news articles', details: error.message },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: {
        articles: articles || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/news - Create news article (Admin/Journalist)
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add admin/journalist role check
    // For now, allow authenticated users

    const body = await request.json();
    const validatedData = CreateNewsSchema.parse(body);

    // Check if slug already exists
    const { data: existingArticle } = await supabase
      .from('news_articles')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existingArticle) {
      return NextResponse.json(
        { error: 'Article with this slug already exists' },
        { status: 409 }
      );
    }

    // Create article
    const { data: article, error: insertError } = await supabase
      .from('news_articles')
      .insert([{
        ...validatedData,
        published_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Article creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create article', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article created successfully',
      data: { article },
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Article creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
