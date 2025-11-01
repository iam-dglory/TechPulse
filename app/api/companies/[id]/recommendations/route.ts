import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id: companyId } = params

    // Get company data with industry info
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        *,
        industry:industries(id, name, slug)
      `)
      .eq('id', companyId)
      .single()

    if (companyError) throw companyError

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get industry averages
    const { data: industryCompanies } = await supabase
      .from('companies')
      .select('overall_score, privacy_score, transparency_score, labor_score, environment_score, community_score')
      .eq('industry_id', company.industry_id)
      .neq('id', companyId)

    const industryAvg = {
      overall: calculateAverage(industryCompanies?.map(c => c.overall_score) || []),
      privacy: calculateAverage(industryCompanies?.map(c => c.privacy_score) || []),
      transparency: calculateAverage(industryCompanies?.map(c => c.transparency_score) || []),
      labor: calculateAverage(industryCompanies?.map(c => c.labor_score) || []),
      environment: calculateAverage(industryCompanies?.map(c => c.environment_score) || []),
      community: calculateAverage(industryCompanies?.map(c => c.community_score) || [])
    }

    // Generate recommendations based on scores vs industry average
    const recommendations = generateRecommendations(company, industryAvg)

    // Check if we have existing recommendations
    const { data: existing } = await supabase
      .from('improvement_recommendations')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    // If no existing recommendations or they're old (>30 days), create new ones
    const shouldCreateNew = !existing || existing.length === 0 ||
      new Date(existing[0].created_at).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000

    if (shouldCreateNew) {
      // Delete old recommendations
      await supabase
        .from('improvement_recommendations')
        .delete()
        .eq('company_id', companyId)

      // Insert new recommendations
      for (const rec of recommendations) {
        await supabase
          .from('improvement_recommendations')
          .insert({
            company_id: companyId,
            ...rec
          })
      }
    }

    // Fetch and return recommendations
    const { data: finalRecommendations } = await supabase
      .from('improvement_recommendations')
      .select('*')
      .eq('company_id', companyId)
      .order('priority', { ascending: true })

    return NextResponse.json({
      recommendations: finalRecommendations || recommendations,
      company: {
        id: company.id,
        name: company.name,
        industry: company.industry
      },
      industryAverages: industryAvg
    })
  } catch (error: any) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 5.0
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}

function generateRecommendations(company: any, industryAvg: any): any[] {
  const recommendations: any[] = []

  const dimensions = [
    { key: 'privacy', name: 'Privacy & Data Protection' },
    { key: 'transparency', name: 'Transparency & Accountability' },
    { key: 'labor', name: 'Labor Practices & Diversity' },
    { key: 'environment', name: 'Environmental Impact' },
    { key: 'community', name: 'Community & Social Impact' }
  ]

  dimensions.forEach(dim => {
    const scoreKey = `${dim.key}_score`
    const currentScore = company[scoreKey] || 0
    const avgScore = industryAvg[dim.key] || 5.0
    const gap = avgScore - currentScore

    if (gap > 0.5) { // Only recommend if significantly below average
      const priority = gap > 2 ? 'critical' : gap > 1 ? 'high' : 'medium'
      const targetScore = Math.min(avgScore + 1, 10)
      const estimatedImpact = targetScore - currentScore

      recommendations.push({
        dimension: dim.key,
        current_score: currentScore,
        target_score: targetScore,
        priority,
        title: `Improve ${dim.name}`,
        description: `Your ${dim.key} score (${currentScore.toFixed(1)}) is below the industry average (${avgScore.toFixed(1)}). Focus on improving this dimension to match or exceed industry standards.`,
        action_items: getActionItems(dim.key),
        estimated_impact: estimatedImpact,
        estimated_timeframe: getTimeframe(estimatedImpact),
        estimated_cost: getCostEstimate(dim.key, estimatedImpact),
        resources: getResources(dim.key),
        case_studies: getCaseStudies(dim.key)
      })
    }
  })

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])

  return recommendations.slice(0, 5) // Return top 5
}

function getActionItems(dimension: string): any[] {
  const actionMap: Record<string, any[]> = {
    privacy: [
      { action: 'Conduct comprehensive privacy audit', completed: false },
      { action: 'Implement GDPR/CCPA compliance measures', completed: false },
      { action: 'Update privacy policy with clear language', completed: false },
      { action: 'Provide user data export functionality', completed: false },
      { action: 'Implement opt-out mechanisms', completed: false }
    ],
    transparency: [
      { action: 'Publish annual transparency report', completed: false },
      { action: 'Disclose data sharing partnerships', completed: false },
      { action: 'Create public-facing API documentation', completed: false },
      { action: 'Establish clear communication channels', completed: false },
      { action: 'Regular stakeholder updates', completed: false }
    ],
    labor: [
      { action: 'Conduct diversity & inclusion audit', completed: false },
      { action: 'Establish fair compensation policies', completed: false },
      { action: 'Implement flexible work arrangements', completed: false },
      { action: 'Create employee wellness programs', completed: false },
      { action: 'Regular employee satisfaction surveys', completed: false }
    ],
    environment: [
      { action: 'Calculate carbon footprint', completed: false },
      { action: 'Set net-zero emission goals', completed: false },
      { action: 'Implement renewable energy sources', completed: false },
      { action: 'Reduce single-use plastics', completed: false },
      { action: 'Partner with environmental organizations', completed: false }
    ],
    community: [
      { action: 'Launch community giving program', completed: false },
      { action: 'Support local nonprofits', completed: false },
      { action: 'Encourage employee volunteering', completed: false },
      { action: 'Create educational initiatives', completed: false },
      { action: 'Partner with community organizations', completed: false }
    ]
  }

  return actionMap[dimension] || []
}

function getTimeframe(impact: number): string {
  if (impact < 1) return '1-3 months'
  if (impact < 2) return '3-6 months'
  return '6-12 months'
}

function getCostEstimate(dimension: string, impact: number): string {
  const baseCosts: Record<string, string> = {
    privacy: 'Medium',
    transparency: 'Low',
    labor: 'Medium',
    environment: 'High',
    community: 'Low'
  }

  return baseCosts[dimension] || 'Medium'
}

function getResources(dimension: string): any[] {
  const resourceMap: Record<string, any[]> = {
    privacy: [
      { title: 'GDPR Compliance Guide', url: 'https://gdpr.eu/' },
      { title: 'Privacy Best Practices', url: 'https://iapp.org/' }
    ],
    transparency: [
      { title: 'Transparency Reporting Toolkit', url: 'https://transparencyreporting.org/' },
      { title: 'Open Data Handbook', url: 'https://opendatahandbook.org/' }
    ],
    labor: [
      { title: 'DEI Best Practices', url: 'https://www.shrm.org/' },
      { title: 'Fair Labor Standards', url: 'https://www.dol.gov/' }
    ],
    environment: [
      { title: 'Carbon Footprint Calculator', url: 'https://www.carbonfootprint.com/' },
      { title: 'Sustainability Guide', url: 'https://www.sustainability.com/' }
    ],
    community: [
      { title: 'Corporate Giving Guide', url: 'https://www.councilofnonprofits.org/' },
      { title: 'CSR Best Practices', url: 'https://www.csrwire.com/' }
    ]
  }

  return resourceMap[dimension] || []
}

function getCaseStudies(dimension: string): any[] {
  return [
    {
      company: 'Example Corp',
      improvement: '+2.5 points',
      timeframe: '6 months',
      description: `Successfully improved ${dimension} score through comprehensive initiatives`
    }
  ]
}
