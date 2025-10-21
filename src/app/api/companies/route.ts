/**
 * Companies API Endpoints
 *
 * GET  /api/companies - Search and list companies with filters
 * POST /api/companies - Create company (authenticated users)
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { companySchema, companySearchSchema } from '@/lib/validations';
import { validate } from '@/lib/validations/utils';
import {
  paginatedResponse,
  createdResponse,
  validationErrorResponse,
  errorResponseFromUnknown,
  parseRequestBody,
  getQueryParams,
  createPaginationMeta,
} from '@/lib/api-response';
import { requireAuth } from '@/lib/auth/middleware';
import {
  ConflictError,
  DatabaseError,
  fromSupabaseError,
} from '@/lib/errors';
import type { Database } from '@/types/database';

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type CompanyScoresRow = Database['public']['Tables']['company_scores']['Row'];

/**
 * Company with scores
 */
interface CompanyWithScores extends CompanyRow {
  company_scores: CompanyScoresRow | null;
}

/**
 * GET /api/companies
 *
 * Search and filter companies with pagination.
 *
 * Query Parameters:
 * - query: Search text (name and description)
 * - industry: Filter by industry
 * - score_min: Minimum overall score (0-10)
 * - score_max: Maximum overall score (0-10)
 * - verification_tier: Filter by verification level
 * - sort: Sort order (score, trending, recent, name)
 * - limit: Items per page (1-100, default 20)
 * - offset: Number to skip (default 0)
 *
 * @returns Paginated list of companies with scores
 */
export async function GET(request: NextRequest) {
  try {
    // Get and validate query parameters
    const params = getQueryParams(request);
    const validationResult = validate(companySearchSchema, params);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const {
      query: searchQuery,
      industry,
      score_min,
      score_max,
      verification_tier,
      sort,
      limit,
      offset,
    } = validationResult.data;

    // Build Supabase query
    let query = supabase
      .from('companies')
      .select(
        `
        *,
        company_scores (
          overall_score,
          ethics_score,
          credibility_score,
          delivery_score,
          security_score,
          innovation_score,
          growth_rate,
          verification_tier
        )
      `,
        { count: 'exact' }
      );

    // Apply text search on name and description
    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    // Apply industry filter
    if (industry) {
      query = query.eq('industry', industry);
    }

    // Apply score range filters
    if (score_min !== undefined || score_max !== undefined) {
      if (score_min !== undefined) {
        query = query.gte('company_scores.overall_score', score_min);
      }
      if (score_max !== undefined) {
        query = query.lte('company_scores.overall_score', score_max);
      }
    }

    // Apply verification tier filter
    if (verification_tier) {
      query = query.eq('company_scores.verification_tier', verification_tier);
    }

    // Apply sorting
    switch (sort) {
      case 'score':
        query = query.order('overall_score', {
          ascending: false,
          foreignTable: 'company_scores',
        });
        break;
      case 'trending':
        query = query.order('growth_rate', {
          ascending: false,
          foreignTable: 'company_scores',
          nullsFirst: false,
        });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: companies, error, count } = await query;

    if (error) {
      throw fromSupabaseError(error);
    }

    if (!companies) {
      throw new DatabaseError('Failed to fetch companies');
    }

    // Create pagination metadata
    const pagination = createPaginationMeta(count || 0, limit, offset);

    return paginatedResponse(
      companies as CompanyWithScores[],
      pagination,
      200,
      'Companies retrieved successfully'
    );
  } catch (error) {
    console.error('GET /api/companies error:', error);
    return errorResponseFromUnknown(error);
  }
}

/**
 * POST /api/companies
 *
 * Create a new company. Requires authentication.
 *
 * Request Body:
 * - name: Company name (2-100 characters)
 * - slug: URL-friendly slug (unique)
 * - industry: Industry category
 * - website: Company website URL (optional)
 * - description: Company description (50-500 characters)
 * - founded_year: Year founded (1800-current)
 * - headquarters: Location (2-100 characters)
 * - employee_count: Number of employees (optional)
 * - logo_url: Logo image URL (optional)
 *
 * @returns Created company with default scores
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await parseRequestBody(request);
    const validationResult = validate(companySchema, body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const companyData = validationResult.data;

    // Check for duplicate slug
    const { data: existingCompany, error: slugCheckError } = await supabase
      .from('companies')
      .select('id, slug')
      .eq('slug', companyData.slug)
      .maybeSingle();

    if (slugCheckError) {
      throw fromSupabaseError(slugCheckError);
    }

    if (existingCompany) {
      throw ConflictError.duplicate(
        'slug',
        companyData.slug,
        `A company with slug '${companyData.slug}' already exists`
      );
    }

    // Insert company
    const { data: createdCompany, error: insertError } = await supabase
      .from('companies')
      .insert({
        name: companyData.name,
        slug: companyData.slug,
        industry: companyData.industry,
        website: companyData.website || null,
        description: companyData.description,
        founded_year: companyData.founded_year,
        headquarters: companyData.headquarters,
        employee_count: companyData.employee_count || null,
        logo_url: companyData.logo_url || null,
      })
      .select()
      .single();

    if (insertError) {
      throw fromSupabaseError(insertError);
    }

    if (!createdCompany) {
      throw new DatabaseError('Failed to create company');
    }

    // Create default company scores
    const { error: scoresError } = await supabase
      .from('company_scores')
      .insert({
        company_id: createdCompany.id,
        overall_score: 5.0,
        ethics_score: 5.0,
        credibility_score: 5.0,
        delivery_score: 5.0,
        security_score: 5.0,
        innovation_score: 5.0,
        growth_rate: null,
        verification_tier: 'unverified',
      });

    if (scoresError) {
      console.warn('Failed to create default scores:', scoresError);
      // Don't throw - company is already created
    }

    // Fetch company with scores
    const { data: companyWithScores } = await supabase
      .from('companies')
      .select(
        `
        *,
        company_scores (
          overall_score,
          ethics_score,
          credibility_score,
          delivery_score,
          security_score,
          innovation_score,
          growth_rate,
          verification_tier
        )
      `
      )
      .eq('id', createdCompany.id)
      .single();

    return createdResponse(
      companyWithScores || createdCompany,
      'Company created successfully',
      `/api/companies/${createdCompany.slug}`
    );
  } catch (error) {
    console.error('POST /api/companies error:', error);
    return errorResponseFromUnknown(error);
  }
}
