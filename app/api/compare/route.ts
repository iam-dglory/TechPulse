import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { companyIds } = await request.json()

    if (!companyIds || companyIds.length < 2 || companyIds.length > 4) {
      return NextResponse.json(
        { error: 'Please provide 2-4 company IDs to compare' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch companies with their rankings
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        *,
        industry:industries(id, name, slug),
        ranking:company_rankings(overall_rank, industry_rank, ethics_percentile)
      `)
      .in('id', companyIds)

    if (error) throw error

    if (!companies || companies.length === 0) {
      return NextResponse.json(
        { error: 'No companies found' },
        { status: 404 }
      )
    }

    // Generate insights
    const insights = generateComparisonInsights(companies)

    // Save comparison history (if user is logged in)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('comparison_history').insert({
        user_id: user.id,
        company_ids: companyIds,
        comparison_data: {
          companies: companies.map(c => ({
            id: c.id,
            name: c.name,
            overall_score: c.overall_score
          })),
          timestamp: new Date().toISOString()
        }
      })
    }

    // Format response
    const formattedCompanies = companies.map(company => ({
      ...company,
      industry_rank: company.ranking?.[0]?.industry_rank || null,
      overall_rank: company.ranking?.[0]?.overall_rank || null,
      ethics_percentile: company.ranking?.[0]?.ethics_percentile || null,
      ranking: undefined
    }))

    return NextResponse.json({
      companies: formattedCompanies,
      insights,
      comparisonDate: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Comparison error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to compare companies' },
      { status: 500 }
    )
  }
}

function generateComparisonInsights(companies: any[]): string[] {
  const insights: string[] = []

  // Find best overall score
  const bestOverall = companies.reduce((best, current) =>
    current.overall_score > best.overall_score ? current : best
  )
  insights.push(
    `${bestOverall.name} has the highest overall ethics score at ${bestOverall.overall_score.toFixed(1)}/10`
  )

  // Find best in each dimension
  const dimensions = ['privacy', 'transparency', 'labor', 'environment', 'community']

  dimensions.forEach(dim => {
    const scoreKey = `${dim}_score`
    const best = companies.reduce((best, current) =>
      current[scoreKey] > best[scoreKey] ? current : best
    )
    if (best[scoreKey] > 0) {
      insights.push(
        `${best.name} leads in ${dim} with a score of ${best[scoreKey].toFixed(1)}/10`
      )
    }
  })

  // Find largest company
  const largest = companies.reduce((largest, current) =>
    (current.employee_count || 0) > (largest.employee_count || 0) ? current : largest
  )
  if (largest.employee_count) {
    insights.push(
      `${largest.name} is the largest with ${largest.employee_count.toLocaleString()} employees`
    )
  }

  // Industry diversity
  const industries = new Set(companies.map(c => c.industry?.name).filter(Boolean))
  if (industries.size > 1) {
    insights.push(
      `Companies span ${industries.size} different industries: ${Array.from(industries).join(', ')}`
    )
  }

  // Score variance
  const scores = companies.map(c => c.overall_score)
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const variance = maxScore - minScore

  if (variance > 2) {
    insights.push(
      `Significant score variance detected: ${variance.toFixed(1)} point difference between highest and lowest rated companies`
    )
  } else {
    insights.push(
      `Companies have similar ethics ratings with only ${variance.toFixed(1)} point difference`
    )
  }

  return insights.slice(0, 6) // Return top 6 insights
}
