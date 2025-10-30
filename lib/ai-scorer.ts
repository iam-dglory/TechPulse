import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface CompanyData {
  id: string
  name: string
  industry: string
  description: string
  website?: string
  founded_year?: number
  employee_count?: number
}

interface Review {
  content: string
  title: string
  overall_rating: number
  privacy_rating?: number
  transparency_rating?: number
  labor_rating?: number
  environment_rating?: number
  community_rating?: number
  reviewer_type: string
  created_at: string
}

interface DataSource {
  type: string
  content: string
  url?: string
  relevance: number
  credibility: number
}

interface DimensionScore {
  score: number
  reasoning: string
  evidence: Array<{
    type: 'positive' | 'negative' | 'neutral'
    text: string
    source: string
    weight: number
  }>
  confidence: 'high' | 'medium' | 'low'
  dataPoints: number
}

interface EthicsScore {
  overall: DimensionScore
  privacy: DimensionScore
  transparency: DimensionScore
  labor: DimensionScore
  environment: DimensionScore
  community: DimensionScore
  methodology: string
  calculatedAt: string
  dataQuality: {
    reviewCount: number
    dataSourceCount: number
    confidenceLevel: 'high' | 'medium' | 'low'
    completeness: number
  }
  metadata: {
    modelVersion: string
    tokensUsed: number
    processingTimeMs: number
    retryCount: number
  }
}

export class AIScorer {
  private requestId: string
  private companyId: string
  private supabase: any

  constructor(requestId: string, companyId: string) {
    this.requestId = requestId
    this.companyId = companyId
  }

  async initialize() {
    this.supabase = await createClient()
  }

  async log(level: string, message: string, details?: any) {
    try {
      await this.supabase.from('calculation_logs').insert({
        score_request_id: this.requestId,
        log_level: level,
        message,
        details: details || null
      })
    } catch (error) {
      console.error('Logging error:', error)
    }
  }

  async updateProgress(progress: number, step: string) {
    try {
      await this.supabase
        .from('score_requests')
        .update({
          progress,
          current_step: step,
          ...(progress === 0 && { started_at: new Date().toISOString() })
        })
        .eq('id', this.requestId)

      await this.log('info', `Progress: ${progress}% - ${step}`)
    } catch (error) {
      console.error('Progress update error:', error)
    }
  }

  async calculateScore(): Promise<EthicsScore> {
    const startTime = Date.now()
    let retryCount = 0
    const MAX_RETRIES = 3

    try {
      await this.initialize()
      await this.updateProgress(0, 'Initializing...')

      // Step 1: Gather company data (10%)
      await this.updateProgress(10, 'Gathering company data...')
      const company = await this.getCompanyData()
      await this.log('info', 'Company data loaded', { companyName: company.name })

      // Step 2: Collect reviews (20%)
      await this.updateProgress(20, 'Analyzing user reviews...')
      const reviews = await this.getReviews()
      await this.log('info', `Loaded ${reviews.length} reviews`)

      // Step 3: Collect additional data sources (30%)
      await this.updateProgress(30, 'Collecting data sources...')
      const dataSources = await this.getDataSources()
      await this.log('info', `Loaded ${dataSources.length} data sources`)

      // Step 4: Calculate scores with AI (40-80%)
      await this.updateProgress(40, 'AI analysis in progress...')

      let scores: EthicsScore | null = null
      while (retryCount < MAX_RETRIES && !scores) {
        try {
          scores = await this.performAIAnalysis(company, reviews, dataSources, startTime, retryCount)
          await this.updateProgress(80, 'Analysis complete!')
        } catch (error: any) {
          retryCount++
          await this.log('warning', `AI analysis attempt ${retryCount} failed`, { error: error.message })

          if (retryCount >= MAX_RETRIES) {
            await this.log('warning', 'Using fallback calculation method')
            scores = await this.fallbackCalculation(company, reviews, dataSources, startTime)
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          }
        }
      }

      if (!scores) {
        throw new Error('Failed to calculate scores after all retries')
      }

      // Step 5: Store evidence (90%)
      await this.updateProgress(90, 'Storing evidence...')
      await this.storeEvidence(scores)

      // Step 6: Save results (95%)
      await this.updateProgress(95, 'Saving results...')
      await this.saveResults(scores, Date.now() - startTime)

      // Step 7: Complete (100%)
      await this.updateProgress(100, 'Complete!')
      await this.log('info', 'Score calculation completed successfully')

      return scores
    } catch (error: any) {
      await this.log('error', 'Fatal error in score calculation', {
        error: error.message,
        stack: error.stack
      })

      await this.supabase
        .from('score_requests')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
          processing_duration_ms: Date.now() - startTime
        })
        .eq('id', this.requestId)

      throw error
    }
  }

  private async getCompanyData(): Promise<CompanyData> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', this.companyId)
      .single()

    if (error) throw new Error(`Failed to load company: ${error.message}`)
    return data
  }

  private async getReviews(): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('company_id', this.companyId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      await this.log('warning', 'Failed to load reviews', { error: error.message })
      return []
    }

    return data || []
  }

  private async getDataSources(): Promise<DataSource[]> {
    const { data, error } = await this.supabase
      .from('company_data_sources')
      .select('*')
      .eq('company_id', this.companyId)
      .order('relevance_score', { ascending: false })
      .limit(50)

    if (error) {
      await this.log('warning', 'Failed to load data sources', { error: error.message })
      return []
    }

    return (data || []).map((d: any) => ({
      type: d.source_type,
      content: d.content,
      url: d.source_url,
      relevance: d.relevance_score || 0.5,
      credibility: d.credibility_score || 0.5
    }))
  }

  private async performAIAnalysis(
    company: CompanyData,
    reviews: Review[],
    dataSources: DataSource[],
    startTime: number,
    retryCount: number
  ): Promise<EthicsScore> {
    await this.updateProgress(45, 'Running AI analysis (1/3)...')

    const prompt = this.buildPrompt(company, reviews, dataSources)

    await this.updateProgress(60, 'Running AI analysis (2/3)...')

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are the world's leading ESG analyst with 20 years of experience. Return ONLY valid JSON, no markdown.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    })

    await this.updateProgress(75, 'Processing AI results...')

    const content = response.choices[0].message.content
    if (!content) throw new Error('Empty AI response')

    const parsed = JSON.parse(content)

    const scores = this.validateAndTransformScores(parsed, {
      modelVersion: 'gpt-4-turbo-preview',
      tokensUsed: response.usage?.total_tokens || 0,
      processingTimeMs: Date.now() - startTime,
      retryCount
    })

    return scores
  }

  private buildPrompt(company: CompanyData, reviews: Review[], dataSources: DataSource[]): string {
    const reviewSummary = reviews.length > 0
      ? reviews.slice(0, 20).map((r, i) => `
Review ${i + 1} (${r.reviewer_type}, ${new Date(r.created_at).toLocaleDateString()}):
Title: ${r.title || 'No title'}
Content: ${r.content.substring(0, 500)}
Ratings: Overall=${r.overall_rating}/5, Privacy=${r.privacy_rating || 'N/A'}/5, Transparency=${r.transparency_rating || 'N/A'}/5, Labor=${r.labor_rating || 'N/A'}/5
      `).join('\n---\n')
      : 'No reviews available.'

    return `ANALYZE COMPANY ETHICS - RETURN ONLY VALID JSON:

COMPANY: ${company.name}
Industry: ${company.industry}
Description: ${company.description}
${company.website ? `Website: ${company.website}` : ''}

USER REVIEWS (${reviews.length} total):
${reviewSummary}

SCORING SCALE (0-10):
- 0-2: Critical failures
- 3-4: Significant problems
- 5-6: Average (MOST COMPANIES)
- 7-8: Good practices
- 9-10: Exceptional

RETURN THIS EXACT JSON STRUCTURE:
{
  "overall": {
    "score": 6.5,
    "reasoning": "2-3 sentences",
    "evidence": [
      {"type": "positive", "text": "fact", "source": "Review #1", "weight": 0.5}
    ],
    "confidence": "medium",
    "dataPoints": ${reviews.length}
  },
  "privacy": {...same structure...},
  "transparency": {...same structure...},
  "labor": {...same structure...},
  "environment": {...same structure...},
  "community": {...same structure...},
  "methodology": "Explanation of calculation",
  "dataQuality": {
    "reviewCount": ${reviews.length},
    "dataSourceCount": ${dataSources.length},
    "confidenceLevel": "medium",
    "completeness": 75
  }
}`
  }

  private validateAndTransformScores(parsed: any, metadata: any): EthicsScore {
    const dimensions = ['overall', 'privacy', 'transparency', 'labor', 'environment', 'community']

    for (const dim of dimensions) {
      if (!parsed[dim]) throw new Error(`Missing dimension: ${dim}`)
      if (typeof parsed[dim].score !== 'number') throw new Error(`Invalid score for ${dim}`)
      if (parsed[dim].score < 0 || parsed[dim].score > 10) throw new Error(`Score out of range for ${dim}`)

      parsed[dim].score = Math.round(parsed[dim].score * 10) / 10
    }

    return {
      ...parsed,
      calculatedAt: new Date().toISOString(),
      metadata
    }
  }

  private async fallbackCalculation(
    company: CompanyData,
    reviews: Review[],
    dataSources: DataSource[],
    startTime: number
  ): Promise<EthicsScore> {
    if (reviews.length === 0) {
      return this.generateNeutralScores(company, startTime)
    }

    const avgScores = {
      privacy: this.average(reviews.map(r => r.privacy_rating || 3)) * 2,
      transparency: this.average(reviews.map(r => r.transparency_rating || 3)) * 2,
      labor: this.average(reviews.map(r => r.labor_rating || 3)) * 2,
      environment: this.average(reviews.map(r => r.environment_rating || 3)) * 2,
      community: this.average(reviews.map(r => r.community_rating || 3)) * 2
    }

    const overall = Object.values(avgScores).reduce((a, b) => a + b, 0) / 5

    return {
      overall: {
        score: this.round(overall),
        reasoning: 'Calculated from user review averages using fallback method.',
        evidence: [
          { type: 'neutral', text: `Based on ${reviews.length} user reviews`, source: 'User reviews', weight: 1.0 }
        ],
        confidence: reviews.length >= 10 ? 'medium' : 'low',
        dataPoints: reviews.length
      },
      privacy: this.createDimensionScore(avgScores.privacy, 'Privacy', reviews.length),
      transparency: this.createDimensionScore(avgScores.transparency, 'Transparency', reviews.length),
      labor: this.createDimensionScore(avgScores.labor, 'Labor', reviews.length),
      environment: this.createDimensionScore(avgScores.environment, 'Environment', reviews.length),
      community: this.createDimensionScore(avgScores.community, 'Community', reviews.length),
      methodology: 'Fallback calculation based on user review averages',
      calculatedAt: new Date().toISOString(),
      dataQuality: {
        reviewCount: reviews.length,
        dataSourceCount: dataSources.length,
        confidenceLevel: reviews.length >= 10 ? 'medium' : 'low',
        completeness: Math.min(100, (reviews.length / 20) * 100)
      },
      metadata: {
        modelVersion: 'fallback-v1',
        tokensUsed: 0,
        processingTimeMs: Date.now() - startTime,
        retryCount: 3
      }
    }
  }

  private generateNeutralScores(company: CompanyData, startTime: number): EthicsScore {
    const neutralScore = 5.0
    const createNeutral = (dimension: string): DimensionScore => ({
      score: neutralScore,
      reasoning: `Insufficient data to evaluate ${dimension}. Neutral score assigned.`,
      evidence: [
        { type: 'neutral', text: 'No user reviews available', source: 'System', weight: 0 }
      ],
      confidence: 'low',
      dataPoints: 0
    })

    return {
      overall: createNeutral('overall ethics'),
      privacy: createNeutral('privacy'),
      transparency: createNeutral('transparency'),
      labor: createNeutral('labor'),
      environment: createNeutral('environment'),
      community: createNeutral('community'),
      methodology: 'Neutral scores assigned due to insufficient data',
      calculatedAt: new Date().toISOString(),
      dataQuality: {
        reviewCount: 0,
        dataSourceCount: 0,
        confidenceLevel: 'low',
        completeness: 0
      },
      metadata: {
        modelVersion: 'neutral-fallback-v1',
        tokensUsed: 0,
        processingTimeMs: Date.now() - startTime,
        retryCount: 0
      }
    }
  }

  private createDimensionScore(score: number, dimension: string, reviewCount: number): DimensionScore {
    return {
      score: this.round(score),
      reasoning: `Based on user review ratings for ${dimension.toLowerCase()}.`,
      evidence: [
        { type: 'neutral', text: `Average rating from ${reviewCount} reviews`, source: 'User reviews', weight: 1.0 }
      ],
      confidence: reviewCount >= 10 ? 'medium' : 'low',
      dataPoints: reviewCount
    }
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 3
    return numbers.reduce((a, b) => a + b, 0) / numbers.length
  }

  private round(num: number): number {
    return Math.round(num * 10) / 10
  }

  private async storeEvidence(scores: EthicsScore) {
    const dimensions = ['overall', 'privacy', 'transparency', 'labor', 'environment', 'community']
    const evidenceRows = []

    for (const dim of dimensions) {
      const dimScore = scores[dim as keyof typeof scores] as DimensionScore
      if (dimScore.evidence) {
        for (const evidence of dimScore.evidence) {
          evidenceRows.push({
            score_request_id: this.requestId,
            dimension: dim,
            evidence_type: evidence.type,
            evidence_text: evidence.text,
            source_reference: evidence.source,
            weight: evidence.weight
          })
        }
      }
    }

    if (evidenceRows.length > 0) {
      await this.supabase.from('score_evidence').insert(evidenceRows)
    }
  }

  private async saveResults(scores: EthicsScore, processingTime: number) {
    await this.supabase
      .from('score_requests')
      .update({
        status: 'completed',
        progress: 100,
        overall_score: scores.overall.score,
        privacy_score: scores.privacy.score,
        transparency_score: scores.transparency.score,
        labor_score: scores.labor.score,
        environment_score: scores.environment.score,
        community_score: scores.community.score,
        score_breakdown: scores,
        data_sources: {
          reviewCount: scores.dataQuality.reviewCount,
          dataSourceCount: scores.dataQuality.dataSourceCount
        },
        calculation_metadata: scores.metadata,
        completed_at: new Date().toISOString(),
        processing_duration_ms: processingTime,
        tokens_used: scores.metadata.tokensUsed,
        cost_usd: (scores.metadata.tokensUsed / 1000) * 0.01
      })
      .eq('id', this.requestId)
  }
}
