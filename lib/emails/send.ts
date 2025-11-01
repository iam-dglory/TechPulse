import { Resend } from 'resend'
import { emailTemplates } from './templates'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface SendEmailParams {
  to: string | string[]
  template: keyof typeof emailTemplates
  data: any[]
}

export async function sendEmail({ to, template, data }: SendEmailParams) {
  // Skip if Resend not configured
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log('[Email] Resend not configured, skipping email:', template)
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const templateFn = emailTemplates[template] as any
    const { subject, html } = templateFn(...data)

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'TechPulze <noreply@techpulze.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    })

    console.log('[Email] Sent:', template, result)
    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error('[Email] Error:', error)
    return { success: false, error: error.message }
  }
}

// Convenience functions
export const emailService = {
  sendWelcome: (email: string, userName: string) =>
    sendEmail({ to: email, template: 'welcome', data: [userName] }),

  sendReviewApproved: (email: string, userName: string, companyName: string, reviewUrl: string) =>
    sendEmail({ to: email, template: 'reviewApproved', data: [userName, companyName, reviewUrl] }),

  sendScoreUpdate: (email: string, userName: string, companyName: string, oldScore: number, newScore: number, companyUrl: string) =>
    sendEmail({ to: email, template: 'scoreUpdated', data: [userName, companyName, oldScore, newScore, companyUrl] }),

  notifyAdminNewReview: (companyName: string, reviewerName: string, reviewUrl: string) =>
    sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@techpulze.com',
      template: 'adminNewReview',
      data: [companyName, reviewerName, reviewUrl]
    })
}
