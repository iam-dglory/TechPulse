/**
 * Single News Article API Endpoint
 *
 * GET /api/news/[id] - Get single news article by ID
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  successResponse,
  notFoundResponse,
  errorResponseFromUnknown,
} from '@/lib/api-response';
import { NotFoundError, fromSupabaseError } from '@/lib/errors';
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
 * GET /api/news/[id]
 *
 * Fetch a single news article by ID with related company data.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing news ID
 * @returns News article with company data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format (basic UUID check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return notFoundResponse('Invalid news article ID format', 'News');
    }

    // Fetch news article with company data
    const { data: news, error } = await supabase
      .from('news')
      .select(
        `
        *,
        companies (
          id,
          name,
          slug,
          industry,
          website,
          description,
          founded_year,
          headquarters,
          employee_count,
          logo_url,
          created_at,
          updated_at
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      // Handle not found error
      if (error.code === 'PGRST116') {
        throw NotFoundError.article(id, 'News article not found');
      }
      throw fromSupabaseError(error);
    }

    if (!news) {
      throw NotFoundError.article(id, 'News article not found');
    }

    return successResponse(
      news as NewsWithCompany,
      200,
      'News article retrieved successfully'
    );
  } catch (error) {
    console.error(`GET /api/news/${params.id} error:`, error);
    return errorResponseFromUnknown(error);
  }
}
