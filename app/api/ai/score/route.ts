import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateEthicsScore } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId } = await request.json()

    // Get company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'approved')

    if (reviewsError) {
      return NextResponse.json({ error: reviewsError.message }, { status: 500 })
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json(
        { error: 'No approved reviews found for this company' },
        { status: 400 }
      )
    }

    // Calculate AI scores
    const scores = await calculateEthicsScore({
      name: company.name,
      industry: company.industry || 'Technology',
      description: company.description || 'No description available',
      website: company.website,
      reviews: reviews.map((r) => ({
        content: r.content,
        ratings: {
          privacy: r.privacy_rating,
          transparency: r.transparency_rating,
          labor: r.labor_rating,
          environment: r.environment_rating,
          community: r.community_rating,
        },
      })),
    })

    // Update company scores
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        overall_score: scores.overall.score,
        privacy_score: scores.privacy.score,
        transparency_score: scores.transparency.score,
        labor_score: scores.labor.score,
        environment_score: scores.environment.score,
        community_score: scores.community.score,
      })
      .eq('id', companyId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(scores)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
