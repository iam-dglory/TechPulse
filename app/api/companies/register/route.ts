import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registrationSchema = z.object({
  companyName: z.string().min(2).max(100),
  website: z.string().url(),
  industry: z.string().min(2),
  description: z.string().min(50).max(1000),
  foundedYear: z.string().optional(),
  employeeCount: z.string().optional(),
  headquarters: z.string().optional(),
  contactEmail: z.string().email(),
  contactName: z.string().min(2),
  contactPosition: z.string().min(2),
  reason: z.string().min(10)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registrationSchema.parse(body)

    // Check if email is company domain (not free email)
    const emailDomain = validated.contactEmail.split('@')[1]

    const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com', 'aol.com', 'icloud.com']
    if (freeEmailProviders.includes(emailDomain.toLowerCase())) {
      return NextResponse.json(
        { error: 'Please use your company email address, not a personal email' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if company already exists
    const { data: existing } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('name', validated.companyName)
      .single()

    if (existing) {
      return NextResponse.json(
        {
          error: 'Company already exists. Please use the "Claim Company" option instead.',
          companyId: existing.id,
          companySlug: existing.slug
        },
        { status: 409 }
      )
    }

    // Generate slug
    const slug = validated.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Generate verification token
    const verificationToken = crypto.randomUUID()

    // Create pending company registration
    const { data: registration, error } = await supabase
      .from('company_registrations')
      .insert({
        company_name: validated.companyName,
        slug,
        website: validated.website,
        industry: validated.industry,
        description: validated.description,
        founded_year: validated.foundedYear ? parseInt(validated.foundedYear) : null,
        employee_count: validated.employeeCount ? parseInt(validated.employeeCount) : null,
        headquarters: validated.headquarters,
        contact_email: validated.contactEmail,
        contact_name: validated.contactName,
        contact_position: validated.contactPosition,
        reason: validated.reason,
        status: 'pending',
        verification_token: verificationToken
      })
      .select()
      .single()

    if (error) {
      console.error('Registration error:', error)
      throw new Error('Failed to create registration')
    }

    // TODO: Send verification email
    // await sendVerificationEmail(validated.contactEmail, verificationToken)

    return NextResponse.json(
      {
        message: 'Registration submitted successfully',
        registrationId: registration.id
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to submit registration' },
      { status: 500 }
    )
  }
}
