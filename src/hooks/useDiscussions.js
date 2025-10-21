/**
 * useDiscussions Hook - Manage community discussions
 *
 * Provides methods to create, fetch, and interact with discussions
 * in the TexhPulze community forum.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to manage discussions
 *
 * @param {Object} options - Query options
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.sortBy='popular'] - Sort order (popular, recent, trending)
 * @param {number} [options.limit=20] - Number of discussions to fetch
 * @param {boolean} [options.realtime=false] - Enable real-time updates
 * @returns {Object} - Discussions data and methods
 */
export function useDiscussions(options = {}) {
  const { user } = useAuth();
  const {
    category = null,
    sortBy = 'popular',
    limit = 20,
    realtime = false,
  } = options;

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiscussions();

    // Set up real-time subscription if enabled
    if (realtime) {
      const channel = supabase
        .channel('discussions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'discussions',
          },
          (payload) => {
            console.log('Discussion change:', payload);
            fetchDiscussions(); // Refresh on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [category, sortBy, limit, realtime]);

  /**
   * Fetch discussions with filters and sorting
   */
  async function fetchDiscussions() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('discussions')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .limit(limit);

      // Apply category filter
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Apply sorting
      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'popular') {
        // Sort by total votes (upvotes - downvotes)
        query = query.order('upvotes', { ascending: false });
      } else if (sortBy === 'trending') {
        // Trending: high engagement in recent time
        query = query
          .order('upvotes', { ascending: false })
          .order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setDiscussions(data || []);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create new discussion
   *
   * @param {Object} discussionData - Discussion data
   * @param {string} discussionData.title - Discussion title
   * @param {string} discussionData.content - Discussion content
   * @param {string} discussionData.category - Discussion category
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async function createDiscussion(discussionData) {
    if (!user) {
      return { success: false, error: 'Please sign in to create a discussion' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('discussions')
        .insert({
          user_id: user.id,
          title: discussionData.title,
          content: discussionData.content,
          category: discussionData.category,
          upvotes: 0,
          downvotes: 0,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      await fetchDiscussions(); // Refresh list
      return { success: true, data };
    } catch (err) {
      console.error('Error creating discussion:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Upvote a discussion
   *
   * @param {string} discussionId - Discussion ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function upvoteDiscussion(discussionId) {
    if (!user) {
      return { success: false, error: 'Please sign in to vote' };
    }

    try {
      // Get current discussion
      const { data: discussion, error: fetchError } = await supabase
        .from('discussions')
        .select('upvotes')
        .eq('id', discussionId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Increment upvotes
      const { error: updateError } = await supabase
        .from('discussions')
        .update({ upvotes: discussion.upvotes + 1 })
        .eq('id', discussionId);

      if (updateError) {
        throw updateError;
      }

      await fetchDiscussions(); // Refresh list
      return { success: true };
    } catch (err) {
      console.error('Error upvoting discussion:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Downvote a discussion
   *
   * @param {string} discussionId - Discussion ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function downvoteDiscussion(discussionId) {
    if (!user) {
      return { success: false, error: 'Please sign in to vote' };
    }

    try {
      // Get current discussion
      const { data: discussion, error: fetchError } = await supabase
        .from('discussions')
        .select('downvotes')
        .eq('id', discussionId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Increment downvotes
      const { error: updateError } = await supabase
        .from('discussions')
        .update({ downvotes: discussion.downvotes + 1 })
        .eq('id', discussionId);

      if (updateError) {
        throw updateError;
      }

      await fetchDiscussions(); // Refresh list
      return { success: true };
    } catch (err) {
      console.error('Error downvoting discussion:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete discussion (only own discussions)
   *
   * @param {string} discussionId - Discussion ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function deleteDiscussion(discussionId) {
    if (!user) {
      return { success: false, error: 'Please sign in' };
    }

    try {
      const { error: deleteError } = await supabase
        .from('discussions')
        .delete()
        .eq('id', discussionId)
        .eq('user_id', user.id); // Only allow deleting own discussions

      if (deleteError) {
        throw deleteError;
      }

      await fetchDiscussions(); // Refresh list
      return { success: true };
    } catch (err) {
      console.error('Error deleting discussion:', err);
      return { success: false, error: err.message };
    }
  }

  return {
    discussions,
    loading,
    error,
    createDiscussion,
    upvoteDiscussion,
    downvoteDiscussion,
    deleteDiscussion,
    refetch: fetchDiscussions,
  };
}

/**
 * Custom hook to fetch a single discussion by ID
 *
 * @param {string} discussionId - Discussion ID
 * @returns {Object} - Discussion data and loading state
 */
export function useDiscussion(discussionId) {
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!discussionId) {
      setLoading(false);
      return;
    }

    fetchDiscussion();
  }, [discussionId]);

  async function fetchDiscussion() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', discussionId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setDiscussion(data);
    } catch (err) {
      console.error('Error fetching discussion:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    discussion,
    loading,
    error,
    refetch: fetchDiscussion,
  };
}

export default useDiscussions;
