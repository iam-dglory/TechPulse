import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, company, phone, message, timestamp } = body

    // Validate required fields
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Google Sheets webhook URL - You'll need to set this up
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

    if (!webhookUrl) {
      console.error('Google Sheets webhook URL not configured')
      // Still return success to user, but log the error
      return NextResponse.json({ success: true })
    }

    // Send data to Google Sheets via webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        company,
        phone: phone || 'Not provided',
        message: message || 'No message',
        timestamp,
      }),
    })

    if (!response.ok) {
      console.error('Failed to send to Google Sheets:', await response.text())
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error submitting demo request:', error)
    return NextResponse.json(
      { error: 'Failed to submit demo request' },
      { status: 500 }
    )
  }
}
