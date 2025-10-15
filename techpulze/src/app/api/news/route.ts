import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: news, error } = await supabase
      .from('news_updates')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url
        )
      `)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching news:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ news })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data: newsUpdate, error } = await supabase
      .from('news_updates')
      .insert(body)
      .select(`
        *,
        companies (
          id,
          name,
          logo_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating news update:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ newsUpdate }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
