import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters, page = 1, limit = 12 } = body

    let supabaseQuery = supabase
      .from('companies')
      .select('*', { count: 'exact' })

    // Text search
    if (query && query.trim()) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,industry.ilike.%${query}%,target_users.ilike.%${query}%`)
    }

    // Industry filter
    if (filters?.industry && filters.industry.length > 0) {
      supabaseQuery = supabaseQuery.in('industry', filters.industry)
    }

    // Ethics score range
    if (filters?.ethicsScoreMin !== undefined) {
      supabaseQuery = supabaseQuery.gte('ethics_score', filters.ethicsScoreMin)
    }
    if (filters?.ethicsScoreMax !== undefined) {
      supabaseQuery = supabaseQuery.lte('ethics_score', filters.ethicsScoreMax)
    }

    // Funding stage filter
    if (filters?.fundingStage && filters.fundingStage.length > 0) {
      supabaseQuery = supabaseQuery.in('funding_stage', filters.fundingStage)
    }

    // Verified filter
    if (filters?.verified !== undefined) {
      supabaseQuery = supabaseQuery.eq('verified', filters.verified)
    }

    // Pagination
    const offset = (page - 1) * limit
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

    // Sorting
    const sortBy = filters?.sortBy || 'created_at'
    const sortOrder = filters?.sortOrder || 'desc'
    supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data: companies, error, count } = await supabaseQuery

    if (error) {
      console.error('Error searching companies:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}








