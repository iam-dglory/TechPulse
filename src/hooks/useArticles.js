/**
 * useArticles Hook - Fetch and manage articles from Supabase
 *
 * Provides a simple interface to fetch articles with filtering,
 * pagination, and real-time updates.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Custom hook to fetch articles
 *
 * @param {Object} options - Query options
 * @param {string} [options.category] - Filter by category
 * @param {number} [options.limit=10] - Number of articles to fetch
 * @param {boolean} [options.realtime=false] - Enable real-time updates
 * @returns {Object} - Articles data and loading state
 */
export function useArticles(options = {}) {
  const {
    category = null,
    limit = 10,
    realtime = false,
  } = options;

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();

    // Set up real-time subscription if enabled
    if (realtime) {
      const channel = supabase
        .channel('articles-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'articles',
          },
          (payload) => {
            console.log('Article change:', payload);
            fetchArticles(); // Refresh articles on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [category, limit, realtime]);

  async function fetchArticles() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      // Apply category filter if provided
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    articles,
    loading,
    error,
    refetch: fetchArticles,
  };
}

/**
 * Custom hook to fetch a single article by ID
 *
 * @param {string} articleId - Article ID
 * @returns {Object} - Article data and loading state
 */
export function useArticle(articleId) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      return;
    }

    fetchArticle();
  }, [articleId]);

  async function fetchArticle() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setArticle(data);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    article,
    loading,
    error,
    refetch: fetchArticle,
  };
}

export default useArticles;
