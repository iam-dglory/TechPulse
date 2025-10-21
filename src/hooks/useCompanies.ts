/**
 * React Hooks for Companies API
 */

import { useEffect, useState } from 'react';

/**
 * Company filters
 */
export interface CompanyFilters {
  query?: string;
  industry?: string;
  scoreMin?: number;
  scoreMax?: number;
  verificationTier?: string;
  sort?: 'score' | 'trending' | 'recent' | 'name';
  limit?: number;
  offset?: number;
}

/**
 * Company type (matches API response)
 */
export interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  website?: string | null;
  description: string;
  founded_year: number;
  headquarters: string;
  employee_count?: number | null;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
  company_scores?: {
    overall_score: number;
    ethics_score: number;
    credibility_score: number;
    delivery_score: number;
    security_score: number;
    innovation_score: number;
    growth_rate?: number | null;
    verification_tier: string;
  } | null;
}

/**
 * Company with full details (from single company endpoint)
 */
export interface CompanyDetail extends Company {
  promises?: any[];
  votes?: any[];
}

/**
 * Hook to fetch companies with filters
 *
 * @param filters - Optional filters for companies
 * @returns { companies, loading, error }
 */
export function useCompanies(filters?: CompanyFilters) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();

        if (filters?.query) params.append('query', filters.query);
        if (filters?.industry) params.append('industry', filters.industry);
        if (filters?.scoreMin !== undefined) params.append('score_min', filters.scoreMin.toString());
        if (filters?.scoreMax !== undefined) params.append('score_max', filters.scoreMax.toString());
        if (filters?.verificationTier) params.append('verification_tier', filters.verificationTier);
        if (filters?.sort) params.append('sort', filters.sort);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const queryString = params.toString();
        const url = `/api/companies${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch companies: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          setCompanies(result.data || []);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch companies');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [
    filters?.query,
    filters?.industry,
    filters?.scoreMin,
    filters?.scoreMax,
    filters?.verificationTier,
    filters?.sort,
    filters?.limit,
    filters?.offset,
  ]);

  return { companies, loading, error };
}

/**
 * Hook to fetch single company by slug
 *
 * @param slug - Company slug
 * @returns { company, loading, error }
 */
export function useCompany(slug: string) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if slug exists
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/companies/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Company not found');
          }
          throw new Error(`Failed to fetch company: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          setCompany(result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch company');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  return { company, loading, error };
}
