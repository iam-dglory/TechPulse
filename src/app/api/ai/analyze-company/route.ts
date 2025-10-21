/**
 * AI Company Analysis API Endpoint
 *
 * POST /api/ai/analyze-company - Trigger AI analysis for a company
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, requireAdmin } from '@/lib/auth/middleware';
import {
  successResponse,
  validationErrorResponse,
  errorResponseFromUnknown,
  parseRequestBody,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/ai/openai-client';
import {
  analyzeCompanyTransparency,
  analyzeCompanyEthics,
  generateCompanyRiskReport,
} from '@/lib/ai/analyzer';

/**
 * POST /api/ai/analyze-company
 *
 * Trigger AI analysis for a company (admin only)
 *
 * Request Body:
 * - company_id: UUID of the company
 * - analysis_types: Array of analysis types to run
 *   ['transparency', 'ethics', 'risk']
 *
 * @returns Analysis results
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAdmin();

    // Parse request body
    const body = await parseRequestBody(request);
    const { company_id, analysis_types } = body;

    // Validation
    if (!company_id) {
      return validationErrorResponse([
        { field: 'company_id', message: 'Company ID is required' },
      ]);
    }

    if (!analysis_types || !Array.isArray(analysis_types) || analysis_types.length === 0) {
      return validationErrorResponse([
        { field: 'analysis_types', message: 'Analysis types array is required' },
      ]);
    }

    const validTypes = ['transparency', 'ethics', 'risk'];
    const invalidTypes = analysis_types.filter((type: string) => !validTypes.includes(type));

    if (invalidTypes.length > 0) {
      return validationErrorResponse([
        {
          field: 'analysis_types',
          message: `Invalid analysis types: ${invalidTypes.join(', ')}. Valid types: ${validTypes.join(', ')}`,
        },
      ]);
    }

    // Rate limiting (10 companies per hour per user)
    const rateLimitKey = `ai-analyze:${user.id}`;
    if (!checkRateLimit(rateLimitKey, 10, 60 * 60 * 1000)) {
      return validationErrorResponse([
        {
          field: 'rate_limit',
          message: 'Rate limit exceeded. Maximum 10 company analyses per hour.',
        },
      ]);
    }

    // Fetch company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      return validationErrorResponse([
        { field: 'company_id', message: 'Company not found' },
      ]);
    }

    // Run analyses
    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};

    for (const analysisType of analysis_types) {
      try {
        switch (analysisType) {
          case 'transparency':
            results.transparency = await analyzeCompanyTransparency({
              id: company.id,
              name: company.name,
              description: company.description,
              website: company.website,
              industry: company.industry,
              founded_year: company.founded_year,
            });
            break;

          case 'ethics':
            // Fetch recent news for ethics analysis
            const { data: news } = await supabase
              .from('news')
              .select('title, content, published_at')
              .eq('company_id', company.id)
              .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
              .order('published_at', { ascending: false })
              .limit(10);

            results.ethics = await analyzeCompanyEthics(
              {
                id: company.id,
                name: company.name,
                description: company.description,
                industry: company.industry,
              },
              news || []
            );
            break;

          case 'risk':
            results.risk = await generateCompanyRiskReport(company.id);
            break;
        }
      } catch (error) {
        console.error(`Failed to run ${analysisType} analysis:`, error);
        errors[analysisType] = error instanceof Error ? error.message : 'Analysis failed';
      }
    }

    // Generate insights from analyses
    const insights: any[] = [];

    // Generate insights from transparency analysis
    if (results.transparency) {
      const trans = results.transparency;

      // Add strengths as insights
      trans.strengths?.forEach((strength: string) => {
        insights.push({
          company_id,
          insight_type: 'strength',
          title: 'Transparency Strength',
          description: strength,
          severity: 'low',
          source: 'ai_transparency_analysis',
          confidence: 0.85,
        });
      });

      // Add concerns as insights
      trans.concerns?.forEach((concern: string) => {
        insights.push({
          company_id,
          insight_type: 'concern',
          title: 'Transparency Concern',
          description: concern,
          severity: trans.score < 5 ? 'high' : 'medium',
          source: 'ai_transparency_analysis',
          confidence: 0.85,
        });
      });
    }

    // Generate insights from ethics analysis
    if (results.ethics) {
      const eth = results.ethics;

      eth.positive_actions?.forEach((action: string) => {
        insights.push({
          company_id,
          insight_type: 'positive',
          title: 'Positive Ethical Action',
          description: action,
          severity: 'low',
          source: 'ai_ethics_analysis',
          confidence: 0.80,
        });
      });

      eth.red_flags?.forEach((flag: string) => {
        insights.push({
          company_id,
          insight_type: 'red_flag',
          title: 'Ethical Red Flag',
          description: flag,
          severity: 'high',
          source: 'ai_ethics_analysis',
          confidence: 0.80,
        });
      });
    }

    // Generate insights from risk analysis
    if (results.risk) {
      const risk = results.risk;

      risk.risk_categories?.forEach((category: any) => {
        insights.push({
          company_id,
          insight_type: 'risk',
          title: `${category.category.charAt(0).toUpperCase() + category.category.slice(1)} Risk`,
          description: category.description,
          severity: category.severity,
          source: 'ai_risk_analysis',
          confidence: 0.85,
        });
      });
    }

    // Store insights in database
    if (insights.length > 0) {
      const { error: insightsError } = await supabase
        .from('ai_insights')
        .insert(insights);

      if (insightsError) {
        console.error('Failed to store AI insights:', insightsError);
      }
    }

    return successResponse(
      {
        analyses: results,
        insights: insights.length,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      },
      200,
      'AI analysis completed successfully'
    );
  } catch (error) {
    console.error('POST /api/ai/analyze-company error:', error);
    return errorResponseFromUnknown(error);
  }
}
