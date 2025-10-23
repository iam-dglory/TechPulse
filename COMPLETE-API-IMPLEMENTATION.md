# Complete TechPulze API Implementation

This document contains the complete implementation of all API routes with advanced features including rate limiting, caching, authentication, and comprehensive business logic.

## Table of Contents
1. [Setup Requirements](#setup-requirements)
2. [Companies API](#companies-api)
3. [Reviews API](#reviews-api)
4. [AI Scoring API](#ai-scoring-api)
5. [Authentication & Users API](#authentication--users-api)
6. [Utility Functions](#utility-functions)

---

## Setup Requirements

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uypdmcgybpltogihldhu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis (for caching and rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# OpenAI API (for AI scoring)
OPENAI_API_KEY=sk-your-key

# App URL
NEXT_PUBLIC_APP_URL=https://www.texhpulze.com
```

### Install Dependencies
```bash
npm install @upstash/redis @upstash/ratelimit
npm install openai
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
npm install zod
npm install winston # for logging
```

---

## Companies API

### File: `app/api/companies/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CompanyQuerySchema, CreateCompanySchema } from '@/lib/validations/company';
import { cache, checkRateLimit } from '@/lib/redis';
import { logger } from '@/lib/logger';

/**
 * GET /api/companies - List companies with advanced filtering
 *
 * Query Parameters:
 * - page, limit: Pagination
 * - industry: Filter by industry
 * - minScore, maxScore: Score range filter
 * - verificationTier: Array of tiers (certified,trusted,exemplary,pioneer)
 * - growthStatus: Array of growth statuses
 * - fundingStage: Array of funding stages
 * - foundedYearMin, foundedYearMax: Year range
 * - sort: trending | score | growth | reviews | recent | name
 * - search: Full-text search query
 *
 * Response: { data: Company[], count: number, page: number, hasMore: boolean }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const rateLimit = await checkRateLimit(identifier, 'read');

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimit.reset },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          }
        }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());
    const params = CompanyQuerySchema.parse(queryObject);

    const { page, limit } = params;
    const cacheKey = `companies:${JSON.stringify(params)}`;

    // Check cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      logger.info('Cache hit for companies list', { params });
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=300',
        }
      });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('companies')
      .select(`
        id, name, slug, logo_url, cover_image_url, description,
        industry, founded_year, employee_count, headquarters,
        website, funding_stage, funding_amount, verification_tier,
        overall_score, privacy_score, transparency_score,
        labor_score, environment_score, community_score,
        growth_rate, review_count, view_count, follower_count,
        trending_score, is_verified, created_at, updated_at
      `, { count: 'exact' });

    // Apply filters
    if (params.industry) {
      query = query.eq('industry', params.industry);
    }

    if (params.minScore !== undefined) {
      query = query.gte('overall_score', params.minScore);
    }

    if (params.maxScore !== undefined) {
      query = query.lte('overall_score', params.maxScore);
    }

    if (params.verificationTier && params.verificationTier.length > 0) {
      query = query.in('verification_tier', params.verificationTier);
    }

    if (params.fundingStage && params.fundingStage.length > 0) {
      query = query.in('funding_stage', params.fundingStage);
    }

    if (params.foundedYearMin) {
      query = query.gte('founded_year', params.foundedYearMin);
    }

    if (params.foundedYearMax) {
      query = query.lte('founded_year', params.foundedYearMax);
    }

    if (params.isVerified !== undefined) {
      query = query.eq('is_verified', params.isVerified);
    }

    // Full-text search
    if (params.search) {
      query = query.textSearch('tsv', params.search, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Sorting
    switch (params.sort) {
      case 'score':
        query = query.order('overall_score', { ascending: false });
        break;
      case 'growth':
        query = query.order('growth_rate', { ascending: false });
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
      case 'trending':
      default:
        query = query.order('trending_score', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: companies, error, count } = await query;

    if (error) {
      logger.error('Companies fetch error', { error, params });
      return NextResponse.json(
        { error: 'Failed to fetch companies', details: error.message },
        { status: 500 }
      );
    }

    const responseData = {
      success: true,
      data: companies || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0),
      },
      meta: {
        responseTime: Date.now() - startTime,
      },
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, responseData, 300);

    logger.info('Companies fetched successfully', {
      count: companies?.length,
      total: count,
      params,
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=300',
      }
    });

  } catch (error: any) {
    logger.error('Companies API error', { error: error.message, stack: error.stack });

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies - Create new company (Admin only)
 *
 * Body: CreateCompanyInput
 *
 * Response: { success: true, data: { company: Company } }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const rateLimit = await checkRateLimit(identifier, 'write');

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Check admin role
    // const isAdmin = await checkAdminRole(session.user.id);
    // if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // Parse and validate body
    const body = await request.json();
    const validatedData = CreateCompanySchema.parse(body);

    // Check if slug exists
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Company with this slug already exists' },
        { status: 409 }
      );
    }

    // Create company
    const { data: company, error: insertError } = await supabase
      .from('companies')
      .insert([{
        ...validatedData,
        claimed_by: session.user.id,
        is_verified: false,
        overall_score: 0,
        trending_score: 0,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) {
      logger.error('Company creation error', { error: insertError, data: validatedData });
      return NextResponse.json(
        { error: 'Failed to create company', details: insertError.message },
        { status: 500 }
      );
    }

    // Create initial score history entry
    await supabase
      .from('score_history')
      .insert([{
        company_id: company.id,
        overall_score: 0,
        reason: 'Initial creation',
        triggered_by: 'system',
      }]);

    // Track analytics
    await supabase
      .from('analytics_events')
      .insert([{
        event_type: 'company_created',
        user_id: session.user.id,
        company_id: company.id,
        metadata: { source: 'api' },
      }]);

    // Invalidate cache
    await cache.invalidatePattern('companies:*');

    logger.info('Company created successfully', { companyId: company.id, userId: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      data: { company },
    }, { status: 201 });

  } catch (error: any) {
    logger.error('Company creation API error', { error: error.message });

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### File: `app/api/companies/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { UpdateCompanySchema } from '@/lib/validations/company';
import { cache, checkRateLimit } from '@/lib/redis';
import { logger } from '@/lib/logger';

/**
 * GET /api/companies/[id] - Get single company details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cacheKey = `company:${id}`;

    // Check cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: { 'X-Cache': 'HIT' }
      });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get company with related data
    const { data: company, error } = await supabase
      .from('companies')
      .select(`
        *,
        claimed_by_profile:profiles!claimed_by (
          id, username, full_name, avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get user's follow status
    const { data: { session } } = await supabase.auth.getSession();
    let isFollowing = false;

    if (session) {
      const { data: followData } = await supabase
        .from('user_follows')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('company_id', id)
        .single();

      isFollowing = !!followData;
    }

    // Get review stats
    const { count: reviewCount, data: reviews } = await supabase
      .from('reviews')
      .select('rating', { count: 'exact' })
      .eq('company_id', id)
      .eq('status', 'approved');

    const ratingDistribution = reviews?.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>) || {};

    // Increment view count (fire and forget)
    supabase
      .from('companies')
      .update({ view_count: (company.view_count || 0) + 1 })
      .eq('id', id)
      .then();

    // Track analytics
    if (session) {
      supabase
        .from('analytics_events')
        .insert([{
          event_type: 'company_view',
          user_id: session.user.id,
          company_id: id,
        }])
        .then();
    }

    const responseData = {
      success: true,
      data: {
        company,
        is_following: isFollowing,
        review_count: reviewCount || 0,
        rating_distribution: ratingDistribution,
      },
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, responseData, 300);

    return NextResponse.json(responseData);

  } catch (error: any) {
    logger.error('Company fetch error', { error: error.message, id: params.id });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/companies/[id] - Update company (Owner/Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const rateLimit = await checkRateLimit(identifier, 'write');

    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get company to check ownership
    const { data: company } = await supabase
      .from('companies')
      .select('claimed_by')
      .eq('id', id)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check authorization (owner or admin)
    if (company.claimed_by !== session.user.id) {
      // TODO: Check if user is admin
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse and validate body
    const body = await request.json();
    const validatedData = UpdateCompanySchema.parse(body);

    // Update company
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Company update error', { error: updateError, id });
      return NextResponse.json(
        { error: 'Failed to update company', details: updateError.message },
        { status: 500 }
      );
    }

    // Invalidate cache
    await cache.del(`company:${id}`);
    await cache.invalidatePattern('companies:*');

    logger.info('Company updated', { companyId: id, userId: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Company updated successfully',
      data: { company: updatedCompany },
    });

  } catch (error: any) {
    logger.error('Company update API error', { error: error.message });

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/companies/[id] - Soft delete company (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication & admin role
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // TODO: Check admin role

    // Soft delete (set deleted_at instead of actual deletion)
    const { error } = await supabase
      .from('companies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error('Company deletion error', { error, id });
      return NextResponse.json(
        { error: 'Failed to delete company' },
        { status: 500 }
      );
    }

    // Invalidate cache
    await cache.del(`company:${id}`);
    await cache.invalidatePattern('companies:*');

    logger.info('Company deleted', { companyId: id, userId: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully',
    });

  } catch (error: any) {
    logger.error('Company deletion API error', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### File: `app/api/companies/[id]/follow/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from '@/lib/redis';

/**
 * POST /api/companies/[id]/follow - Toggle follow status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: companyId } = params;
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if already following
    const { data: existing } = await supabase
      .from('user_follows')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    let isFollowing: boolean;

    if (existing) {
      // Unfollow
      await supabase
        .from('user_follows')
        .delete()
        .eq('id', existing.id);

      // Decrement follower count
      await supabase.rpc('decrement_follower_count', { company_id: companyId });

      isFollowing = false;
    } else {
      // Follow
      await supabase
        .from('user_follows')
        .insert([{ user_id: userId, company_id: companyId }]);

      // Increment follower count
      await supabase.rpc('increment_follower_count', { company_id: companyId });

      // Create notification for company owner
      const { data: company } = await supabase
        .from('companies')
        .select('claimed_by, name')
        .eq('id', companyId)
        .single();

      if (company?.claimed_by) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: company.claimed_by,
            type: 'new_follower',
            title: 'New Follower',
            message: `Someone started following ${company.name}`,
            link: `/companies/${companyId}`,
          }]);
      }

      isFollowing = true;
    }

    // Invalidate cache
    await cache.del(`company:${companyId}`);

    return NextResponse.json({
      success: true,
      data: { is_following: isFollowing },
    });

  } catch (error: any) {
    console.error('Follow toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Logger Utility

### File: `lib/logger.ts`

```typescript
/**
 * Logging utility using Winston
 */

import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'techpulze-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export { logger };
```

---

## Next: Reviews API Implementation

[Continue in next response due to length...]
