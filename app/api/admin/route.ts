import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function verifyAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { authorized: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
    return { authorized: false, error: 'Forbidden' }
  }

  return { authorized: true }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const resource = searchParams.get('resource') || 'reviews'
  const status = searchParams.get('status')
  const reviewId = searchParams.get('reviewId')

  const supabase = await createClient()
  const auth = await verifyAdmin(supabase)

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 })
  }

  if (resource === 'reviews') {
    let query = supabase
      .from('reviews')
      .select('*, profiles(username, avatar_url), companies(name)')

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  }

  if (resource === 'stats') {
    const [
      { count: totalCompanies },
      { count: totalReviews },
      { count: pendingReviews }
    ] = await Promise.all([
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ])

    return NextResponse.json({
      totalCompanies: totalCompanies || 0,
      totalReviews: totalReviews || 0,
      pendingReviews: pendingReviews || 0
    })
  }

  return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const reviewId = searchParams.get('reviewId')

  const supabase = await createClient()
  const auth = await verifyAdmin(supabase)

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 })
  }

  if (!reviewId) {
    return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
  }

  if (action === 'approve') {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'approved', moderated_at: new Date().toISOString() })
      .eq('id', reviewId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  if (action === 'reject') {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'rejected', moderated_at: new Date().toISOString() })
      .eq('id', reviewId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
