/**
 * useGrievances Hook - Manage grievance reports
 *
 * Provides methods to create, fetch, and manage grievances
 * in the TexhPulze platform.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to manage grievances
 *
 * @param {Object} options - Query options
 * @param {string} [options.userId] - Filter by user ID
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.category] - Filter by category
 * @param {boolean} [options.realtime=false] - Enable real-time updates
 * @returns {Object} - Grievances data and methods
 */
export function useGrievances(options = {}) {
  const { user } = useAuth();
  const {
    userId = null,
    status = null,
    category = null,
    realtime = false,
  } = options;

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGrievances();

    // Set up real-time subscription if enabled
    if (realtime) {
      const channel = supabase
        .channel('grievances-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'grievances',
          },
          (payload) => {
            console.log('Grievance change:', payload);
            fetchGrievances(); // Refresh on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, status, category, realtime]);

  /**
   * Fetch grievances with filters
   */
  async function fetchGrievances() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('grievances')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setGrievances(data || []);
    } catch (err) {
      console.error('Error fetching grievances:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create new grievance
   *
   * @param {Object} grievanceData - Grievance data
   * @param {string} grievanceData.title - Grievance title
   * @param {string} grievanceData.description - Grievance description
   * @param {string} grievanceData.category - Grievance category
   * @param {string} [grievanceData.riskLevel='medium'] - Risk level
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async function createGrievance(grievanceData) {
    if (!user) {
      return { success: false, error: 'Please sign in to report a grievance' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('grievances')
        .insert({
          user_id: user.id,
          title: grievanceData.title,
          description: grievanceData.description,
          category: grievanceData.category,
          risk_level: grievanceData.riskLevel || 'medium',
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      await fetchGrievances(); // Refresh list
      return { success: true, data };
    } catch (err) {
      console.error('Error creating grievance:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Update grievance status
   *
   * @param {string} grievanceId - Grievance ID
   * @param {string} newStatus - New status
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function updateStatus(grievanceId, newStatus) {
    if (!user) {
      return { success: false, error: 'Please sign in' };
    }

    try {
      const { error: updateError } = await supabase
        .from('grievances')
        .update({ status: newStatus })
        .eq('id', grievanceId)
        .eq('user_id', user.id); // Only allow updating own grievances

      if (updateError) {
        throw updateError;
      }

      await fetchGrievances(); // Refresh list
      return { success: true };
    } catch (err) {
      console.error('Error updating grievance:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete grievance
   *
   * @param {string} grievanceId - Grievance ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function deleteGrievance(grievanceId) {
    if (!user) {
      return { success: false, error: 'Please sign in' };
    }

    try {
      const { error: deleteError } = await supabase
        .from('grievances')
        .delete()
        .eq('id', grievanceId)
        .eq('user_id', user.id); // Only allow deleting own grievances

      if (deleteError) {
        throw deleteError;
      }

      await fetchGrievances(); // Refresh list
      return { success: true };
    } catch (err) {
      console.error('Error deleting grievance:', err);
      return { success: false, error: err.message };
    }
  }

  return {
    grievances,
    loading,
    error,
    createGrievance,
    updateStatus,
    deleteGrievance,
    refetch: fetchGrievances,
  };
}

/**
 * Custom hook to fetch a single grievance by ID
 *
 * @param {string} grievanceId - Grievance ID
 * @returns {Object} - Grievance data and loading state
 */
export function useGrievance(grievanceId) {
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!grievanceId) {
      setLoading(false);
      return;
    }

    fetchGrievance();
  }, [grievanceId]);

  async function fetchGrievance() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('grievances')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', grievanceId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setGrievance(data);
    } catch (err) {
      console.error('Error fetching grievance:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    grievance,
    loading,
    error,
    refetch: fetchGrievance,
  };
}

export default useGrievances;
