import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const claimSchema = z.object({
  companyId: z.string().uuid(),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPosition: z.string().min(2),
  proofOfEmployment: z.string().min(10),
  additionalInfo: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = claimSchema.parse(body)

    const supabase = await createClient()

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, website, slug')
      .eq('id', validated.companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Verify email domain matches company website
    const emailDomain = validated.contactEmail.split('@')[1]
    const websiteDomain = new URL(company.website || 'https://example.com').hostname.replace('www.', '')

    // Check if email domain is related to company domain
    const domainParts = websiteDomain.split('.')
    const mainDomain = domainParts[domainParts.length - 2] + '.' + domainParts[domainParts.length - 1]

    if (!emailDomain.includes(mainDomain.split('.')[0])) {
      return NextResponse.json(
        { error: `Email domain must match company website domain (${websiteDomain})` },
        { status: 400 }
      )
    }

    // Check for existing claim
    const { data: existingClaim } = await supabase
      .from('company_claims')
      .select('id, status')
      .eq('company_id', validated.companyId)
      .eq('contact_email', validated.contactEmail)
      .single()

    if (existingClaim && existingClaim.status === 'pending') {
      return NextResponse.json(
        { error: 'You already have a pending claim for this company' },
        { status: 409 }
      )
    }

    if (existingClaim && existingClaim.status === 'approved') {
      return NextResponse.json(
        { error: 'This company has already been claimed with this email' },
        { status: 409 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID()

    // Create claim request
    const { data: claim, error: claimError } = await supabase
      .from('company_claims')
      .insert({
        company_id: validated.companyId,
        contact_name: validated.contactName,
        contact_email: validated.contactEmail,
        contact_position: validated.contactPosition,
        proof_of_employment: validated.proofOfEmployment,
        additional_info: validated.additionalInfo,
        status: 'pending',
        verification_token: verificationToken
      })
      .select()
      .single()

    if (claimError) {
      console.error('Claim error:', claimError)
      throw new Error('Failed to create claim')
    }

    // TODO: Send verification email
    // await sendClaimVerificationEmail(validated.contactEmail, company.name, verificationToken)

    return NextResponse.json(
      {
        message: 'Claim submitted successfully',
        claimId: claim.id
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Claim error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to submit claim' },
      { status: 500 }
    )
  }
}
