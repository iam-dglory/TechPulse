import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// =====================================================
// ROUTE 1: COMPANIES API
// Handles: List companies (GET), Create company (POST)
// =====================================================

// Input validation schemas
const ListCompaniesSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  industry: z.string().optional(),
  min_score: z.string().optional(),
  max_score: z.string().optional(),
  verification_tier: z.enum(['certified', 'trusted', 'exemplary', 'pioneer']).optional(),
  sort: z.enum(['score', 'trending', 'reviews', 'name', 'recent']).optional().default('trending'),
  search: z.string().optional(),
  funding_stage: z.string().optional(),
  is_verified: z.string().optional(),
});

const CreateCompanySchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  industry: z.string().min(2),
  founded_year: z.number().min(1800).max(new Date().getFullYear()),
  employee_count: z.number().optional(),
  headquarters: z.string().optional(),
  website: z.string().url().optional(),
  logo_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  funding_stage: z.string().optional(),
  funding_amount: z.number().optional(),
  products: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),
  target_users: z.array(z.string()).optional(),
});

type ListCompaniesQuery = z.infer<typeof ListCompaniesSchema>;
type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;

// =====================================================
// GET /api/companies - List companies with filters
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const params = ListCompaniesSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      industry: searchParams.get('industry'),
      min_score: searchParams.get('min_score'),
      max_score: searchParams.get('max_score'),
      verification_tier: searchParams.get('verification_tier'),
      sort: searchParams.get('sort'),
      search: searchParams.get('search'),
      funding_stage: searchParams.get('funding_stage'),
      is_verified: searchParams.get('is_verified'),
    });

    const page = parseInt(params.page);
    const limit = Math.min(parseInt(params.limit), 100);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('companies')
      .select(`
        id,
        name,
        slug,
        logo_url,
        cover_image_url,
        description,
        industry,
        founded_year,
        employee_count,
        headquarters,
        website,
        verification_tier,
        overall_score,
        privacy_score,
        transparency_score,
        labor_score,
        environment_score,
        community_score,
        growth_rate,
        review_count,
        view_count,
        follower_count,
        trending_score,
        is_verified,
        created_at
      `, { count: 'exact' });

    // Apply filters
    if (params.industry) {
      query = query.eq('industry', params.industry);
    }

    if (params.min_score) {
      query = query.gte('overall_score', parseFloat(params.min_score));
    }

    if (params.max_score) {
      query = query.lte('overall_score', parseFloat(params.max_score));
    }

    if (params.verification_tier) {
      query = query.eq('verification_tier', params.verification_tier);
    }

    if (params.is_verified === 'true') {
      query = query.eq('is_verified', true);
    }

    if (params.funding_stage) {
      query = query.eq('funding_stage', params.funding_stage);
    }

    // Full-text search
    if (params.search) {
      query = query.textSearch('tsv', params.search, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Sorting
    switch (params.sort) {
      case 'score':
        query = query.order('overall_score', { ascending: false });
        break;
      case 'trending':
        query = query.order('trending_score', { ascending: false });
        break;
      case 'reviews':
        query = query.order('review_count', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('trending_score', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: companies, error, count } = await query;

    if (error) {
      console.error('Companies fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch companies', details: error.message },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: {
        companies: companies || [],
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

    console.error('Companies API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/companies - Create new company (Admin only)
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateCompanySchema.parse(body);

    // Check if slug already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this slug already exists' },
        { status: 409 }
      );
    }

    // Create company
    const { data: company, error: insertError } = await supabase
      .from('companies')
      .insert([{
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        industry: validatedData.industry,
        founded_year: validatedData.founded_year,
        employee_count: validatedData.employee_count,
        headquarters: validatedData.headquarters,
        website: validatedData.website,
        logo_url: validatedData.logo_url,
        cover_image_url: validatedData.cover_image_url,
        funding_stage: validatedData.funding_stage,
        funding_amount: validatedData.funding_amount,
        products: validatedData.products || [],
        target_users: validatedData.target_users || [],
        claimed_by: session.user.id,
        is_verified: false,
        overall_score: 0,
        trending_score: 0,
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Company creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create company', details: insertError.message },
        { status: 500 }
      );
    }

    // Track analytics event
    await supabase
      .from('analytics_events')
      .insert([{
        event_type: 'company_created',
        user_id: session.user.id,
        company_id: company.id,
        metadata: { source: 'api' },
      }]);

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      data: { company },
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Company creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// Rate limiting helper (optional - implement with Upstash)
// =====================================================
/*
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// Use in GET handler:
const identifier = request.ip ?? 'anonymous';
const { success } = await ratelimit.limit(identifier);
if (!success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
*/
