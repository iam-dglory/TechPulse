/**
 * useFavorites Hook - Manage user's favorite articles
 *
 * Provides methods to add, remove, and check favorite articles
 * for the authenticated user.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to manage favorites
 *
 * @returns {Object} - Favorites data and methods
 */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  /**
   * Fetch user's favorites
   */
  async function fetchFavorites() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select(`
          id,
          article_id,
          created_at,
          articles (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setFavorites(data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Add article to favorites
   *
   * @param {string} articleId - Article ID to favorite
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function addFavorite(articleId) {
    if (!user) {
      return { success: false, error: 'Please sign in to add favorites' };
    }

    try {
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          article_id: articleId,
        });

      if (insertError) {
        throw insertError;
      }

      await fetchFavorites(); // Refresh favorites
      return { success: true };
    } catch (err) {
      console.error('Error adding favorite:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Remove article from favorites
   *
   * @param {string} articleId - Article ID to unfavorite
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function removeFavorite(articleId) {
    if (!user) {
      return { success: false, error: 'Please sign in' };
    }

    try {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (deleteError) {
        throw deleteError;
      }

      await fetchFavorites(); // Refresh favorites
      return { success: true };
    } catch (err) {
      console.error('Error removing favorite:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Toggle favorite status
   *
   * @param {string} articleId - Article ID to toggle
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function toggleFavorite(articleId) {
    if (isFavorite(articleId)) {
      return await removeFavorite(articleId);
    } else {
      return await addFavorite(articleId);
    }
  }

  /**
   * Check if article is favorited
   *
   * @param {string} articleId - Article ID to check
   * @returns {boolean}
   */
  function isFavorite(articleId) {
    return favorites.some((fav) => fav.article_id === articleId);
  }

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
}

export default useFavorites;
