import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const type = searchParams.get('type') // 'registration' or 'claim'

    if (!token || !type) {
      return NextResponse.json(
        { error: 'Missing token or type parameter' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (type === 'registration') {
      // Verify registration token
      const { data: registration, error } = await supabase
        .from('company_registrations')
        .select('*')
        .eq('verification_token', token)
        .eq('status', 'pending')
        .single()

      if (error || !registration) {
        return NextResponse.json(
          { error: 'Invalid or expired verification token' },
          { status: 404 }
        )
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('company_registrations')
        .update({
          verified_at: new Date().toISOString(),
          status: 'approved'
        })
        .eq('id', registration.id)

      if (updateError) throw updateError

      // Create company profile
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          name: registration.company_name,
          slug: registration.slug,
          website: registration.website,
          industry: registration.industry,
          description: registration.description,
          overall_score: 5.0,
          privacy_score: 5.0,
          transparency_score: 5.0,
          labor_score: 5.0,
          environment_score: 5.0,
          community_score: 5.0
        })

      if (companyError) throw companyError

      return NextResponse.json({
        message: 'Registration verified successfully',
        companySlug: registration.slug
      })

    } else if (type === 'claim') {
      // Verify claim token
      const { data: claim, error } = await supabase
        .from('company_claims')
        .select('*, companies(name, slug)')
        .eq('verification_token', token)
        .eq('status', 'pending')
        .single()

      if (error || !claim) {
        return NextResponse.json(
          { error: 'Invalid or expired verification token' },
          { status: 404 }
        )
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('company_claims')
        .update({
          verified_at: new Date().toISOString(),
          status: 'approved'
        })
        .eq('id', claim.id)

      if (updateError) throw updateError

      // TODO: Grant user admin access to company profile
      // This would require linking claim to user account

      return NextResponse.json({
        message: 'Claim verified successfully',
        companySlug: claim.companies?.slug
      })
    }

    return NextResponse.json(
      { error: 'Invalid verification type' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
