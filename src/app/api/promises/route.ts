/**
 * Promises API Endpoints
 *
 * GET  /api/promises - Get promises for company with optional filters
 * POST /api/promises - Create promise (authenticated users)
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { promiseSchema, promiseQuerySchema } from '@/lib/validations';
import { validate } from '@/lib/validations/utils';
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  errorResponseFromUnknown,
  parseRequestBody,
  getQueryParams,
} from '@/lib/api-response';
import { requireAuth } from '@/lib/auth/middleware';
import {
  ValidationError,
  DatabaseError,
  fromSupabaseError,
} from '@/lib/errors';
import type { Database } from '@/types/database';

type PromiseRow = Database['public']['Tables']['promises']['Row'];
type PromiseVoteRow = Database['public']['Tables']['promise_votes']['Row'];

/**
 * Promise with vote counts
 */
interface PromiseWithVotes extends PromiseRow {
  promise_votes: PromiseVoteRow[];
  vote_counts?: {
    kept: number;
    broken: number;
    partial: number;
    total: number;
  };
}

/**
 * GET /api/promises
 *
 * Get promises for a company with optional status filtering.
 *
 * Query Parameters:
 * - company_id: UUID of the company (required)
 * - status: Filter by promise status (optional)
 *
 * @returns Array of promises with vote data
 */
export async function GET(request: NextRequest) {
  try {
    // Get and validate query parameters
    const params = getQueryParams(request);
    const validationResult = validate(promiseQuerySchema, params);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const { company_id, status } = validationResult.data;

    // Build query
    let query = supabase
      .from('promises')
      .select(
        `
        *,
        promise_votes (
          id,
          verdict,
          comment,
          created_at
        )
      `
      )
      .eq('company_id', company_id)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: promises, error } = await query;

    if (error) {
      throw fromSupabaseError(error);
    }

    if (!promises) {
      throw new DatabaseError('Failed to fetch promises');
    }

    // Calculate vote counts for each promise
    const promisesWithCounts: PromiseWithVotes[] = promises.map((promise) => {
      const votes = promise.promise_votes || [];
      const vote_counts = {
        kept: votes.filter((v: PromiseVoteRow) => v.verdict === 'kept').length,
        broken: votes.filter((v: PromiseVoteRow) => v.verdict === 'broken').length,
        partial: votes.filter((v: PromiseVoteRow) => v.verdict === 'partial').length,
        total: votes.length,
      };

      return {
        ...promise,
        vote_counts,
      };
    });

    return successResponse(
      promisesWithCounts,
      200,
      'Promises retrieved successfully'
    );
  } catch (error) {
    console.error('GET /api/promises error:', error);
    return errorResponseFromUnknown(error);
  }
}

/**
 * POST /api/promises
 *
 * Create a new promise. Requires authentication.
 *
 * Request Body:
 * - company_id: UUID of the company
 * - promise_text: Text of the promise (20-500 characters)
 * - category: Promise category (product, ethics, sustainability, privacy, security)
 * - promised_date: Date when promise was made (YYYY-MM-DD)
 * - deadline_date: Deadline for promise (YYYY-MM-DD, must be >= promised_date)
 * - source_url: URL to source of promise
 * - impact_level: Impact level (1-5)
 * - status: Promise status (defaults to 'pending')
 *
 * @returns Created promise
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await parseRequestBody(request);
    const validationResult = validate(promiseSchema, body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const promiseData = validationResult.data;

    // Additional validation: deadline_date must be after promised_date
    const promisedDate = new Date(promiseData.promised_date);
    const deadlineDate = new Date(promiseData.deadline_date);

    if (deadlineDate < promisedDate) {
      return validationErrorResponse([
        {
          field: 'deadline_date',
          message: 'Deadline date must be on or after promised date',
        },
      ]);
    }

    // Insert promise
    const { data: createdPromise, error: insertError } = await supabase
      .from('promises')
      .insert({
        company_id: promiseData.company_id,
        promise_text: promiseData.promise_text,
        category: promiseData.category,
        promised_date: promiseData.promised_date,
        deadline_date: promiseData.deadline_date,
        source_url: promiseData.source_url,
        impact_level: promiseData.impact_level,
        status: promiseData.status || 'pending',
      })
      .select()
      .single();

    if (insertError) {
      throw fromSupabaseError(insertError);
    }

    if (!createdPromise) {
      throw new DatabaseError('Failed to create promise');
    }

    return createdResponse(
      createdPromise,
      'Promise created successfully',
      `/api/promises/${createdPromise.id}`
    );
  } catch (error) {
    console.error('POST /api/promises error:', error);
    return errorResponseFromUnknown(error);
  }
}
