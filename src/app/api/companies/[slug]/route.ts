/**
 * Single Company API Endpoint
 *
 * GET /api/companies/[slug] - Get company by slug with related data
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

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type CompanyScoresRow = Database['public']['Tables']['company_scores']['Row'];
type PromiseRow = Database['public']['Tables']['promises']['Row'];
type VoteRow = Database['public']['Tables']['votes']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/**
 * Vote with user profile
 */
interface VoteWithUser extends VoteRow {
  profiles: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'> | null;
}

/**
 * Complete company data with related information
 */
interface CompanyWithRelations extends CompanyRow {
  company_scores: CompanyScoresRow | null;
  promises: PromiseRow[];
  votes: VoteWithUser[];
}

/**
 * GET /api/companies/[slug]
 *
 * Fetch a single company by slug with:
 * - Company scores
 * - Recent promises (last 10)
 * - Recent votes with user data (last 20)
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing company slug
 * @returns Complete company data with relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Validate slug format (lowercase with hyphens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!slugRegex.test(slug)) {
      return notFoundResponse('Invalid company slug format', 'Company');
    }

    // Fetch company with scores
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(
        `
        *,
        company_scores (
          id,
          overall_score,
          ethics_score,
          credibility_score,
          delivery_score,
          security_score,
          innovation_score,
          growth_rate,
          verification_tier,
          updated_at
        )
      `
      )
      .eq('slug', slug)
      .single();

    if (companyError) {
      // Handle not found error
      if (companyError.code === 'PGRST116') {
        throw NotFoundError.company(
          slug,
          `Company with slug '${slug}' not found`
        );
      }
      throw fromSupabaseError(companyError);
    }

    if (!company) {
      throw NotFoundError.company(
        slug,
        `Company with slug '${slug}' not found`
      );
    }

    // Fetch recent promises (last 10)
    const { data: promises, error: promisesError } = await supabase
      .from('promises')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (promisesError) {
      console.warn('Failed to fetch promises:', promisesError);
    }

    // Fetch recent votes with user data (last 20)
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(
        `
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (votesError) {
      console.warn('Failed to fetch votes:', votesError);
    }

    // Combine all data
    const completeCompany: CompanyWithRelations = {
      ...company,
      promises: promises || [],
      votes: (votes as VoteWithUser[]) || [],
    };

    return successResponse(
      completeCompany,
      200,
      'Company retrieved successfully'
    );
  } catch (error) {
    console.error(`GET /api/companies/${params.slug} error:`, error);
    return errorResponseFromUnknown(error);
  }
}
