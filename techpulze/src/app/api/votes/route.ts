import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { VoteType } from '@/types/database'

/**
 * POST /api/votes
 *
 * Submit or update user votes for a company across multiple dimensions.
 * Supports upsert - will update existing votes or create new ones.
 *
 * Request Body:
 * {
 *   votes: Array<{
 *     company_id: string
 *     vote_type: VoteType
 *     score: number (1-10)
 *     comment?: string
 *     evidence_urls?: string[]
 *   }>
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   votes: Vote[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to vote.' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse request body
    const body = await request.json()
    const { votes } = body

    if (!votes || !Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. "votes" array is required.' },
        { status: 400 }
      )
    }

    // Validate each vote
    const validVoteTypes: VoteType[] = ['ethics', 'credibility', 'delivery', 'security', 'innovation']

    for (const vote of votes) {
      if (!vote.company_id || typeof vote.company_id !== 'string') {
        return NextResponse.json(
          { error: 'Invalid vote: company_id is required' },
          { status: 400 }
        )
      }

      if (!vote.vote_type || !validVoteTypes.includes(vote.vote_type)) {
        return NextResponse.json(
          { error: `Invalid vote_type. Must be one of: ${validVoteTypes.join(', ')}` },
          { status: 400 }
        )
      }

      if (typeof vote.score !== 'number' || vote.score < 1 || vote.score > 10) {
        return NextResponse.json(
          { error: 'Invalid score. Must be a number between 1 and 10' },
          { status: 400 }
        )
      }

      // Validate comment length
      if (vote.comment && vote.comment.length > 500) {
        return NextResponse.json(
          { error: 'Comment must be 500 characters or less' },
          { status: 400 }
        )
      }

      // Validate evidence URLs
      if (vote.evidence_urls && Array.isArray(vote.evidence_urls)) {
        for (const url of vote.evidence_urls) {
          try {
            new URL(url) // Validate URL format
          } catch {
            return NextResponse.json(
              { error: `Invalid evidence URL: ${url}` },
              { status: 400 }
            )
          }
        }
      }
    }

    // Get user profile to determine vote weight
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('reputation_score, is_expert')
      .eq('id', userId)
      .single()

    // Calculate vote weight based on reputation
    let weight = 1.0
    if (userProfile) {
      const reputation = userProfile.reputation_score || 0
      if (reputation >= 100) weight = 2.0
      else if (reputation >= 50) weight = 1.5
      else if (reputation >= 20) weight = 1.2

      // Expert bonus
      if (userProfile.is_expert) weight *= 1.5

      // Cap at 3.0
      weight = Math.min(weight, 3.0)
    }

    // Prepare votes for upsert
    const votesData = votes.map(vote => ({
      user_id: userId,
      company_id: vote.company_id,
      vote_type: vote.vote_type,
      score: vote.score,
      weight,
      comment: vote.comment || null,
      evidence_urls: vote.evidence_urls || [],
    }))

    // Upsert votes (update if exists, insert if not)
    const { data: insertedVotes, error: upsertError } = await supabase
      .from('votes')
      .upsert(votesData, {
        onConflict: 'user_id,company_id,vote_type',
        ignoreDuplicates: false,
      })
      .select()

    if (upsertError) {
      console.error('Vote upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to submit votes. Please try again.' },
        { status: 500 }
      )
    }

    // The database function `calculate_weighted_vote_score()` and `recalculate_company_score()`
    // will automatically trigger via database triggers to update company scores

    // Track user activity
    await supabase.from('user_activity').insert({
      user_id: userId,
      activity_type: 'view_company', // You might want to add a 'vote' type
      item_type: 'company',
      item_id: votes[0].company_id,
      metadata: {
        action: 'submitted_votes',
        dimensions: votes.map(v => v.vote_type),
        vote_count: votes.length,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Votes submitted successfully',
      votes: insertedVotes,
      weight,
    })

  } catch (error) {
    console.error('Vote submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/votes?company_id=xxx&user_id=xxx
 *
 * Retrieve votes for a company, optionally filtered by user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    const userId = searchParams.get('user_id')

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id query parameter is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('votes')
      .select(`
        *,
        user_profiles!inner(
          display_name,
          avatar_url,
          reputation_score,
          is_expert
        )
      `)
      .eq('company_id', companyId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: votes, error } = await query.order('voted_at', { ascending: false })

    if (error) {
      console.error('Vote fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      votes: votes || [],
    })

  } catch (error) {
    console.error('Vote retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
