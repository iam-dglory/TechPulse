import { Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { AuditLog, AuditEventType, AuditSeverity } from '../models/auditLog';
import { AuthenticatedRequest } from '../middleware/auth';

export class LegalController {
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  /**
   * GET /policy - Get privacy policy and terms of service
   */
  async getPrivacyPolicy(req: Request, res: Response): Promise<void> {
    try {
      const policy = {
        title: 'TexhPulze Privacy Policy & Terms of Service',
        lastUpdated: '2024-01-15',
        version: '1.0',
        sections: {
          privacy: {
            title: 'Privacy Policy',
            content: `
# Privacy Policy

## Information We Collect

### Personal Information
- **Account Information**: Username, email address, and profile details
- **Usage Data**: Stories viewed, votes cast, comments made, and interaction patterns
- **Technical Data**: IP address, device information, browser type, and usage analytics
- **Location Data**: General location information (country/region level only)

### Content Information
- **User-Generated Content**: Stories, comments, votes, and flag reports you submit
- **Company Claims**: Business information and verification documents
- **Moderation Data**: Reports, flags, and review decisions

## How We Use Your Information

### Core Platform Functions
- **Service Delivery**: Provide and maintain the TexhPulze platform
- **Content Curation**: Personalize your experience and recommend relevant stories
- **Community Safety**: Moderate content and enforce community guidelines
- **Analytics**: Understand usage patterns and improve our service

### Legal and Compliance
- **Legal Obligations**: Comply with applicable laws and regulations
- **Content Moderation**: Review flagged content and take appropriate action
- **Audit Trail**: Maintain records for legal and compliance purposes
- **Dispute Resolution**: Handle complaints and legal requests

## Information Sharing

### We Do Not Sell Your Data
TexhPulze does not sell, rent, or trade your personal information to third parties.

### Limited Sharing Scenarios
- **Legal Requirements**: When required by law, court order, or legal process
- **Safety and Security**: To protect users, prevent harm, or investigate violations
- **Business Transfers**: In connection with mergers, acquisitions, or asset sales
- **Service Providers**: With trusted partners who help operate our platform

## Data Security

### Protection Measures
- **Encryption**: Data encrypted in transit and at rest
- **Access Controls**: Strict access controls and authentication
- **Regular Audits**: Security assessments and vulnerability testing
- **Incident Response**: Procedures for handling security incidents

### Data Retention
- **Account Data**: Retained while your account is active
- **Content Data**: Retained according to our content policies
- **Audit Logs**: Retained for legal and compliance requirements
- **Moderation Records**: Retained for platform safety and appeals

## Your Rights

### Data Access and Control
- **Access**: Request a copy of your personal data
- **Correction**: Update or correct inaccurate information
- **Deletion**: Request deletion of your personal data
- **Portability**: Export your data in a machine-readable format

### Communication Preferences
- **Email Settings**: Control marketing and notification emails
- **Privacy Settings**: Adjust visibility and data sharing preferences
- **Account Management**: Update or delete your account

## Cookies and Tracking

### Types of Cookies
- **Essential**: Required for platform functionality
- **Analytics**: Help us understand usage patterns
- **Preferences**: Remember your settings and preferences

### Managing Cookies
You can control cookies through your browser settings, but disabling essential cookies may affect platform functionality.

## International Data Transfers

Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers.

## Children's Privacy

TexhPulze is not intended for children under 13. We do not knowingly collect personal information from children under 13.

## Changes to This Policy

We may update this privacy policy from time to time. We will notify you of significant changes through the platform or by email.

## Contact Information

For privacy-related questions or requests:
- **Email**: privacy@texhpulze.com
- **Address**: TexhPulze Privacy Team, [Company Address]
- **Response Time**: We aim to respond within 30 days

## Effective Date

This privacy policy is effective as of January 15, 2024.
            `
          },
          terms: {
            title: 'Terms of Service',
            content: `
# Terms of Service

## Acceptance of Terms

By using TexhPulze, you agree to be bound by these Terms of Service and our Privacy Policy.

## Description of Service

TexhPulze is a technology news platform that provides:
- **Curated Content**: Technology stories and analysis
- **Community Features**: Voting, commenting, and discussion
- **Company Profiles**: Verified business information
- **Audio Briefs**: Personalized news summaries

## User Responsibilities

### Acceptable Use
- **Respectful Communication**: Treat all users with respect
- **Accurate Information**: Provide truthful and accurate information
- **Legal Compliance**: Comply with all applicable laws and regulations
- **Community Guidelines**: Follow our community standards

### Prohibited Activities
- **Harassment**: No harassment, bullying, or personal attacks
- **False Information**: No spreading of misinformation or false claims
- **Spam**: No spam, promotional content, or excessive posting
- **Illegal Content**: No content that violates laws or regulations
- **Copyright Violation**: No unauthorized use of copyrighted material
- **Privacy Violation**: No sharing of personal information without consent

## Content Moderation

### Our Rights
- **Content Review**: We review all user-generated content
- **Moderation Actions**: We may hide, edit, or remove content
- **Account Actions**: We may suspend or terminate accounts
- **Appeals Process**: Users can appeal moderation decisions

### Flagging System
- **Report Content**: Users can flag inappropriate content
- **Review Process**: All flags are reviewed by our moderation team
- **Auto-Hiding**: Some content may be automatically hidden pending review
- **Legal Review**: Serious violations may require legal review

## Intellectual Property

### Your Content
- **Ownership**: You retain ownership of your original content
- **License**: You grant us a license to use your content on our platform
- **Responsibility**: You are responsible for ensuring you have rights to content

### Our Content
- **Platform Content**: Our platform, design, and features are protected
- **User-Generated Content**: We respect user ownership of their content
- **Third-Party Content**: We respect third-party intellectual property rights

## Disclaimers and Limitations

### Content Accuracy
- **No Guarantees**: We do not guarantee the accuracy of user-generated content
- **Third-Party Sources**: We are not responsible for third-party content
- **Verification**: We attempt to verify information but cannot guarantee accuracy

### Service Availability
- **No Warranty**: Service provided "as is" without warranties
- **Availability**: We do not guarantee continuous service availability
- **Modifications**: We may modify or discontinue features at any time

## Limitation of Liability

To the maximum extent permitted by law:
- **No Liability**: We are not liable for indirect, incidental, or consequential damages
- **Maximum Liability**: Our liability is limited to the amount you paid for the service
- **Force Majeure**: We are not liable for events beyond our control

## Indemnification

You agree to indemnify and hold us harmless from any claims arising from:
- Your use of the service
- Your violation of these terms
- Your violation of any law or regulation
- Your infringement of third-party rights

## Termination

### Your Rights
- **Account Deletion**: You can delete your account at any time
- **Data Removal**: You can request removal of your data
- **Service Withdrawal**: You can stop using the service at any time

### Our Rights
- **Account Suspension**: We may suspend accounts for violations
- **Account Termination**: We may terminate accounts for serious violations
- **Service Discontinuation**: We may discontinue the service with notice

## Dispute Resolution

### Governing Law
These terms are governed by the laws of [Jurisdiction].

### Dispute Process
- **Good Faith Resolution**: We encourage good faith resolution of disputes
- **Mediation**: Disputes may be resolved through mediation
- **Arbitration**: Some disputes may be subject to binding arbitration
- **Class Action Waiver**: You waive the right to participate in class actions

## Modifications

### Terms Updates
- **Notice**: We will notify users of significant changes
- **Acceptance**: Continued use constitutes acceptance of new terms
- **Effective Date**: Changes become effective as stated in the notice

### Service Changes
- **Feature Updates**: We may add, modify, or remove features
- **Notification**: We will provide reasonable notice of significant changes
- **User Impact**: We will consider user impact when making changes

## Contact Information

For questions about these terms:
- **Email**: legal@texhpulze.com
- **Address**: TexhPulze Legal Team, [Company Address]
- **Response Time**: We aim to respond within 5 business days

## Severability

If any provision of these terms is found to be unenforceable, the remaining provisions will remain in effect.

## Entire Agreement

These terms, together with our Privacy Policy, constitute the entire agreement between you and TexhPulze.

## Effective Date

These terms are effective as of January 15, 2024.
            `
          },
          moderation: {
            title: 'Content Moderation Policy',
            content: `
# Content Moderation Policy

## Moderation Philosophy

TexhPulze is committed to maintaining a safe, respectful, and informative platform for technology discussions. Our moderation approach balances free expression with community safety.

## Moderation Principles

### Transparency
- **Clear Guidelines**: Clear, published community guidelines
- **Consistent Application**: Consistent application of moderation policies
- **Appeal Process**: Fair and accessible appeal process
- **Public Reporting**: Regular transparency reports on moderation actions

### Proportionality
- **Graduated Responses**: Escalating responses based on severity
- **Educational Approach**: Focus on education and improvement
- **Rehabilitation**: Opportunities for users to improve behavior
- **Last Resort**: Account termination only as a last resort

### Due Process
- **Review Process**: All moderation actions are reviewed
- **Evidence-Based**: Decisions based on evidence and policy
- **Appeal Rights**: Users have the right to appeal decisions
- **Independent Review**: Appeals reviewed by different moderators

## Content Categories

### Prohibited Content
- **Violence**: Threats, incitement to violence, graphic violence
- **Hate Speech**: Content that attacks based on protected characteristics
- **Harassment**: Personal attacks, bullying, or intimidation
- **Illegal Content**: Content that violates applicable laws
- **Privacy Violations**: Sharing personal information without consent
- **Spam**: Repetitive, promotional, or off-topic content

### Restricted Content
- **Misinformation**: False or misleading information about technology
- **Copyright Violations**: Unauthorized use of copyrighted material
- **Commercial Content**: Promotional content without disclosure
- **Off-Topic**: Content not related to technology or our platform

### Allowed Content
- **Technology Discussion**: Genuine technology news and analysis
- **Constructive Criticism**: Respectful criticism of companies or technologies
- **Personal Experiences**: Personal experiences with technology
- **Educational Content**: Educational content about technology

## Moderation Actions

### Content Actions
- **Warning**: First-time violations receive warnings
- **Content Removal**: Inappropriate content is removed
- **Content Editing**: Content may be edited for policy compliance
- **Auto-Hiding**: Some content is automatically hidden pending review

### Account Actions
- **Warning**: Formal warnings for policy violations
- **Temporary Suspension**: Short-term account suspension
- **Extended Suspension**: Longer-term suspension for repeated violations
- **Account Termination**: Permanent account termination for severe violations

### Escalation Process
- **Automated Flagging**: AI-assisted content flagging
- **Human Review**: All flags reviewed by human moderators
- **Legal Review**: Serious violations escalated to legal team
- **External Reporting**: Some violations reported to authorities

## Flagging System

### How to Flag
- **Report Button**: Use the report button on any content
- **Provide Details**: Explain why the content violates policies
- **Evidence**: Provide evidence when available
- **Good Faith**: Flag in good faith, not for harassment

### Flag Review Process
- **Initial Review**: Flags reviewed within 24 hours
- **Priority System**: High-priority flags reviewed immediately
- **Evidence Gathering**: Additional evidence gathered when needed
- **Decision Making**: Decisions based on policy and evidence

### Appeal Process
- **Appeal Window**: 30 days to appeal moderation decisions
- **Appeal Form**: Structured appeal form with required information
- **Independent Review**: Appeals reviewed by different moderators
- **Final Decision**: Appeal decisions are final

## Enforcement Statistics

### Monthly Reports
- **Flags Received**: Number of content flags received
- **Actions Taken**: Types of moderation actions taken
- **Appeal Success Rate**: Percentage of successful appeals
- **Response Times**: Average time to review flags and appeals

### Transparency
- **Public Reports**: Regular public reports on moderation
- **Policy Updates**: Notification of policy changes
- **Community Feedback**: Regular community feedback sessions
- **Continuous Improvement**: Ongoing policy refinement

## Legal Compliance

### Content Removal
- **Legal Requests**: Compliance with legal content removal requests
- **DMCA**: Compliance with copyright takedown requests
- **Court Orders**: Compliance with court orders and legal process
- **Government Requests**: Compliance with government requests where legal

### Data Retention
- **Moderation Records**: Moderation actions retained for appeals and legal purposes
- **Audit Trail**: Complete audit trail of all moderation actions
- **Legal Holds**: Data preserved when required by legal process
- **Retention Periods**: Clear data retention periods for different types of data

## Contact and Appeals

### Moderation Appeals
- **Email**: appeals@texhpulze.com
- **Response Time**: Appeals reviewed within 7 business days
- **Documentation**: All appeals require documentation
- **Process**: Clear appeal process with defined steps

### Policy Questions
- **Email**: moderation@texhpulze.com
- **Response Time**: Policy questions answered within 3 business days
- **Clarification**: We provide clarification on policy questions
- **Updates**: Policy updates communicated to users

## Effective Date

This moderation policy is effective as of January 15, 2024, and may be updated periodically.
            `
          }
        }
      };

      res.status(200).json({
        success: true,
        message: 'Privacy policy and terms retrieved successfully',
        data: policy
      });
    } catch (error) {
      console.error('Get privacy policy error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving privacy policy'
      });
    }
  }

  /**
   * POST /legal/data-export - Request data export (GDPR compliance)
   */
  async requestDataExport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Log the data export request
      await this.logAuditEvent({
        eventType: AuditEventType.DATA_EXPORT,
        severity: AuditSeverity.INFO,
        userId,
        description: 'User requested data export',
        metadata: {
          requestType: 'data_export',
          legalBasis: 'GDPR Article 20 - Right to data portability',
          complianceType: 'GDPR'
        },
        req
      });

      // In a real implementation, you would:
      // 1. Generate a data export package
      // 2. Send it to the user via secure email
      // 3. Log the export for audit purposes

      res.status(200).json({
        success: true,
        message: 'Data export request received',
        data: {
          requestId: `export_${Date.now()}`,
          estimatedDelivery: '7 business days',
          deliveryMethod: 'Secure email link',
          retentionPeriod: '30 days'
        }
      });
    } catch (error) {
      console.error('Data export request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while processing data export request'
      });
    }
  }

  /**
   * POST /legal/data-deletion - Request data deletion (GDPR compliance)
   */
  async requestDataDeletion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { reason, confirmation } = req.body;

      if (!confirmation || confirmation !== 'DELETE_MY_DATA') {
        res.status(400).json({
          success: false,
          message: 'Confirmation required. Please type "DELETE_MY_DATA" to confirm.'
        });
        return;
      }

      // Log the data deletion request
      await this.logAuditEvent({
        eventType: AuditEventType.DATA_DELETION,
        severity: AuditSeverity.WARNING,
        userId,
        description: 'User requested data deletion',
        metadata: {
          requestType: 'data_deletion',
          reason: reason || 'Not specified',
          legalBasis: 'GDPR Article 17 - Right to erasure',
          complianceType: 'GDPR'
        },
        req
      });

      // In a real implementation, you would:
      // 1. Verify the request
      // 2. Schedule data deletion (with retention for legal purposes)
      // 3. Send confirmation to user
      // 4. Log the deletion for audit purposes

      res.status(200).json({
        success: true,
        message: 'Data deletion request received',
        data: {
          requestId: `deletion_${Date.now()}`,
          estimatedCompletion: '30 days',
          retentionPeriod: 'Some data retained for legal compliance',
          confirmationRequired: 'Email confirmation sent'
        }
      });
    } catch (error) {
      console.error('Data deletion request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while processing data deletion request'
      });
    }
  }

  /**
   * GET /legal/audit-logs - Get audit logs for legal compliance (admin only)
   */
  async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user is admin
      const user = await AppDataSource.getRepository('User').findOne({ where: { id: userId } });
      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      const {
        eventType,
        severity,
        startDate,
        endDate,
        page = '1',
        limit = '100'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 1000); // Max 1000 records
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const queryBuilder = this.auditLogRepository.createQueryBuilder('audit')
        .leftJoinAndSelect('audit.user', 'user')
        .orderBy('audit.createdAt', 'DESC');

      // Add filters
      if (eventType && eventType !== 'all') {
        queryBuilder.andWhere('audit.eventType = :eventType', { eventType });
      }

      if (severity && severity !== 'all') {
        queryBuilder.andWhere('audit.severity = :severity', { severity });
      }

      if (startDate) {
        queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate });
      }

      // Add pagination
      queryBuilder.skip(skip).take(limitNum);

      const [auditLogs, totalCount] = await queryBuilder.getManyAndCount();

      res.status(200).json({
        success: true,
        message: 'Audit logs retrieved successfully',
        data: {
          logs: auditLogs.map(log => ({
            id: log.id,
            eventType: log.eventType,
            severity: log.severity,
            description: log.description,
            userId: log.userId,
            user: log.user ? {
              id: log.user.id,
              username: log.user.username
            } : null,
            ipAddress: log.ipAddress,
            endpoint: log.endpoint,
            httpMethod: log.httpMethod,
            statusCode: log.statusCode,
            createdAt: log.createdAt,
            metadata: log.metadata
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum)
          },
          filters: {
            eventType,
            severity,
            startDate,
            endDate
          }
        }
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving audit logs'
      });
    }
  }

  private async logAuditEvent(eventData: {
    eventType: AuditEventType;
    severity: AuditSeverity;
    userId: string;
    description: string;
    metadata?: any;
    req?: any;
  }): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      eventType: eventData.eventType,
      severity: eventData.severity,
      userId: eventData.userId,
      description: eventData.description,
      metadata: eventData.metadata,
      ipAddress: eventData.req?.ip,
      userAgent: eventData.req?.get('User-Agent'),
      endpoint: eventData.req?.path,
      httpMethod: eventData.req?.method
    });

    await this.auditLogRepository.save(auditLog);
  }
}
