/**
 * Promise Voting API Endpoint
 *
 * POST /api/promises/[id]/vote - Vote on promise outcome
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { promiseVoteSchema } from '@/lib/validations';
import { validate } from '@/lib/validations/utils';
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  errorResponseFromUnknown,
  parseRequestBody,
} from '@/lib/api-response';
import { requireAuth } from '@/lib/auth/middleware';
import {
  NotFoundError,
  DatabaseError,
  fromSupabaseError,
} from '@/lib/errors';
import type { Database } from '@/types/database';

type PromiseVoteRow = Database['public']['Tables']['promise_votes']['Row'];
type PromiseRow = Database['public']['Tables']['promises']['Row'];

/**
 * Consensus thresholds for auto-updating promise status
 */
const CONSENSUS_MIN_VOTES = 100;
const CONSENSUS_THRESHOLD = 0.7; // 70% agreement

/**
 * POST /api/promises/[id]/vote
 *
 * Vote on whether a promise was kept, broken, or partially fulfilled.
 * If user has already voted on this promise, updates existing vote.
 * Checks for consensus after voting and auto-updates promise status if reached.
 *
 * Request Body:
 * - verdict: Vote verdict (kept, broken, partial)
 * - comment: Optional comment (max 500 characters)
 *
 * @param params - Route parameters containing promise ID
 * @returns Created or updated vote with consensus status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    const promiseId = params.id;

    // Parse and validate request body
    const body = await parseRequestBody(request);

    // Add promise_id from route params
    const voteData = { ...body, promise_id: promiseId };

    const validationResult = validate(promiseVoteSchema, voteData);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const { promise_id, verdict, comment } = validationResult.data;

    // Verify promise exists
    const { data: promise, error: promiseError } = await supabase
      .from('promises')
      .select('id, status')
      .eq('id', promise_id)
      .single();

    if (promiseError || !promise) {
      throw NotFoundError.resource('Promise', promise_id);
    }

    // Check if user has already voted on this promise
    const { data: existingVote, error: checkError } = await supabase
      .from('promise_votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('promise_id', promise_id)
      .maybeSingle();

    if (checkError) {
      throw fromSupabaseError(checkError);
    }

    let vote: PromiseVoteRow;
    let isUpdate = false;

    if (existingVote) {
      // Update existing vote
      const { data: updatedVote, error: updateError } = await supabase
        .from('promise_votes')
        .update({
          verdict,
          comment: comment || null,
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
        .from('promise_votes')
        .insert({
          promise_id,
          user_id: user.id,
          verdict,
          comment: comment || null,
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

    // Check for consensus
    const { data: allVotes, error: votesError } = await supabase
      .from('promise_votes')
      .select('verdict')
      .eq('promise_id', promise_id);

    if (votesError) {
      console.warn('Failed to fetch votes for consensus check:', votesError);
    }

    let consensusReached = false;
    let newStatus: string | null = null;

    if (allVotes && allVotes.length >= CONSENSUS_MIN_VOTES) {
      const verdictCounts = {
        kept: allVotes.filter((v) => v.verdict === 'kept').length,
        broken: allVotes.filter((v) => v.verdict === 'broken').length,
        partial: allVotes.filter((v) => v.verdict === 'partial').length,
      };

      const totalVotes = allVotes.length;
      const maxCount = Math.max(verdictCounts.kept, verdictCounts.broken, verdictCounts.partial);
      const agreementPercentage = maxCount / totalVotes;

      // Check if consensus threshold is reached
      if (agreementPercentage >= CONSENSUS_THRESHOLD) {
        consensusReached = true;

        // Determine majority verdict
        if (verdictCounts.kept === maxCount) {
          newStatus = 'kept';
        } else if (verdictCounts.broken === maxCount) {
          newStatus = 'broken';
        } else {
          newStatus = 'delayed'; // Use 'delayed' for partial consensus
        }

        // Update promise status if it changed
        if (newStatus && promise.status !== newStatus) {
          const { error: updateError } = await supabase
            .from('promises')
            .update({ status: newStatus as any })
            .eq('id', promise_id);

          if (updateError) {
            console.warn('Failed to update promise status:', updateError);
            consensusReached = false; // Reset consensus flag on failure
          }
        }
      }
    }

    const message = isUpdate
      ? 'Vote updated successfully'
      : 'Vote created successfully';

    const responseData = {
      ...vote,
      consensus_reached: consensusReached,
      ...(consensusReached && newStatus && { new_status: newStatus }),
    };

    return isUpdate
      ? successResponse(responseData, 200, message)
      : createdResponse(responseData, message);
  } catch (error) {
    console.error(`POST /api/promises/${params.id}/vote error:`, error);
    return errorResponseFromUnknown(error);
  }
}
