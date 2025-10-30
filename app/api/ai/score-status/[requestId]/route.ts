import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('score_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (error) throw error

    return NextResponse.json({
      status: data.status,
      progress: data.progress || 0,
      currentStep: data.current_step,
      scores: data.status === 'completed' ? data.score_breakdown : null,
      error: data.error_message,
      completedAt: data.completed_at,
      processingTime: data.processing_duration_ms
    })
  } catch (error: any) {
    console.error('Get score status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
