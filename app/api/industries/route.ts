import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: industries, error } = await supabase
      .from('industries')
      .select('*')
      .order('company_count', { ascending: false })

    if (error) throw error

    return NextResponse.json(industries)
  } catch (error: any) {
    console.error('Error fetching industries:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch industries' },
      { status: 500 }
    )
  }
}
