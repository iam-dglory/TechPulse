import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateEthicsScore } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId } = await request.json()

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check rate limit (7 days)
    const { data: lastRequest } = await supabase
      .from('score_requests')
      .select('created_at, status')
      .eq('company_id', companyId)
      .in('status', ['completed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastRequest) {
      const daysSinceLastScore = (Date.now() - new Date(lastRequest.created_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastScore < 7) {
        return NextResponse.json(
          { error: `Score can be refreshed every 7 days. ${Math.ceil(7 - daysSinceLastScore)} days remaining.` },
          { status: 429 }
        )
      }
    }

    // Create score request
    const { data: scoreRequest, error: requestError } = await supabase
      .from('score_requests')
      .insert({
        company_id: companyId,
        requested_by: user.id,
        status: 'processing'
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating score request:', requestError)
      throw new Error('Failed to create score request')
    }

    // Start async scoring (in background)
    // Don't await this - let it run in background
    processScoring(scoreRequest.id, companyId).catch(console.error)

    return NextResponse.json({
      requestId: scoreRequest.id,
      message: 'Score calculation started'
    })
  } catch (error: any) {
    console.error('Request score error:', error)
    return NextResponse.json({ error: error.message || 'Failed to request score' }, { status: 500 })
  }
}

async function processScoring(requestId: string, companyId: string) {
  const supabase = await createClient()

  try {
    // Get company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      throw new Error('Company not found')
    }

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'approved')

    // Calculate scores using AI
    const scores = await calculateEthicsScore({
      name: company.name,
      industry: company.industry || 'Technology',
      description: company.description || 'No description available',
      website: company.website,
      reviews: reviews?.map(r => ({
        content: r.content,
        ratings: {
          privacy: r.privacy_rating,
          transparency: r.transparency_rating,
          labor: r.labor_rating,
          environment: r.environment_rating,
          community: r.community_rating
        }
      })) || []
    })

    // Update company scores
    await supabase
      .from('companies')
      .update({
        overall_score: scores.overall.score,
        privacy_score: scores.privacy.score,
        transparency_score: scores.transparency.score,
        labor_score: scores.labor.score,
        environment_score: scores.environment.score,
        community_score: scores.community.score,
        last_scored_at: new Date().toISOString()
      })
      .eq('id', companyId)

    // Update request status
    await supabase
      .from('score_requests')
      .update({
        status: 'completed',
        scores: scores,
        completed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    console.log(`Successfully completed scoring for request ${requestId}`)
  } catch (error: any) {
    console.error('Error processing scoring:', error)

    // Update request status to failed
    await supabase
      .from('score_requests')
      .update({
        status: 'failed',
        error_message: error.message || 'Scoring failed',
        completed_at: new Date().toISOString()
      })
      .eq('id', requestId)
  }
}
