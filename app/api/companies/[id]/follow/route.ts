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

    // Get company by slug
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', params.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('user_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', company.id)
      .single()

    if (existing) {
      // Unfollow
      await supabase
        .from('user_follows')
        .delete()
        .eq('id', existing.id)

      // Decrement follower count
      await supabase.rpc('decrement_follower_count', { company_id: company.id })

      return NextResponse.json({ following: false })
    } else {
      // Follow
      await supabase
        .from('user_follows')
        .insert({
          user_id: user.id,
          company_id: company.id,
        })

      // Increment follower count
      await supabase.rpc('increment_follower_count', { company_id: company.id })

      return NextResponse.json({ following: true })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
