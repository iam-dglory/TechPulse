/**
 * AI Company Analysis Retrieval API Endpoint
 *
 * GET /api/ai/company/[companyId]/analysis - Get AI analysis for a company
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  successResponse,
  notFoundResponse,
  errorResponseFromUnknown,
} from '@/lib/api-response';

/**
 * GET /api/ai/company/[companyId]/analysis
 *
 * Fetch all non-expired AI analyses and insights for a company
 *
 * @param params - Route parameters with companyId
 * @returns Combined analysis data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;

    // Validate company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return notFoundResponse('Company not found', 'Company');
    }

    // Fetch all non-expired analyses
    const { data: analyses, error: analysesError } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('company_id', companyId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (analysesError) {
      console.error('Failed to fetch AI analyses:', analysesError);
    }

    // Group analyses by type and get the latest of each
    const latestAnalyses: Record<string, any> = {};
    const seenTypes = new Set<string>();

    (analyses || []).forEach((analysis) => {
      if (!seenTypes.has(analysis.analysis_type)) {
        latestAnalyses[analysis.analysis_type] = {
          ...analysis.analysis_data,
          score: analysis.score,
          confidence: analysis.confidence,
          analyzed_at: analysis.analyzed_at,
          expires_at: analysis.expires_at,
        };
        seenTypes.add(analysis.analysis_type);
      }
    });

    // Fetch AI insights
    const { data: insights, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (insightsError) {
      console.error('Failed to fetch AI insights:', insightsError);
    }

    // Group insights by type
    const groupedInsights: Record<string, any[]> = {
      strengths: [],
      concerns: [],
      red_flags: [],
      opportunities: [],
      risks: [],
      positive: [],
    };

    (insights || []).forEach((insight) => {
      const key = insight.insight_type === 'strength' ? 'strengths' :
                  insight.insight_type === 'concern' ? 'concerns' :
                  insight.insight_type === 'red_flag' ? 'red_flags' :
                  insight.insight_type === 'opportunity' ? 'opportunities' :
                  insight.insight_type === 'risk' ? 'risks' :
                  'positive';

      if (groupedInsights[key]) {
        groupedInsights[key].push({
          id: insight.id,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          source: insight.source,
          confidence: insight.confidence,
          created_at: insight.created_at,
        });
      }
    });

    // Calculate summary statistics
    const stats = {
      total_analyses: Object.keys(latestAnalyses).length,
      total_insights: (insights || []).length,
      high_severity_count: (insights || []).filter(
        (i) => i.severity === 'high' || i.severity === 'critical'
      ).length,
      avg_confidence: analyses && analyses.length > 0
        ? (analyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / analyses.length).toFixed(2)
        : null,
      last_analyzed: analyses && analyses.length > 0
        ? analyses[0].analyzed_at
        : null,
    };

    // Check if data is stale (older than 7 days)
    const isStale = analyses && analyses.length > 0
      ? new Date(analyses[0].analyzed_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : true;

    return successResponse(
      {
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
        },
        analyses: latestAnalyses,
        insights: groupedInsights,
        stats,
        is_stale: isStale,
      },
      200,
      'AI analysis data retrieved successfully'
    );
  } catch (error) {
    console.error(`GET /api/ai/company/${params.companyId}/analysis error:`, error);
    return errorResponseFromUnknown(error);
  }
}
