import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIScorer } from '@/lib/ai-scorer'

export const maxDuration = 300 // 5 minutes max (Vercel Pro limit)

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

    // Validate company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, last_scored_at')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Rate limiting: 1 score per 7 days
    if (company.last_scored_at) {
      const daysSince = (Date.now() - new Date(company.last_scored_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) {
        const nextAvailable = new Date(new Date(company.last_scored_at).getTime() + 7 * 24 * 60 * 60 * 1000)
        return NextResponse.json(
          {
            error: `Score can be refreshed every 7 days. ${Math.ceil(7 - daysSince)} days remaining.`,
            nextAvailableAt: nextAvailable.toISOString()
          },
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
        status: 'queued',
        progress: 0
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating score request:', requestError)
      throw requestError
    }

    // Start async processing
    processScoreRequest(scoreRequest.id, companyId).catch(console.error)

    return NextResponse.json({
      requestId: scoreRequest.id,
      message: 'Score calculation started',
      estimatedTime: '2-3 minutes'
    })
  } catch (error: any) {
    console.error('Request score error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function processScoreRequest(requestId: string, companyId: string) {
  try {
    const scorer = new AIScorer(requestId, companyId)
    await scorer.calculateScore()
  } catch (error: any) {
    console.error('Score processing error:', error)
  }
}
