/**
 * AI Analysis Functions for TexhPulze
 *
 * Core AI analysis logic using OpenAI GPT-4
 */

import { openai, withRetry, estimateCost, logAICall } from './openai-client';
import {
  TRANSPARENCY_ANALYSIS_PROMPT,
  ETHICS_EVALUATION_PROMPT,
  PROMISE_TRACKING_PROMPT,
  NEWS_SENTIMENT_PROMPT,
  RISK_ASSESSMENT_PROMPT,
  COMPREHENSIVE_ANALYSIS_PROMPT,
  buildCompanyContext,
  buildPromiseContext,
  buildNewsContext,
} from './prompts';
import { supabase } from '../supabase';

/**
 * Model configuration
 */
const DEFAULT_MODEL = 'gpt-4-turbo-preview';
const DEFAULT_TEMPERATURE = 0.3; // Lower for more consistent, factual responses
const DEFAULT_MAX_TOKENS = 2000;

/**
 * Parse JSON response with error handling
 */
function parseAIResponse<T>(response: string, context: string): T {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }

    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error(`Failed to parse AI response for ${context}:`, response);
    throw new Error(`Invalid JSON response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Store AI analysis in database
 */
async function storeAnalysis(params: {
  company_id: string;
  analysis_type: string;
  analysis_data: any;
  score?: number;
  confidence?: number;
  expires_at?: Date;
}): Promise<void> {
  const expiresAt = params.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default

  const { error } = await supabase.from('ai_analyses').insert({
    company_id: params.company_id,
    analysis_type: params.analysis_type,
    analysis_data: params.analysis_data,
    score: params.score,
    confidence: params.confidence,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('Failed to store AI analysis:', error);
    throw error;
  }
}

/**
 * Transparency Analysis Types
 */
export interface TransparencyAnalysis {
  score: number;
  strengths: string[];
  concerns: string[];
  summary: string;
}

/**
 * Analyze Company Transparency
 *
 * @param companyData - Company information
 * @returns Transparency analysis
 */
export async function analyzeCompanyTransparency(companyData: {
  id: string;
  name: string;
  description: string;
  website?: string;
  industry: string;
  founded_year?: number;
}): Promise<TransparencyAnalysis> {
  const startTime = Date.now();

  try {
    const context = buildCompanyContext(companyData);

    const response = await withRetry(
      async () =>
        await openai.chat.completions.create({
          model: DEFAULT_MODEL,
          temperature: DEFAULT_TEMPERATURE,
          max_tokens: DEFAULT_MAX_TOKENS,
          messages: [
            { role: 'system', content: TRANSPARENCY_ANALYSIS_PROMPT },
            { role: 'user', content: context },
          ],
          response_format: { type: 'json_object' },
        }),
      'Transparency Analysis'
    );

    const content = response.choices[0].message.content || '{}';
    const analysis = parseAIResponse<TransparencyAnalysis>(content, 'transparency');

    // Calculate cost
    const cost = estimateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      DEFAULT_MODEL
    );

    // Log API call
    await logAICall({
      analysisType: 'transparency',
      companyId: companyData.id,
      success: true,
      cost,
      duration: Date.now() - startTime,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
    });

    // Store in database
    await storeAnalysis({
      company_id: companyData.id,
      analysis_type: 'transparency',
      analysis_data: analysis,
      score: analysis.score,
      confidence: 0.85, // High confidence for structured analysis
    });

    return analysis;
  } catch (error) {
    await logAICall({
      analysisType: 'transparency',
      companyId: companyData.id,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Ethics Analysis Types
 */
export interface EthicsAnalysis {
  score: number;
  positive_actions: string[];
  red_flags: string[];
  recommendation: string;
}

/**
 * Analyze Company Ethics
 *
 * @param companyData - Company information
 * @param recentNews - Recent news articles
 * @returns Ethics analysis
 */
export async function analyzeCompanyEthics(
  companyData: {
    id: string;
    name: string;
    description: string;
    industry: string;
  },
  recentNews: Array<{ title: string; content: string; published_at: string }>
): Promise<EthicsAnalysis> {
  const startTime = Date.now();

  try {
    const context = buildCompanyContext({
      ...companyData,
      recent_news: recentNews,
    });

    const response = await withRetry(
      async () =>
        await openai.chat.completions.create({
          model: DEFAULT_MODEL,
          temperature: DEFAULT_TEMPERATURE,
          max_tokens: DEFAULT_MAX_TOKENS,
          messages: [
            { role: 'system', content: ETHICS_EVALUATION_PROMPT },
            { role: 'user', content: context },
          ],
          response_format: { type: 'json_object' },
        }),
      'Ethics Analysis'
    );

    const content = response.choices[0].message.content || '{}';
    const analysis = parseAIResponse<EthicsAnalysis>(content, 'ethics');

    const cost = estimateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      DEFAULT_MODEL
    );

    await logAICall({
      analysisType: 'ethics',
      companyId: companyData.id,
      success: true,
      cost,
      duration: Date.now() - startTime,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
    });

    await storeAnalysis({
      company_id: companyData.id,
      analysis_type: 'ethics',
      analysis_data: analysis,
      score: analysis.score,
      confidence: 0.80,
    });

    return analysis;
  } catch (error) {
    await logAICall({
      analysisType: 'ethics',
      companyId: companyData.id,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Promise Analysis Types
 */
export interface PromiseAnalysis {
  verdict: 'kept' | 'broken' | 'partial';
  confidence: number;
  reasoning: string;
  impact_score: number;
  evidence_quality: 'high' | 'medium' | 'low';
}

/**
 * Analyze Promise Delivery
 *
 * @param promise - Promise data
 * @param actualOutcome - What actually happened
 * @returns Promise analysis
 */
export async function analyzePromiseDelivery(
  promise: {
    id: string;
    company_id: string;
    promise_text: string;
    promised_date: string;
    deadline_date: string;
    status: string;
    source_url: string;
  },
  actualOutcome?: string
): Promise<PromiseAnalysis> {
  const startTime = Date.now();

  try {
    const context = buildPromiseContext({
      ...promise,
      actual_outcome: actualOutcome,
    });

    const response = await withRetry(
      async () =>
        await openai.chat.completions.create({
          model: DEFAULT_MODEL,
          temperature: 0.2, // Even lower for factual promise checking
          max_tokens: 1500,
          messages: [
            { role: 'system', content: PROMISE_TRACKING_PROMPT },
            { role: 'user', content: context },
          ],
          response_format: { type: 'json_object' },
        }),
      'Promise Analysis'
    );

    const content = response.choices[0].message.content || '{}';
    const analysis = parseAIResponse<PromiseAnalysis>(content, 'promise');

    const cost = estimateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      DEFAULT_MODEL
    );

    await logAICall({
      analysisType: 'promise',
      companyId: promise.company_id,
      success: true,
      cost,
      duration: Date.now() - startTime,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
    });

    await storeAnalysis({
      company_id: promise.company_id,
      analysis_type: 'promise',
      analysis_data: { ...analysis, promise_id: promise.id },
      score: analysis.impact_score,
      confidence: analysis.confidence / 100,
    });

    return analysis;
  } catch (error) {
    await logAICall({
      analysisType: 'promise',
      companyId: promise.company_id,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * News Sentiment Types
 */
export interface NewsSentiment {
  sentiment: 'positive' | 'negative' | 'neutral';
  impact_score: number;
  key_points: string[];
  summary: string;
  ethics_impact: 'positive' | 'negative' | 'neutral' | 'none';
  credibility: 'high' | 'medium' | 'low';
}

/**
 * Analyze News Sentiment
 *
 * @param newsArticle - News article data
 * @returns Sentiment analysis
 */
export async function analyzeNewsSentiment(newsArticle: {
  id: string;
  company_id?: string;
  title: string;
  content: string;
  source_url: string;
  published_at: string;
  company_name?: string;
}): Promise<NewsSentiment> {
  const startTime = Date.now();

  try {
    const context = buildNewsContext({
      title: newsArticle.title,
      content: newsArticle.content,
      source: newsArticle.source_url,
      published_at: newsArticle.published_at,
      company_name: newsArticle.company_name,
    });

    const response = await withRetry(
      async () =>
        await openai.chat.completions.create({
          model: DEFAULT_MODEL,
          temperature: 0.3,
          max_tokens: 1000,
          messages: [
            { role: 'system', content: NEWS_SENTIMENT_PROMPT },
            { role: 'user', content: context },
          ],
          response_format: { type: 'json_object' },
        }),
      'News Sentiment Analysis'
    );

    const content = response.choices[0].message.content || '{}';
    const analysis = parseAIResponse<NewsSentiment>(content, 'news sentiment');

    const cost = estimateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      DEFAULT_MODEL
    );

    await logAICall({
      analysisType: 'news_sentiment',
      companyId: newsArticle.company_id,
      success: true,
      cost,
      duration: Date.now() - startTime,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
    });

    if (newsArticle.company_id) {
      await storeAnalysis({
        company_id: newsArticle.company_id,
        analysis_type: 'news',
        analysis_data: { ...analysis, news_id: newsArticle.id },
        score: analysis.impact_score,
        confidence: 0.75,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for news
      });
    }

    return analysis;
  } catch (error) {
    await logAICall({
      analysisType: 'news_sentiment',
      companyId: newsArticle.company_id,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Risk Assessment Types
 */
export interface RiskCategory {
  category: 'regulatory' | 'reputational' | 'operational' | 'financial' | 'technology' | 'competitive' | 'leadership';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  likelihood: 'unlikely' | 'possible' | 'likely' | 'very_likely';
}

export interface RiskAssessment {
  risk_score: number;
  risk_categories: RiskCategory[];
  mitigation_suggestions: string[];
  overall_assessment: string;
  monitoring_priority: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Generate Company Risk Report
 *
 * @param companyId - Company ID
 * @returns Risk assessment
 */
export async function generateCompanyRiskReport(companyId: string): Promise<RiskAssessment> {
  const startTime = Date.now();

  try {
    // Fetch comprehensive company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        company_scores (*),
        promises (*),
        votes (*)
      `)
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('Company not found');
    }

    // Fetch recent news
    const { data: news } = await supabase
      .from('news')
      .select('title, content, published_at')
      .eq('company_id', companyId)
      .order('published_at', { ascending: false })
      .limit(10);

    const context = buildCompanyContext({
      name: company.name,
      description: company.description,
      industry: company.industry,
      website: company.website,
      founded_year: company.founded_year,
      employee_count: company.employee_count,
      recent_news: news || [],
      scores: company.company_scores,
      promises: company.promises,
    });

    const response = await withRetry(
      async () =>
        await openai.chat.completions.create({
          model: DEFAULT_MODEL,
          temperature: 0.4,
          max_tokens: 2500,
          messages: [
            { role: 'system', content: RISK_ASSESSMENT_PROMPT },
            { role: 'user', content: context },
          ],
          response_format: { type: 'json_object' },
        }),
      'Risk Assessment'
    );

    const content = response.choices[0].message.content || '{}';
    const analysis = parseAIResponse<RiskAssessment>(content, 'risk assessment');

    const cost = estimateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      DEFAULT_MODEL
    );

    await logAICall({
      analysisType: 'risk',
      companyId,
      success: true,
      cost,
      duration: Date.now() - startTime,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
    });

    await storeAnalysis({
      company_id: companyId,
      analysis_type: 'risk',
      analysis_data: analysis,
      score: analysis.risk_score,
      confidence: 0.85,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return analysis;
  } catch (error) {
    await logAICall({
      analysisType: 'risk',
      companyId,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
