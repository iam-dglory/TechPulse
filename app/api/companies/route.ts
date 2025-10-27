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
    const sort = searchParams.get('sort') || 'overall_score'

    const cacheKey = `companies:${page}:${limit}:${search}:${industry}:${sort}`

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const supabase = await createClient()
    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (industry) {
      query = query.eq('industry', industry)
    }

    // Apply sorting
    const sortOrder = sort === 'name' ? 'asc' : 'desc'
    query = query.order(sort as any, { ascending: sortOrder === 'asc' })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const response = {
      data,
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
