import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCached, setCache } from '@/lib/redis'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cacheKey = `company:${params.id}`

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Cache for 10 minutes
    await setCache(cacheKey, data, 600)

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('companies')
      .update(body)
      .eq('slug', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('slug', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
