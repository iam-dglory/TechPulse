import { AppDataSource } from '../../ormconfig';
import { Story } from '../models/story';
import { User } from '../models/user';
import { emailService } from './emailService';

interface EditorialReminder {
  storyId: string;
  storyTitle: string;
  companyName?: string;
  publishedAt: Date;
  hypeScore: number;
  daysSincePublication: number;
  reminderType: 'high-hype' | 'follow-up' | 'verification';
}

class EditorialReminderService {
  private storyRepository = AppDataSource.getRepository(Story);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Find stories that need editorial follow-up
   */
  async findStoriesNeedingFollowUp(): Promise<EditorialReminder[]> {
    try {
      // Find high-hype stories published 6 months ago
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const highHypeStories = await this.storyRepository
        .createQueryBuilder('story')
        .leftJoinAndSelect('story.company', 'company')
        .where('story.publishedAt <= :sixMonthsAgo', { sixMonthsAgo })
        .andWhere('story.hypeScore >= :minHypeScore', { minHypeScore: 7 })
        .andWhere('story.realityCheck IS NULL OR story.realityCheck = :emptyString', { emptyString: '' })
        .orderBy('story.publishedAt', 'ASC')
        .getMany();

      // Find stories that might need verification updates
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const verificationStories = await this.storyRepository
        .createQueryBuilder('story')
        .leftJoinAndSelect('story.company', 'company')
        .where('story.publishedAt <= :threeMonthsAgo', { threeMonthsAgo })
        .andWhere('story.hypeScore >= :mediumHypeScore', { mediumHypeScore: 5 })
        .andWhere('story.eli5Summary IS NULL OR story.eli5Summary = :emptyString', { emptyString: '' })
        .orderBy('story.publishedAt', 'ASC')
        .getMany();

      const reminders: EditorialReminder[] = [];

      // Process high-hype stories
      highHypeStories.forEach(story => {
        const daysSince = Math.floor((Date.now() - story.publishedAt.getTime()) / (1000 * 60 * 60 * 24));
        
        reminders.push({
          storyId: story.id,
          storyTitle: story.title,
          companyName: story.company?.name,
          publishedAt: story.publishedAt,
          hypeScore: story.hypeScore,
          daysSincePublication: daysSince,
          reminderType: 'high-hype'
        });
      });

      // Process verification stories
      verificationStories.forEach(story => {
        const daysSince = Math.floor((Date.now() - story.publishedAt.getTime()) / (1000 * 60 * 60 * 24));
        
        reminders.push({
          storyId: story.id,
          storyTitle: story.title,
          companyName: story.company?.name,
          publishedAt: story.publishedAt,
          hypeScore: story.hypeScore,
          daysSincePublication: daysSince,
          reminderType: 'verification'
        });
      });

      return reminders;
    } catch (error) {
      console.error('Error finding stories needing follow-up:', error);
      return [];
    }
  }

  /**
   * Send editorial reminder emails to admin users
   */
  async sendEditorialReminders(): Promise<void> {
    try {
      const reminders = await this.findStoriesNeedingFollowUp();
      
      if (reminders.length === 0) {
        console.log('📝 No editorial reminders to send');
        return;
      }

      // Get admin users
      const adminUsers = await this.userRepository.find({
        where: { isActive: true },
        select: ['id', 'username', 'email']
      });

      if (adminUsers.length === 0) {
        console.log('⚠️ No admin users found for editorial reminders');
        return;
      }

      // Group reminders by type
      const highHypeReminders = reminders.filter(r => r.reminderType === 'high-hype');
      const verificationReminders = reminders.filter(r => r.reminderType === 'verification');

      // Send reminders to each admin
      for (const admin of adminUsers) {
        await this.sendReminderEmail(admin.email, {
          highHypeStories: highHypeReminders,
          verificationStories: verificationReminders,
          totalCount: reminders.length
        });
      }

      console.log(`📧 Editorial reminders sent to ${adminUsers.length} admin users for ${reminders.length} stories`);
    } catch (error) {
      console.error('Error sending editorial reminders:', error);
    }
  }

  /**
   * Send reminder email to admin user
   */
  private async sendReminderEmail(adminEmail: string, reminderData: {
    highHypeStories: EditorialReminder[];
    verificationStories: EditorialReminder[];
    totalCount: number;
  }): Promise<void> {
    try {
      const { highHypeStories, verificationStories, totalCount } = reminderData;

      const template = {
        to: adminEmail,
        subject: `📝 Editorial Reminder: ${totalCount} Stories Need Follow-up`,
        html: this.generateEditorialReminderHTML(highHypeStories, verificationStories, totalCount),
        text: this.generateEditorialReminderText(highHypeStories, verificationStories, totalCount)
      };

      await emailService.sendEmail(template);
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
  }

  /**
   * Generate HTML email template for editorial reminders
   */
  private generateEditorialReminderHTML(
    highHypeStories: EditorialReminder[],
    verificationStories: EditorialReminder[],
    totalCount: number
  ): string {
    const formatStoryList = (stories: EditorialReminder[], type: string) => {
      if (stories.length === 0) return '';
      
      return `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2C3E50; margin-bottom: 10px;">${type} (${stories.length})</h3>
          <ul style="list-style: none; padding: 0;">
            ${stories.map(story => `
              <li style="background: #f8f9fa; padding: 10px; margin-bottom: 8px; border-radius: 5px; border-left: 4px solid #4ECDC4;">
                <strong>${story.storyTitle}</strong>
                ${story.companyName ? `<br><small style="color: #7F8C8D;">Company: ${story.companyName}</small>` : ''}
                <br><small style="color: #7F8C8D;">
                  Published: ${story.publishedAt.toLocaleDateString()} 
                  (${story.daysSincePublication} days ago) | 
                  Hype Score: ${story.hypeScore}/10
                </small>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Editorial Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: #4ECDC4; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .cta-button { display: inline-block; background: #4ECDC4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .priority { background: #FFF3CD; padding: 15px; border-radius: 8px; border-left: 4px solid #FFC107; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Editorial Follow-up Reminder</h1>
            <p>${totalCount} stories need your attention</p>
          </div>
          <div class="content">
            <div class="priority">
              <h2>🎯 Priority Actions Required</h2>
              <p>Several high-hype stories from 6+ months ago still lack reality checks and follow-up analysis. These stories have significant potential impact and should be prioritized for editorial review.</p>
            </div>

            ${formatStoryList(highHypeStories, 'High-Hype Stories (6+ months old)')}
            ${formatStoryList(verificationStories, 'Stories Needing Verification Updates')}

            <h3>📋 Recommended Actions:</h3>
            <ul>
              <li><strong>High-Hype Stories:</strong> Research current status, create reality checks, and update with actual outcomes</li>
              <li><strong>Verification Stories:</strong> Update with latest information and create ELI5 summaries</li>
              <li><strong>Graveyard Entries:</strong> Consider moving failed promises to the graveyard section</li>
              <li><strong>Follow-up Articles:</strong> Create new stories documenting what actually happened</li>
            </ul>

            <a href="https://texhpulze.com/admin/stories" class="cta-button">Review Stories in Admin Panel</a>

            <p><strong>Note:</strong> This is an automated reminder based on story age and hype scores. Stories with high hype scores (7+) that are 6+ months old are flagged for follow-up to maintain platform credibility.</p>
          </div>
          <div class="footer">
            <p>TexhPulze Editorial System</p>
            <p>This reminder was generated automatically based on story publication dates and hype scores.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate text email template for editorial reminders
   */
  private generateEditorialReminderText(
    highHypeStories: EditorialReminder[],
    verificationStories: EditorialReminder[],
    totalCount: number
  ): string {
    const formatStoryList = (stories: EditorialReminder[], type: string) => {
      if (stories.length === 0) return '';
      
      return `
${type} (${stories.length}):
${stories.map(story => 
  `- ${story.storyTitle}${story.companyName ? ` (${story.companyName})` : ''}
  Published: ${story.publishedAt.toLocaleDateString()} (${story.daysSincePublication} days ago)
  Hype Score: ${story.hypeScore}/10`
).join('\n\n')}

`;
    };

    return `
📝 Editorial Follow-up Reminder

${totalCount} stories need your attention for editorial follow-up.

🎯 PRIORITY ACTIONS REQUIRED:
Several high-hype stories from 6+ months ago still lack reality checks and follow-up analysis. These stories have significant potential impact and should be prioritized for editorial review.

${formatStoryList(highHypeStories, 'HIGH-HYPE STORIES (6+ months old)')}
${formatStoryList(verificationStories, 'STORIES NEEDING VERIFICATION UPDATES')}

📋 RECOMMENDED ACTIONS:
- High-Hype Stories: Research current status, create reality checks, and update with actual outcomes
- Verification Stories: Update with latest information and create ELI5 summaries  
- Graveyard Entries: Consider moving failed promises to the graveyard section
- Follow-up Articles: Create new stories documenting what actually happened

Review stories: https://texhpulze.com/admin/stories

Note: This is an automated reminder based on story age and hype scores. Stories with high hype scores (7+) that are 6+ months old are flagged for follow-up to maintain platform credibility.

---
TexhPulze Editorial System
This reminder was generated automatically based on story publication dates and hype scores.
    `;
  }

  /**
   * Get stories that might need to be moved to graveyard
   */
  async findStoriesForGraveyard(): Promise<EditorialReminder[]> {
    try {
      // Find stories that are very old and have high hype scores
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const storiesForGraveyard = await this.storyRepository
        .createQueryBuilder('story')
        .leftJoinAndSelect('story.company', 'company')
        .where('story.publishedAt <= :oneYearAgo', { oneYearAgo })
        .andWhere('story.hypeScore >= :minHypeScore', { minHypeScore: 8 })
        .andWhere('story.realityCheck IS NULL OR story.realityCheck = :emptyString', { emptyString: '' })
        .orderBy('story.hypeScore', 'DESC')
        .addOrderBy('story.publishedAt', 'ASC')
        .getMany();

      return storiesForGraveyard.map(story => {
        const daysSince = Math.floor((Date.now() - story.publishedAt.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          storyId: story.id,
          storyTitle: story.title,
          companyName: story.company?.name,
          publishedAt: story.publishedAt,
          hypeScore: story.hypeScore,
          daysSincePublication: daysSince,
          reminderType: 'follow-up' as const
        };
      });
    } catch (error) {
      console.error('Error finding stories for graveyard:', error);
      return [];
    }
  }
}

export const editorialReminderService = new EditorialReminderService();
export default editorialReminderService;
