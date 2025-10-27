import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface Review {
  content: string
  ratings: {
    privacy?: number
    transparency?: number
    labor?: number
    environment?: number
    community?: number
  }
}

interface Company {
  name: string
  description?: string
  industry?: string
  reviews: Review[]
}

interface EthicsScore {
  score: number
  reasoning: string
}

interface EthicsScoreResponse {
  overall: EthicsScore
  privacy: EthicsScore
  transparency: EthicsScore
  labor: EthicsScore
  environment: EthicsScore
  community: EthicsScore
}

export async function calculateEthicsScore(company: Company): Promise<EthicsScoreResponse> {
  const reviewsSummary = company.reviews
    .map((r, i) => `Review ${i + 1}: ${r.content.slice(0, 200)}... (Ratings: Privacy: ${r.ratings.privacy || 'N/A'}, Transparency: ${r.ratings.transparency || 'N/A'}, Labor: ${r.ratings.labor || 'N/A'}, Environment: ${r.ratings.environment || 'N/A'}, Community: ${r.ratings.community || 'N/A'})`)
    .join('\n\n')

  const prompt = `Analyze ${company.name}'s ethics based on ${company.reviews.length} user reviews.

Company: ${company.name}
Industry: ${company.industry || 'Unknown'}
Description: ${company.description || 'Not provided'}

Reviews Summary:
${reviewsSummary}

Provide comprehensive ethics scores (0-10 scale) for:
1. Privacy & Data Protection
2. Transparency & Accountability
3. Labor Practices & Diversity
4. Environmental Impact
5. Community & Social Impact
6. Overall Ethics Score

For each dimension, provide:
- A score (0-10, where 10 is best)
- Brief reasoning (2-3 sentences)

Return as JSON in this exact format:
{
  "overall": { "score": 8.5, "reasoning": "..." },
  "privacy": { "score": 9.0, "reasoning": "..." },
  "transparency": { "score": 8.5, "reasoning": "..." },
  "labor": { "score": 8.0, "reasoning": "..." },
  "environment": { "score": 8.2, "reasoning": "..." },
  "community": { "score": 9.0, "reasoning": "..." }
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ESG (Environmental, Social, Governance) analyst specializing in technology company ethics. Analyze companies objectively based on available data.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('No response from OpenAI')

    return JSON.parse(content)
  } catch (error) {
    console.error('Error calculating ethics score:', error)
    // Return default scores if AI fails
    return {
      overall: { score: 5.0, reasoning: 'Unable to calculate score at this time' },
      privacy: { score: 5.0, reasoning: 'Insufficient data' },
      transparency: { score: 5.0, reasoning: 'Insufficient data' },
      labor: { score: 5.0, reasoning: 'Insufficient data' },
      environment: { score: 5.0, reasoning: 'Insufficient data' },
      community: { score: 5.0, reasoning: 'Insufficient data' },
    }
  }
}
