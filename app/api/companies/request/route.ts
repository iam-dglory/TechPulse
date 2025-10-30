import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, website, industry, description, requesterEmail } = body

    // Validate required fields
    if (!name || !website || !industry || !requesterEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create slug from company name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if company already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('slug', slug)
      .maybeSingle()

    if (existingCompany) {
      return NextResponse.json(
        {
          error: 'Company already exists',
          companySlug: existingCompany.slug,
          companyName: existingCompany.name
        },
        { status: 409 }
      )
    }

    // Insert company request (you'll need to create this table or store it differently)
    // For now, let's directly create the company with default scores
    const { data: newCompany, error: insertError } = await supabase
      .from('companies')
      .insert({
        name,
        slug,
        website,
        industry,
        description: description || `${name} is a company in the ${industry} industry.`,
        overall_score: 0,
        privacy_score: 0,
        transparency_score: 0,
        labor_score: 0,
        environment_score: 0,
        community_score: 0,
        review_count: 0,
        follower_count: 0,
        is_verified: false,
        requester_email: requesterEmail
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating company:', insertError)
      return NextResponse.json(
        { error: 'Failed to create company request' },
        { status: 500 }
      )
    }

    // TODO: Send email notification to requester
    // TODO: Queue background job to score the company

    return NextResponse.json({
      success: true,
      message: 'Company request submitted successfully',
      company: {
        id: newCompany.id,
        name: newCompany.name,
        slug: newCompany.slug
      }
    })
  } catch (error: any) {
    console.error('Company request error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
