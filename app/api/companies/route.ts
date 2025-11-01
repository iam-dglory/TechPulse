import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCached, setCache } from '@/lib/redis'
import { generateSlug } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const industry = searchParams.get('industry')
    const size = searchParams.get('size')
    const minScore = parseFloat(searchParams.get('minScore') || '0')
    const sortBy = searchParams.get('sortBy') || 'score'

    const cacheKey = `companies:${page}:${limit}:${search}:${industry}:${size}:${minScore}:${sortBy}`

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const supabase = await createClient()
    let query = supabase
      .from('companies')
      .select(`
        *,
        industry:industries(id, name, slug),
        ranking:company_rankings(overall_rank, industry_rank)
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (industry && industry !== 'all') {
      query = query.eq('industry_id', industry)
    }
    if (size && size !== 'all') {
      query = query.eq('company_size', size)
    }
    if (minScore > 0) {
      query = query.gte('overall_score', minScore)
    }

    // Apply sorting
    let sortColumn = 'overall_score'
    let sortOrder: 'asc' | 'desc' = 'desc'

    switch (sortBy) {
      case 'score':
        sortColumn = 'overall_score'
        sortOrder = 'desc'
        break
      case 'reviews':
        sortColumn = 'review_count'
        sortOrder = 'desc'
        break
      case 'trending':
        sortColumn = 'follower_count'
        sortOrder = 'desc'
        break
      case 'name':
        sortColumn = 'name'
        sortOrder = 'asc'
        break
      case 'size':
        sortColumn = 'employee_count'
        sortOrder = 'desc'
        break
      case 'revenue':
        sortColumn = 'revenue'
        sortOrder = 'desc'
        break
    }

    query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format data to include ranking as direct properties
    const formattedData = data?.map(company => ({
      ...company,
      industry_rank: company.ranking?.[0]?.industry_rank || null,
      overall_rank: company.ranking?.[0]?.overall_rank || null,
      ranking: undefined
    }))

    const response = {
      data: formattedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    }

    // Cache for 5 minutes
    await setCache(cacheKey, response, 300)

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const slug = generateSlug(body.name)

    const { data, error } = await supabase
      .from('companies')
      .insert({
        ...body,
        slug,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
