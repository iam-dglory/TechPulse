import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

    const { is_helpful } = await request.json()

    // Check if user already voted
    const { data: existing } = await supabase
      .from('review_votes')
      .select('id, is_helpful')
      .eq('review_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Update existing vote
      await supabase
        .from('review_votes')
        .update({ is_helpful })
        .eq('id', existing.id)
    } else {
      // Create new vote
      await supabase.from('review_votes').insert({
        review_id: params.id,
        user_id: user.id,
        is_helpful,
      })
    }

    // Update helpful count on review
    const { count } = await supabase
      .from('review_votes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', params.id)
      .eq('is_helpful', true)

    await supabase
      .from('reviews')
      .update({ helpful_count: count || 0 })
      .eq('id', params.id)

    return NextResponse.json({ success: true, helpful_count: count || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
