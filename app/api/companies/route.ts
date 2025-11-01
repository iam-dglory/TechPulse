import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCached, setCache } from '@/lib/redis'
import { generateSlug } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Handle verify action (GET /api/companies?action=verify&token=XXX)
    if (action === 'verify') {
      return handleVerify(request)
    }

    // Default: list companies
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const industry = searchParams.get('industry')
    const size = searchParams.get('size')
    const minScore = parseFloat(searchParams.get('minScore') || '0')
    const sortBy = searchParams.get('sortBy') || 'score'

    const cacheKey = `companies:${page}:${limit}:${search}:${industry}:${size}:${minScore}:${sortBy}`

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const supabase = await createClient()
    let query = supabase
      .from('companies')
      .select(`
        *,
        industry:industries(id, name, slug),
        ranking:company_rankings(overall_rank, industry_rank)
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (industry && industry !== 'all') {
      query = query.eq('industry_id', industry)
    }
    if (size && size !== 'all') {
      query = query.eq('company_size', size)
    }
    if (minScore > 0) {
      query = query.gte('overall_score', minScore)
    }

    // Apply sorting
    let sortColumn = 'overall_score'
    let sortOrder: 'asc' | 'desc' = 'desc'

    switch (sortBy) {
      case 'score':
        sortColumn = 'overall_score'
        sortOrder = 'desc'
        break
      case 'reviews':
        sortColumn = 'review_count'
        sortOrder = 'desc'
        break
      case 'trending':
        sortColumn = 'follower_count'
        sortOrder = 'desc'
        break
      case 'name':
        sortColumn = 'name'
        sortOrder = 'asc'
        break
      case 'size':
        sortColumn = 'employee_count'
        sortOrder = 'desc'
        break
      case 'revenue':
        sortColumn = 'revenue'
        sortOrder = 'desc'
        break
    }

    query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format data to include ranking as direct properties
    const formattedData = data?.map(company => ({
      ...company,
      industry_rank: company.ranking?.[0]?.industry_rank || null,
      overall_rank: company.ranking?.[0]?.overall_rank || null,
      ranking: undefined
    }))

    const response = {
      data: formattedData,
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
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Route to specific handlers based on action
    if (action === 'claim') {
      return handleClaim(request)
    }
    if (action === 'register') {
      return handleRegister(request)
    }
    if (action === 'request') {
      return handleRequest(request)
    }

    // Default: create company
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

// Handler Functions
async function handleClaim(request: Request) {
  const body = await request.json()
  const supabase = await createClient()

  const { companyId, contactName, contactEmail, contactPosition, proofOfEmployment, additionalInfo } = body

  if (!companyId || !contactEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const verificationToken = crypto.randomUUID()

  const { data: claim, error } = await supabase
    .from('company_claims')
    .insert({
      company_id: companyId,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_position: contactPosition,
      proof_of_employment: proofOfEmployment,
      additional_info: additionalInfo,
      status: 'pending',
      verification_token: verificationToken
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Claim submitted successfully',
    claimId: claim.id
  }, { status: 201 })
}

async function handleRegister(request: Request) {
  const body = await request.json()
  const supabase = await createClient()

  const { companyName, website, industry, description, contactEmail, contactName, contactPosition, reason } = body

  if (!companyName || !website || !contactEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const slug = generateSlug(companyName)
  const verificationToken = crypto.randomUUID()

  const { data: registration, error } = await supabase
    .from('company_registrations')
    .insert({
      company_name: companyName,
      slug,
      website,
      industry,
      description,
      contact_email: contactEmail,
      contact_name: contactName,
      contact_position: contactPosition,
      reason,
      status: 'pending',
      verification_token: verificationToken
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Registration submitted successfully',
    registrationId: registration.id
  }, { status: 201 })
}

async function handleRequest(request: Request) {
  const body = await request.json()
  const supabase = await createClient()

  const { name, website, industry, description, requesterEmail } = body

  if (!name || !website || !requesterEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const slug = generateSlug(name)

  const { data: newCompany, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Company request submitted successfully',
    company: {
      id: newCompany.id,
      name: newCompany.name,
      slug: newCompany.slug
    }
  })
}

async function handleVerify(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const supabase = await createClient()

  if (!token || !type) {
    return NextResponse.json({ error: 'Missing token or type' }, { status: 400 })
  }

  if (type === 'registration') {
    const { data: registration } = await supabase
      .from('company_registrations')
      .select('*')
      .eq('verification_token', token)
      .eq('status', 'pending')
      .single()

    if (!registration) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
    }

    await supabase
      .from('company_registrations')
      .update({ verified_at: new Date().toISOString(), status: 'approved' })
      .eq('id', registration.id)

    await supabase
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

    return NextResponse.json({
      message: 'Registration verified successfully',
      companySlug: registration.slug
    })
  }

  if (type === 'claim') {
    const { data: claim } = await supabase
      .from('company_claims')
      .select('*, companies(name, slug)')
      .eq('verification_token', token)
      .eq('status', 'pending')
      .single()

    if (!claim) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
    }

    await supabase
      .from('company_claims')
      .update({ verified_at: new Date().toISOString(), status: 'approved' })
      .eq('id', claim.id)

    return NextResponse.json({
      message: 'Claim verified successfully',
      companySlug: claim.companies?.slug
    })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
