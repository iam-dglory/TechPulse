import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { emailService } from '@/lib/emails/send'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Approve review
    const { data: review, error } = await supabase
      .from('reviews')
      .update({ status: 'approved' })
      .eq('id', params.id)
      .select('*, profiles(username, email), companies(name, slug)')
      .single()

    if (error) throw error

    // Send notification email (async - don't wait)
    if (review && review.profiles) {
      emailService.sendReviewApproved(
        review.profiles.email,
        review.profiles.username,
        review.companies.name,
        `${process.env.NEXT_PUBLIC_APP_URL}/companies/${review.companies.slug}#reviews`
      ).catch(err => console.error('[Email] Failed to send approval notification:', err))
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Admin] Error approving review:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
