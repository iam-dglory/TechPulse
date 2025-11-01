import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const preferences = await request.json()
    const supabase = await createClient()

    // Build query based on preferences
    let query = supabase
      .from('companies')
      .select(`
        *,
        industry:industries(id, name, slug),
        ranking:company_rankings(overall_rank, industry_rank)
      `)

    // Apply minimum score filter
    if (preferences.minScore) {
      query = query.gte('overall_score', preferences.minScore)
    }

    // Apply industry filter
    if (preferences.industries && preferences.industries.length > 0) {
      query = query.in('industry_id', preferences.industries)
    }

    // Apply company size filter
    if (preferences.company_sizes && preferences.company_sizes.length > 0) {
      query = query.in('company_size', preferences.company_sizes)
    }

    // Apply investor filters
    if (preferences.isInvestor) {
      if (preferences.minMarketCap) {
        query = query.gte('market_cap', preferences.minMarketCap)
      }
      if (preferences.maxMarketCap) {
        query = query.lte('market_cap', preferences.maxMarketCap)
      }
      query = query.eq('is_public', true)
    }

    // Calculate weighted score based on priorities
    const { data: companies, error } = await query.order('overall_score', { ascending: false }).limit(20)

    if (error) throw error

    // Rank companies based on user priorities
    const scoredCompanies = companies?.map(company => {
      let weightedScore = 0
      let totalWeight = 0

      const priorities = preferences.priorities || {}

      if (priorities.privacy) {
        weightedScore += company.privacy_score
        totalWeight += 1
      }
      if (priorities.transparency) {
        weightedScore += company.transparency_score
        totalWeight += 1
      }
      if (priorities.labor) {
        weightedScore += company.labor_score
        totalWeight += 1
      }
      if (priorities.environment) {
        weightedScore += company.environment_score
        totalWeight += 1
      }
      if (priorities.community) {
        weightedScore += company.community_score
        totalWeight += 1
      }

      const personalizedScore = totalWeight > 0 ? weightedScore / totalWeight : company.overall_score

      return {
        ...company,
        personalized_score: personalizedScore,
        match_percentage: Math.round((personalizedScore / 10) * 100),
        industry_rank: company.ranking?.[0]?.industry_rank || null,
        overall_rank: company.ranking?.[0]?.overall_rank || null,
        ranking: undefined
      }
    })

    // Sort by personalized score
    scoredCompanies?.sort((a, b) => b.personalized_score - a.personalized_score)

    // Save preferences if user is logged in
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('consumer_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      recommendations: scoredCompanies,
      total: scoredCompanies?.length || 0,
      preferences
    })
  } catch (error: any) {
    console.error('Discovery error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve saved preferences
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: preferences, error } = await supabase
      .from('consumer_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return NextResponse.json(preferences || {})
  } catch (error: any) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
