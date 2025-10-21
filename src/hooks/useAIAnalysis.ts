/**
 * React Hook for AI Analysis Data
 *
 * Fetches and manages AI analysis data for companies
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * AI Analysis Response Structure
 */
interface AIAnalysisResponse {
  company: {
    id: string;
    name: string;
    slug: string;
  };
  analyses: {
    transparency?: {
      score: number;
      strengths: string[];
      concerns: string[];
      summary: string;
      analyzed_at: string;
      confidence: number;
    };
    ethics?: {
      score: number;
      positive_actions: string[];
      red_flags: string[];
      recommendation: string;
      analyzed_at: string;
      confidence: number;
    };
    risk?: {
      risk_score: number;
      risk_categories: Array<{
        category: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        likelihood: 'unlikely' | 'possible' | 'likely' | 'very_likely';
      }>;
      mitigation_suggestions: string[];
      overall_assessment: string;
      monitoring_priority: 'low' | 'medium' | 'high' | 'urgent';
      analyzed_at: string;
      confidence: number;
    };
  };
  insights: {
    strengths: AIInsight[];
    concerns: AIInsight[];
    red_flags: AIInsight[];
    opportunities: AIInsight[];
    risks: AIInsight[];
    positive: AIInsight[];
  };
  stats: {
    total_analyses: number;
    total_insights: number;
    high_severity_count: number;
    avg_confidence: string | null;
    last_analyzed: string | null;
  };
  is_stale: boolean;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  confidence: number | null;
  created_at: string;
}

interface UseAIAnalysisReturn {
  data: AIAnalysisResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasAnalysis: boolean;
  isStale: boolean;
}

/**
 * Hook: useAIAnalysis
 *
 * Fetches AI analysis data for a company
 *
 * @param companyId - Company UUID
 * @param options - Hook options
 * @returns AI analysis data, loading state, and refetch function
 */
export function useAIAnalysis(
  companyId: string | null | undefined,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
): UseAIAnalysisReturn {
  const { enabled = true, refetchInterval } = options;

  const [data, setData] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!companyId || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/company/${companyId}/analysis`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch AI analysis');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('AI Analysis fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load AI analysis');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      const intervalId = setInterval(fetchAnalysis, refetchInterval);
      return () => clearInterval(intervalId);
    }
  }, [refetchInterval, enabled, fetchAnalysis]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalysis,
    hasAnalysis: data !== null && Object.keys(data.analyses).length > 0,
    isStale: data?.is_stale ?? false,
  };
}

/**
 * Hook: useAIInsights
 *
 * Extract and filter AI insights from analysis data
 *
 * @param companyId - Company UUID
 * @param insightType - Filter by insight type
 * @returns Filtered insights
 */
export function useAIInsights(
  companyId: string | null | undefined,
  insightType?: 'strengths' | 'concerns' | 'red_flags' | 'opportunities' | 'risks' | 'positive'
) {
  const { data, loading, error, refetch } = useAIAnalysis(companyId);

  const insights = data?.insights || {
    strengths: [],
    concerns: [],
    red_flags: [],
    opportunities: [],
    risks: [],
    positive: [],
  };

  const filteredInsights = insightType ? insights[insightType] : insights;

  return {
    insights: filteredInsights,
    allInsights: insights,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook: useTriggerAIAnalysis
 *
 * Trigger AI analysis for a company (admin only)
 *
 * @returns Trigger function and status
 */
export function useTriggerAIAnalysis() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const triggerAnalysis = useCallback(
    async (
      companyId: string,
      analysisTypes: ('transparency' | 'ethics' | 'risk')[]
    ) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await fetch('/api/ai/analyze-company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            company_id: companyId,
            analysis_types: analysisTypes,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to trigger AI analysis');
        }

        const result = await response.json();

        if (result.success) {
          setSuccess(true);
          return result.data;
        } else {
          throw new Error(result.message || 'Analysis failed');
        }
      } catch (err) {
        console.error('Trigger AI analysis error:', err);
        setError(err instanceof Error ? err.message : 'Failed to trigger analysis');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    triggerAnalysis,
    loading,
    error,
    success,
    reset,
  };
}
