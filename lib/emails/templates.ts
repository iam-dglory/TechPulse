export const emailTemplates = {
  // Welcome email for new users
  welcome: (userName: string) => ({
    subject: 'Welcome to TechPulze - Your Ethics Guide',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to TechPulze!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName}! 👋</h2>
              <p>Thank you for joining TechPulze - the world's first comprehensive platform for evaluating company ethics across all industries.</p>

              <h3>What you can do:</h3>
              <ul>
                <li>🔍 Discover ethical companies in any industry</li>
                <li>⭐ Read and write honest reviews</li>
                <li>📊 Compare companies side-by-side</li>
                <li>💡 Get personalized recommendations</li>
                <li>📈 Track company improvements over time</li>
              </ul>

              <a href="${process.env.NEXT_PUBLIC_APP_URL}/discover" class="button">Start Exploring</a>

              <p>Questions? Reply to this email - we're here to help!</p>
            </div>
            <div class="footer">
              <p>TechPulze - Know Which Companies You Can Trust</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  // Review approved notification
  reviewApproved: (userName: string, companyName: string, reviewUrl: string) => ({
    subject: `Your review of ${companyName} is now live!`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Great news, ${userName}! 🎉</h2>
            <p>Your review of <strong>${companyName}</strong> has been approved and is now live on TechPulze.</p>
            <p>You've earned <strong>50 points</strong> for contributing to our community!</p>
            <a href="${reviewUrl}" style="display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              View Your Review
            </a>
            <p>Thank you for helping others make informed decisions! 🙏</p>
          </div>
        </body>
      </html>
    `
  }),

  // Company score updated
  scoreUpdated: (userName: string, companyName: string, oldScore: number, newScore: number, companyUrl: string) => ({
    subject: `${companyName}'s ethics score changed: ${oldScore.toFixed(1)} → ${newScore.toFixed(1)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Score Update Alert 📊</h2>
            <p>Hi ${userName},</p>
            <p>The ethics score for <strong>${companyName}</strong> (a company you follow) has been updated:</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 18px; margin: 0;">
                <span style="color: #999;">${oldScore.toFixed(1)}</span>
                <span style="margin: 0 10px;">→</span>
                <span style="color: ${newScore > oldScore ? '#10B981' : '#EF4444'}; font-weight: bold;">${newScore.toFixed(1)}</span>
                ${newScore > oldScore ? '📈' : '📉'}
              </p>
            </div>
            <a href="${companyUrl}" style="display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">
              View Details
            </a>
          </div>
        </body>
      </html>
    `
  }),

  // Admin: New review pending
  adminNewReview: (companyName: string, reviewerName: string, reviewUrl: string) => ({
    subject: `[ADMIN] New review pending: ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Review Pending Moderation</h2>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Reviewer:</strong> ${reviewerName}</p>
            <a href="${reviewUrl}" style="display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Moderate Review
            </a>
          </div>
        </body>
      </html>
    `
  })
}
