import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface CompanyData {
  name: string
  industry: string
  description: string
  website?: string
  reviews: Array<{
    content: string
    ratings: {
      privacy: number
      transparency: number
      labor: number
      environment: number
      community: number
    }
  }>
}

interface DimensionScore {
  score: number
  reasoning: string
  evidence: string[]
  confidence: 'high' | 'medium' | 'low'
}

interface EthicsScore {
  overall: DimensionScore
  privacy: DimensionScore
  transparency: DimensionScore
  labor: DimensionScore
  environment: DimensionScore
  community: DimensionScore
  methodology: string
  dataQuality: {
    reviewCount: number
    dataPoints: number
    confidence: string
  }
}

export async function calculateEthicsScore(company: CompanyData): Promise<EthicsScore> {
  // Prepare context from reviews
  const reviewSummary = company.reviews.length > 0
    ? company.reviews.map((r, i) => `
Review ${i + 1}:
Content: ${r.content}
Privacy Rating: ${r.ratings.privacy}/5
Transparency Rating: ${r.ratings.transparency}/5
Labor Rating: ${r.ratings.labor}/5
Environment Rating: ${r.ratings.environment}/5
Community Rating: ${r.ratings.community}/5
    `).join('\n---\n')
    : 'No reviews available yet.'

  const prompt = `You are an ESG (Environmental, Social, Governance) analyst specializing in technology company ethics evaluation.

COMPANY TO ANALYZE:
Name: ${company.name}
Industry: ${company.industry}
Description: ${company.description}
${company.website ? `Website: ${company.website}` : ''}

USER REVIEWS (${company.reviews.length} total):
${reviewSummary}

YOUR TASK:
Analyze this company's ethics across 5 dimensions using the 0-10 scale below. Base your analysis on:
1. The user reviews provided
2. General knowledge about this company (if you have any)
3. Industry standards and best practices
4. Known public information about the company

SCORING SCALE (0-10):
0-2: Critical issues, major violations, systemic problems
3-4: Significant concerns, multiple negative indicators
5-6: Average, meets minimum standards, some concerns
7-8: Good practices, exceeds standards, minor issues only
9-10: Exceptional, industry leader, best-in-class practices

IMPORTANT CALIBRATION RULES:
- Most companies should score between 5-7 (average to good)
- Scores below 5 should be rare and well-justified
- Scores above 8 should be exceptional and evidence-based
- If insufficient data, score conservatively (5-6 range) with low confidence
- Weight user reviews heavily when available
- Consider industry context (different standards for different sectors)

ANALYZE EACH DIMENSION:

1. PRIVACY & DATA PROTECTION (0-10)
   Consider: data collection practices, user consent, transparency in data usage, security measures, GDPR/CCPA compliance, data breaches history

2. TRANSPARENCY & ACCOUNTABILITY (0-10)
   Consider: public reporting, governance structure, stakeholder communication, audit practices, admission of mistakes, leadership accountability

3. LABOR PRACTICES & DIVERSITY (0-10)
   Consider: employee treatment, work-life balance, compensation, diversity initiatives, inclusion programs, harassment policies, union relations

4. ENVIRONMENTAL IMPACT (0-10)
   Consider: carbon footprint, renewable energy usage, waste management, sustainability initiatives, environmental certifications, climate commitments

5. COMMUNITY & SOCIAL IMPACT (0-10)
   Consider: social responsibility programs, charitable giving, community engagement, ethical AI practices, accessibility, digital divide initiatives

FOR EACH DIMENSION, PROVIDE:
- score (number 0-10, one decimal place)
- reasoning (2-3 sentences explaining the score)
- evidence (list of 3-5 specific facts or observations that justify the score)
- confidence (high/medium/low based on available data)

ALSO CALCULATE:
- overall: weighted average of all dimensions with overall reasoning
- methodology: brief explanation of how you calculated these scores
- dataQuality: assessment of the data available

CRITICAL: Return valid JSON only, no markdown or code blocks. Structure:
{
  "overall": {
    "score": 7.2,
    "reasoning": "...",
    "evidence": ["...", "..."],
    "confidence": "medium"
  },
  "privacy": { "score": 7.5, "reasoning": "...", "evidence": ["..."], "confidence": "high" },
  "transparency": { "score": 7.0, "reasoning": "...", "evidence": ["..."], "confidence": "medium" },
  "labor": { "score": 6.8, "reasoning": "...", "evidence": ["..."], "confidence": "high" },
  "environment": { "score": 7.5, "reasoning": "...", "evidence": ["..."], "confidence": "medium" },
  "community": { "score": 7.0, "reasoning": "...", "evidence": ["..."], "confidence": "medium" },
  "methodology": "Scores calculated using weighted analysis of user reviews, public information, and industry benchmarks. User reviews weighted 60%, public knowledge 30%, industry standards 10%.",
  "dataQuality": {
    "reviewCount": ${company.reviews.length},
    "dataPoints": 5,
    "confidence": "medium"
  }
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ESG analyst with 15 years of experience evaluating technology companies. You provide objective, evidence-based ethics scores. You are known for calibrated, realistic scoring - not overly harsh or generous.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('No response from AI')

    const scores = JSON.parse(content) as EthicsScore

    // Validation: ensure all scores are within 0-10 range
    const dimensions = ['overall', 'privacy', 'transparency', 'labor', 'environment', 'community'] as const
    for (const dim of dimensions) {
      if (scores[dim].score < 0 || scores[dim].score > 10) {
        throw new Error(`Invalid score for ${dim}: ${scores[dim].score}`)
      }
      // Round to 1 decimal place
      scores[dim].score = Math.round(scores[dim].score * 10) / 10
    }

    return scores
  } catch (error: any) {
    console.error('AI scoring error:', error)

    // Fallback: calculate simple average from reviews if AI fails
    if (company.reviews.length > 0) {
      const avgScores = {
        privacy: company.reviews.reduce((sum, r) => sum + r.ratings.privacy, 0) / company.reviews.length * 2,
        transparency: company.reviews.reduce((sum, r) => sum + r.ratings.transparency, 0) / company.reviews.length * 2,
        labor: company.reviews.reduce((sum, r) => sum + r.ratings.labor, 0) / company.reviews.length * 2,
        environment: company.reviews.reduce((sum, r) => sum + r.ratings.environment, 0) / company.reviews.length * 2,
        community: company.reviews.reduce((sum, r) => sum + r.ratings.community, 0) / company.reviews.length * 2,
      }

      const overall = Object.values(avgScores).reduce((sum, score) => sum + score, 0) / 5

      return {
        overall: {
          score: Math.round(overall * 10) / 10,
          reasoning: 'Score calculated from user reviews only due to AI processing error.',
          evidence: [`Based on ${company.reviews.length} user reviews`],
          confidence: 'medium'
        },
        privacy: {
          score: Math.round(avgScores.privacy * 10) / 10,
          reasoning: 'Based on user review ratings',
          evidence: ['User feedback aggregated'],
          confidence: 'medium'
        },
        transparency: {
          score: Math.round(avgScores.transparency * 10) / 10,
          reasoning: 'Based on user review ratings',
          evidence: ['User feedback aggregated'],
          confidence: 'medium'
        },
        labor: {
          score: Math.round(avgScores.labor * 10) / 10,
          reasoning: 'Based on user review ratings',
          evidence: ['User feedback aggregated'],
          confidence: 'medium'
        },
        environment: {
          score: Math.round(avgScores.environment * 10) / 10,
          reasoning: 'Based on user review ratings',
          evidence: ['User feedback aggregated'],
          confidence: 'medium'
        },
        community: {
          score: Math.round(avgScores.community * 10) / 10,
          reasoning: 'Based on user review ratings',
          evidence: ['User feedback aggregated'],
          confidence: 'medium'
        },
        methodology: 'Fallback calculation based on user review averages',
        dataQuality: {
          reviewCount: company.reviews.length,
          dataPoints: 1,
          confidence: 'low'
        }
      }
    }

    throw new Error('Unable to calculate ethics score: ' + error.message)
  }
}

// Helper function to validate and sanitize AI output
function validateScoreResponse(data: any): EthicsScore {
  const dimensions = ['overall', 'privacy', 'transparency', 'labor', 'environment', 'community']

  for (const dim of dimensions) {
    if (!data[dim]) {
      throw new Error(`Missing dimension: ${dim}`)
    }
    if (typeof data[dim].score !== 'number') {
      throw new Error(`Invalid score type for ${dim}`)
    }
    if (data[dim].score < 0 || data[dim].score > 10) {
      throw new Error(`Score out of range for ${dim}: ${data[dim].score}`)
    }
    if (!data[dim].reasoning || !data[dim].evidence || !data[dim].confidence) {
      throw new Error(`Missing required fields for ${dim}`)
    }
  }

  return data as EthicsScore
}
