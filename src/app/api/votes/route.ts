/**
 * Votes API Endpoints
 *
 * POST /api/votes - Create or update vote (authenticated users)
 * GET  /api/votes - Get votes for company with optional filters
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { voteSchema, voteQuerySchema } from '@/lib/validations';
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

type VoteRow = Database['public']['Tables']['votes']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/**
 * Vote with user profile
 */
interface VoteWithProfile extends VoteRow {
  profiles: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url' | 'username'> | null;
}

/**
 * POST /api/votes
 *
 * Create or update a vote. Requires authentication.
 * If user has already voted on this dimension for this company, updates existing vote.
 * Otherwise, creates a new vote.
 * Automatically recalculates company scores after voting.
 *
 * Request Body:
 * - company_id: UUID of the company
 * - vote_type: Type of vote (ethics, credibility, delivery, security, innovation)
 * - score: Score from 1-10
 * - comment: Optional comment (max 500 characters)
 * - evidence_url: Optional URL to evidence
 *
 * @returns Created or updated vote with success message
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await parseRequestBody(request);
    const validationResult = validate(voteSchema, body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const voteData = validationResult.data;

    // Check if user has already voted on this dimension for this company
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', voteData.company_id)
      .eq('vote_type', voteData.vote_type)
      .maybeSingle();

    if (checkError) {
      throw fromSupabaseError(checkError);
    }

    let vote: VoteRow;
    let isUpdate = false;

    if (existingVote) {
      // Update existing vote
      const { data: updatedVote, error: updateError } = await supabase
        .from('votes')
        .update({
          score: voteData.score,
          comment: voteData.comment || null,
          evidence_url: voteData.evidence_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingVote.id)
        .select()
        .single();

      if (updateError) {
        throw fromSupabaseError(updateError);
      }

      if (!updatedVote) {
        throw new DatabaseError('Failed to update vote');
      }

      vote = updatedVote;
      isUpdate = true;
    } else {
      // Create new vote
      const { data: createdVote, error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          company_id: voteData.company_id,
          vote_type: voteData.vote_type,
          score: voteData.score,
          comment: voteData.comment || null,
          evidence_url: voteData.evidence_url || null,
        })
        .select()
        .single();

      if (insertError) {
        throw fromSupabaseError(insertError);
      }

      if (!createdVote) {
        throw new DatabaseError('Failed to create vote');
      }

      vote = createdVote;
    }

    // Recalculate company scores
    // Note: The database trigger should handle this automatically,
    // but we can also call it explicitly for reliability
    try {
      const { error: scoreError } = await supabase.rpc('calculate_company_scores', {
        p_company_id: voteData.company_id,
      });

      if (scoreError) {
        console.warn('Failed to recalculate company scores:', scoreError);
        // Don't throw - vote was successful, score calculation is a background task
      }
    } catch (scoreCalcError) {
      console.warn('Error calling calculate_company_scores:', scoreCalcError);
      // Don't throw - vote was successful
    }

    const message = isUpdate
      ? 'Vote updated successfully'
      : 'Vote created successfully';

    return isUpdate
      ? successResponse(vote, 200, message)
      : createdResponse(vote, message);
  } catch (error) {
    console.error('POST /api/votes error:', error);
    return errorResponseFromUnknown(error);
  }
}

/**
 * GET /api/votes
 *
 * Get votes for a company with optional filtering.
 *
 * Query Parameters:
 * - company_id: UUID of the company (required)
 * - user_id: Filter by specific user (optional)
 * - vote_type: Filter by vote type (optional)
 *
 * @returns Array of votes with user profile data
 */
export async function GET(request: NextRequest) {
  try {
    // Get and validate query parameters
    const params = getQueryParams(request);
    const validationResult = validate(voteQuerySchema, params);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const { company_id, user_id, vote_type } = validationResult.data;

    // Build query
    let query = supabase
      .from('votes')
      .select(
        `
        *,
        profiles (
          id,
          full_name,
          username,
          avatar_url
        )
      `
      )
      .eq('company_id', company_id)
      .order('created_at', { ascending: false });

    // Apply optional filters
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (vote_type) {
      query = query.eq('vote_type', vote_type);
    }

    const { data: votes, error } = await query;

    if (error) {
      throw fromSupabaseError(error);
    }

    if (!votes) {
      throw new DatabaseError('Failed to fetch votes');
    }

    return successResponse(
      votes as VoteWithProfile[],
      200,
      'Votes retrieved successfully'
    );
  } catch (error) {
    console.error('GET /api/votes error:', error);
    return errorResponseFromUnknown(error);
  }
}
