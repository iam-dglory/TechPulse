import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params
    const supabase = await createClient()

    // Get score request
    const { data: scoreRequest, error } = await supabase
      .from('score_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (error || !scoreRequest) {
      return NextResponse.json({ error: 'Score request not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: scoreRequest.id,
      status: scoreRequest.status,
      scores: scoreRequest.scores,
      error_message: scoreRequest.error_message,
      created_at: scoreRequest.created_at,
      completed_at: scoreRequest.completed_at
    })
  } catch (error: any) {
    console.error('Get score status error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get score status' }, { status: 500 })
  }
}
