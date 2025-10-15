/**
 * Email Notification Service
 * For MVP, this logs to console. In production, integrate with SendGrid, AWS SES, etc.
 */

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface ClaimApprovalEmailData {
  companyName: string;
  contactPerson: string;
  claimDate: string;
  adminNotes?: string;
}

interface ClaimRejectionEmailData {
  companyName: string;
  contactPerson: string;
  claimDate: string;
  rejectionReason: string;
}

class EmailService {
  /**
   * Send email notification (MVP: console logging)
   */
  private async sendEmail(template: EmailTemplate): Promise<void> {
    // MVP: Log to console instead of sending actual email
    console.log('\n📧 EMAIL NOTIFICATION');
    console.log('=' .repeat(50));
    console.log(`To: ${template.to}`);
    console.log(`Subject: ${template.subject}`);
    console.log('Body:');
    console.log(template.text);
    console.log('=' .repeat(50));
    console.log('');

    // In production, replace with actual email service:
    // await sendgrid.send(template);
    // or
    // await ses.sendEmail(template);
  }

  /**
   * Send claim approval notification
   */
  async sendClaimApprovalEmail(data: ClaimApprovalEmailData): Promise<void> {
    const template: EmailTemplate = {
      to: data.contactPerson, // This should be the official email from the claim
      subject: `🎉 Company Claim Approved: ${data.companyName}`,
      html: this.generateClaimApprovalHTML(data),
      text: this.generateClaimApprovalText(data),
    };

    await this.sendEmail(template);
  }

  /**
   * Send claim rejection notification
   */
  async sendClaimRejectionEmail(data: ClaimRejectionEmailData): Promise<void> {
    const template: EmailTemplate = {
      to: data.contactPerson, // This should be the official email from the claim
      subject: `❌ Company Claim Update: ${data.companyName}`,
      html: this.generateClaimRejectionHTML(data),
      text: this.generateClaimRejectionText(data),
    };

    await this.sendEmail(template);
  }

  /**
   * Generate HTML email template for claim approval
   */
  private generateClaimApprovalHTML(data: ClaimApprovalEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Company Claim Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4ECDC4; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .cta-button { display: inline-block; background: #4ECDC4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">🎉</div>
            <h1>Company Claim Approved!</h1>
          </div>
          <div class="content">
            <h2>Congratulations!</h2>
            <p>Dear ${data.contactPerson},</p>
            
            <p>Great news! Your claim for <strong>${data.companyName}</strong> has been approved by our verification team.</p>
            
            <p><strong>Claim Details:</strong></p>
            <ul>
              <li>Company: ${data.companyName}</li>
              <li>Submitted: ${data.claimDate}</li>
              <li>Status: ✅ Approved</li>
            </ul>
            
            ${data.adminNotes ? `<p><strong>Admin Notes:</strong><br>${data.adminNotes}</p>` : ''}
            
            <p>You now have full access to manage your company profile on TexhPulze, including:</p>
            <ul>
              <li>Updating company information</li>
              <li>Managing product listings</li>
              <li>Responding to story discussions</li>
              <li>Accessing analytics and insights</li>
            </ul>
            
            <a href="https://texhpulze.com/companies/manage" class="cta-button">Manage Your Company</a>
            
            <p>Thank you for joining TexhPulze and helping us build a more transparent tech ecosystem!</p>
            
            <p>Best regards,<br>The TexhPulze Team</p>
          </div>
          <div class="footer">
            <p>This email was sent regarding your company claim on TexhPulze.</p>
            <p>If you have any questions, please contact us at support@texhpulze.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate text email template for claim approval
   */
  private generateClaimApprovalText(data: ClaimApprovalEmailData): string {
    return `
🎉 Company Claim Approved!

Dear ${data.contactPerson},

Great news! Your claim for ${data.companyName} has been approved by our verification team.

Claim Details:
- Company: ${data.companyName}
- Submitted: ${data.claimDate}
- Status: ✅ Approved

${data.adminNotes ? `Admin Notes: ${data.adminNotes}\n` : ''}

You now have full access to manage your company profile on TexhPulze, including:
- Updating company information
- Managing product listings
- Responding to story discussions
- Accessing analytics and insights

Manage your company: https://texhpulze.com/companies/manage

Thank you for joining TexhPulze and helping us build a more transparent tech ecosystem!

Best regards,
The TexhPulze Team

---
This email was sent regarding your company claim on TexhPulze.
If you have any questions, please contact us at support@texhpulze.com
    `;
  }

  /**
   * Generate HTML email template for claim rejection
   */
  private generateClaimRejectionHTML(data: ClaimRejectionEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Company Claim Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #E74C3C; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .rejection-icon { font-size: 48px; margin-bottom: 10px; }
          .cta-button { display: inline-block; background: #4ECDC4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="rejection-icon">📋</div>
            <h1>Company Claim Update</h1>
          </div>
          <div class="content">
            <h2>Claim Status Update</h2>
            <p>Dear ${data.contactPerson},</p>
            
            <p>Thank you for submitting a claim for <strong>${data.companyName}</strong> on TexhPulze.</p>
            
            <p><strong>Claim Details:</strong></p>
            <ul>
              <li>Company: ${data.companyName}</li>
              <li>Submitted: ${data.claimDate}</li>
              <li>Status: ❌ Rejected</li>
            </ul>
            
            <p><strong>Reason for Rejection:</strong><br>${data.rejectionReason}</p>
            
            <p>Don't worry! You can resubmit your claim with additional documentation or corrections. Here's what you can do:</p>
            <ul>
              <li>Review the rejection reason above</li>
              <li>Gather additional supporting documentation</li>
              <li>Ensure all information is accurate and up-to-date</li>
              <li>Submit a new claim with improved documentation</li>
            </ul>
            
            <a href="https://texhpulze.com/companies/claim" class="cta-button">Submit New Claim</a>
            
            <p>If you believe this decision was made in error or have questions about the verification process, please contact our support team.</p>
            
            <p>Best regards,<br>The TexhPulze Team</p>
          </div>
          <div class="footer">
            <p>This email was sent regarding your company claim on TexhPulze.</p>
            <p>If you have any questions, please contact us at support@texhpulze.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate text email template for claim rejection
   */
  private generateClaimRejectionText(data: ClaimRejectionEmailData): string {
    return `
📋 Company Claim Update

Dear ${data.contactPerson},

Thank you for submitting a claim for ${data.companyName} on TexhPulze.

Claim Details:
- Company: ${data.companyName}
- Submitted: ${data.claimDate}
- Status: ❌ Rejected

Reason for Rejection:
${data.rejectionReason}

Don't worry! You can resubmit your claim with additional documentation or corrections. Here's what you can do:

1. Review the rejection reason above
2. Gather additional supporting documentation
3. Ensure all information is accurate and up-to-date
4. Submit a new claim with improved documentation

Submit new claim: https://texhpulze.com/companies/claim

If you believe this decision was made in error or have questions about the verification process, please contact our support team.

Best regards,
The TexhPulze Team

---
This email was sent regarding your company claim on TexhPulze.
If you have any questions, please contact us at support@texhpulze.com
    `;
  }
}

export const emailService = new EmailService();
export default emailService;
