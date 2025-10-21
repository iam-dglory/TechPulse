/**
 * React Hooks for Voting API
 */

import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Vote data for submission
 */
export interface VoteData {
  company_id: string;
  vote_type: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation';
  score: number;
  comment?: string;
  evidence_url?: string;
}

/**
 * Vote response from API
 */
export interface Vote {
  id: string;
  user_id: string;
  company_id: string;
  vote_type: string;
  score: number;
  comment?: string | null;
  evidence_url?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to submit votes
 *
 * @returns { submitVote, loading }
 */
export function useVote() {
  const [loading, setLoading] = useState(false);

  /**
   * Submit a vote
   *
   * @param voteData - Vote data to submit
   * @returns Promise with vote data or null on error
   */
  const submitVote = async (voteData: VoteData): Promise<Vote | null> => {
    try {
      setLoading(true);

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Please log in to vote');
          throw new Error('Authentication required');
        }

        if (response.status === 400) {
          const errorMessage = result.error?.errors?.[0]?.message || result.error?.message || 'Invalid vote data';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        throw new Error(result.error?.message || 'Failed to submit vote');
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to submit vote');
      }

      // Show success message
      const isUpdate = result.message?.includes('updated');
      toast.success(isUpdate ? 'Vote updated successfully!' : 'Vote submitted successfully!');

      return result.data;
    } catch (err) {
      // Error already toasted in specific cases above
      // Only toast if not already handled
      if (err instanceof Error && !err.message.includes('Authentication required')) {
        if (!err.message.includes('Invalid vote data')) {
          toast.error(err.message || 'Failed to submit vote');
        }
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submitVote, loading };
}
