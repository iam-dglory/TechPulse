/**
 * React Hooks for News API
 */

import { useEffect, useState, useCallback } from 'react';

/**
 * News filters
 */
export interface NewsFilters {
  industry?: string;
  impact?: number;
  companyId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * News article type (matches API response)
 */
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  company_id?: string | null;
  ethics_impact?: number | null;
  source_url: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  companies?: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    logo_url?: string | null;
  } | null;
}

/**
 * Hook to fetch news articles with filters
 *
 * @param filters - Optional filters for news
 * @returns { news, loading, error, refetch }
 */
export function useNews(filters?: NewsFilters) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refetch function to manually refresh data
  const refetch = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();

        if (filters?.industry) params.append('industry', filters.industry);
        if (filters?.impact !== undefined) params.append('impact', filters.impact.toString());
        if (filters?.companyId) params.append('company_id', filters.companyId);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const queryString = params.toString();
        const url = `/api/news${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          setNews(result.data || []);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch news');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [
    filters?.industry,
    filters?.impact,
    filters?.companyId,
    filters?.search,
    filters?.limit,
    filters?.offset,
    refreshTrigger,
  ]);

  return { news, loading, error, refetch };
}
