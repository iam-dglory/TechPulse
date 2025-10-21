/**
 * News API Endpoints
 *
 * GET  /api/news - List news with pagination and filters
 * POST /api/news - Create news article (admin only)
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { newsSchema, newsQuerySchema } from '@/lib/validations';
import { validate } from '@/lib/validations/utils';
import {
  successResponse,
  paginatedResponse,
  createdResponse,
  validationErrorResponse,
  errorResponseFromUnknown,
  parseRequestBody,
  getQueryParams,
  createPaginationMeta,
} from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/middleware';
import {
  NotFoundError,
  DatabaseError,
  fromSupabaseError,
} from '@/lib/errors';
import type { Database } from '@/types/database';

type NewsRow = Database['public']['Tables']['news']['Row'];
type CompanyRow = Database['public']['Tables']['companies']['Row'];

/**
 * News article with company data
 */
interface NewsWithCompany extends NewsRow {
  companies: CompanyRow | null;
}

/**
 * GET /api/news
 *
 * Fetch news articles with pagination and optional filters.
 *
 * Query Parameters:
 * - limit: Number of items (1-100, default 20)
 * - offset: Number of items to skip (default 0)
 * - industry: Filter by company industry
 * - impact: Filter by minimum ethics impact (1-10)
 * - company_id: Filter by company ID
 * - search: Search in title and content
 *
 * @returns Paginated list of news articles with company data
 */
export async function GET(request: NextRequest) {
  try {
    // Get and validate query parameters
    const params = getQueryParams(request);
    const validationResult = validate(newsQuerySchema, params);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const { limit, offset, industry, impact, company_id, search } =
      validationResult.data;

    // Build Supabase query
    let query = supabase
      .from('news')
      .select(
        `
        *,
        companies (
          id,
          name,
          slug,
          industry,
          logo_url
        )
      `,
        { count: 'exact' }
      )
      .order('published_at', { ascending: false });

    // Apply filters
    if (industry) {
      query = query.eq('companies.industry', industry);
    }

    if (impact) {
      query = query.gte('ethics_impact', impact);
    }

    if (company_id) {
      query = query.eq('company_id', company_id);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: news, error, count } = await query;

    if (error) {
      throw fromSupabaseError(error);
    }

    if (!news) {
      throw new DatabaseError('Failed to fetch news articles');
    }

    // Create pagination metadata
    const pagination = createPaginationMeta(count || 0, limit, offset);

    return paginatedResponse(
      news as NewsWithCompany[],
      pagination,
      200,
      'News articles retrieved successfully'
    );
  } catch (error) {
    console.error('GET /api/news error:', error);
    return errorResponseFromUnknown(error);
  }
}

/**
 * POST /api/news
 *
 * Create a new news article. Requires admin authentication.
 *
 * Request Body:
 * - title: Article title (10-200 characters)
 * - content: Article content (100-10000 characters)
 * - company_id: Associated company UUID (optional)
 * - ethics_impact: Impact score 1-10 (optional)
 * - source_url: Source URL (required)
 * - published_at: Publication date (YYYY-MM-DD)
 *
 * @returns Created news article
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const profile = await requireAdmin();

    // Parse and validate request body
    const body = await parseRequestBody(request);
    const validationResult = validate(newsSchema, body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const newsData = validationResult.data;

    // Validate company exists if company_id provided
    if (newsData.company_id) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', newsData.company_id)
        .single();

      if (companyError || !company) {
        throw NotFoundError.company(
          newsData.company_id,
          'Associated company not found'
        );
      }
    }

    // Insert news article
    const { data: createdNews, error: insertError } = await supabase
      .from('news')
      .insert({
        title: newsData.title,
        content: newsData.content,
        company_id: newsData.company_id || null,
        ethics_impact: newsData.ethics_impact || null,
        source_url: newsData.source_url,
        published_at: newsData.published_at,
      })
      .select(
        `
        *,
        companies (
          id,
          name,
          slug,
          industry,
          logo_url
        )
      `
      )
      .single();

    if (insertError) {
      throw fromSupabaseError(insertError);
    }

    if (!createdNews) {
      throw new DatabaseError('Failed to create news article');
    }

    return createdResponse(
      createdNews as NewsWithCompany,
      'News article created successfully',
      `/api/news/${createdNews.id}`
    );
  } catch (error) {
    console.error('POST /api/news error:', error);
    return errorResponseFromUnknown(error);
  }
}
