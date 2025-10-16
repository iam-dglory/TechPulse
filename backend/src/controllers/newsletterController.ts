import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AppDataSource } from '../../ormconfig';
import { User } from '../models/user';
import { Story } from '../models/story';
import { eventTracker } from '../services/analytics/eventTracker';

export class NewsletterController {
  /**
   * Subscribe to newsletter
   */
  static async subscribe(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, interests = [], frequency = 'weekly' } = req.body;

      // Check if email already exists
      const existingUser = await AppDataSource.getRepository(User).findOne({
        where: { email }
      });

      if (existingUser) {
        // Update existing user's newsletter preferences
        existingUser.newsletterSubscribed = true;
        existingUser.newsletterFrequency = frequency;
        existingUser.interests = interests;
        await AppDataSource.getRepository(User).save(existingUser);

        await eventTracker.trackNewsletterSubscribed(existingUser, {
          frequency,
          interestCount: interests.length
        });

        return res.json({
          success: true,
          message: 'Newsletter preferences updated',
          user: existingUser
        });
      }

      // Create new newsletter subscriber
      const newUser = AppDataSource.getRepository(User).create({
        email,
        newsletterSubscribed: true,
        newsletterFrequency: frequency,
        interests,
        emailVerified: false, // Will be verified via email
        isAdmin: false
      });

      const savedUser = await AppDataSource.getRepository(User).save(newUser);

      await eventTracker.trackNewsletterSubscribed(savedUser, {
        frequency,
        interestCount: interests.length,
        isNewUser: true
      });

      // TODO: Send verification email
      // await emailService.sendVerificationEmail(savedUser.email, savedUser.id);

      res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter',
        user: savedUser
      });
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({ error: 'Failed to subscribe to newsletter' });
    }
  }

  /**
   * Unsubscribe from newsletter
   */
  static async unsubscribe(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await AppDataSource.getRepository(User).findOne({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.newsletterSubscribed = false;
      await AppDataSource.getRepository(User).save(user);

      await eventTracker.trackNewsletterUnsubscribed(user);

      res.json({
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      });
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
    }
  }

  /**
   * Get newsletter content for current period
   */
  static async getNewsletterContent(req: Request, res: Response) {
    try {
      const { frequency = 'weekly', interests = [] } = req.query;

      const query = AppDataSource.getRepository(Story).createQueryBuilder('story')
        .leftJoinAndSelect('story.company', 'company')
        .where('story.publishedAt >= :date', {
          date: this.getDateForFrequency(frequency as string)
        })
        .orderBy('story.publishedAt', 'DESC')
        .limit(10);

      // Filter by interests if provided
      if (interests && Array.isArray(interests) && interests.length > 0) {
        query.andWhere('story.sectorTag IN (:...interests)', { interests });
      }

      const stories = await query.getMany();

      // Get top stories by community verdict
      const topStories = stories
        .sort((a, b) => (b.hypeScore + b.ethicsScore) - (a.hypeScore + a.ethicsScore))
        .slice(0, 5);

      // Get most controversial stories (high hype, low ethics)
      const controversialStories = stories
        .filter(story => story.hypeScore > 7 && story.ethicsScore < 4)
        .slice(0, 3);

      // Get accountability updates (graveyard entries)
      const graveyardEntries = await AppDataSource.query(`
        SELECT ge.*, s.title as original_title, c.name as company_name
        FROM graveyard_entry ge
        LEFT JOIN story s ON ge.original_claim_story_id = s.id
        LEFT JOIN company c ON ge.company_id = c.id
        WHERE ge.created_at >= $1
        ORDER BY ge.created_at DESC
        LIMIT 3
      `, [this.getDateForFrequency(frequency as string)]);

      res.json({
        success: true,
        newsletter: {
          period: frequency,
          topStories,
          controversialStories,
          accountabilityUpdates: graveyardEntries,
          stats: {
            totalStories: stories.length,
            avgHypeScore: this.calculateAverage(stories.map(s => s.hypeScore)),
            avgEthicsScore: this.calculateAverage(stories.map(s => s.ethicsScore)),
            mostActiveCompany: this.getMostActiveCompany(stories)
          }
        }
      });
    } catch (error) {
      console.error('Get newsletter content error:', error);
      res.status(500).json({ error: 'Failed to get newsletter content' });
    }
  }

  /**
   * Send newsletter to all subscribers
   */
  static async sendNewsletter(req: Request, res: Response) {
    try {
      // Get all active subscribers
      const subscribers = await AppDataSource.getRepository(User).find({
        where: { newsletterSubscribed: true }
      });

      const newsletterContent = await this.getNewsletterContent(req, res);

      // TODO: Implement actual email sending
      // For now, just log the newsletter content
      console.log(`Sending newsletter to ${subscribers.length} subscribers`);
      console.log('Newsletter content:', newsletterContent);

      await eventTracker.trackNewsletterSent({
        subscriberCount: subscribers.length,
        contentGenerated: true
      });

      res.json({
        success: true,
        message: `Newsletter sent to ${subscribers.length} subscribers`,
        subscriberCount: subscribers.length
      });
    } catch (error) {
      console.error('Send newsletter error:', error);
      res.status(500).json({ error: 'Failed to send newsletter' });
    }
  }

  /**
   * Get newsletter analytics
   */
  static async getNewsletterAnalytics(req: Request, res: Response) {
    try {
      const totalSubscribers = await AppDataSource.getRepository(User).count({
        where: { newsletterSubscribed: true }
      });

      const recentSubscribers = await AppDataSource.getRepository(User).count({
        where: {
          newsletterSubscribed: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      });

      const frequencyDistribution = await AppDataSource.query(`
        SELECT newsletter_frequency, COUNT(*) as count
        FROM "user"
        WHERE newsletter_subscribed = true
        GROUP BY newsletter_frequency
      `);

      res.json({
        success: true,
        analytics: {
          totalSubscribers,
          recentSubscribers,
          frequencyDistribution,
          openRate: 0.25, // TODO: Implement actual tracking
          clickRate: 0.05 // TODO: Implement actual tracking
        }
      });
    } catch (error) {
      console.error('Get newsletter analytics error:', error);
      res.status(500).json({ error: 'Failed to get newsletter analytics' });
    }
  }

  // Helper methods
  private static getDateForFrequency(frequency: string): Date {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private static calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private static getMostActiveCompany(stories: Story[]): string | null {
    const companyCounts = stories.reduce((acc, story) => {
      if (story.company) {
        acc[story.company.name] = (acc[story.company.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostActive = Object.entries(companyCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return mostActive ? mostActive[0] : null;
  }
}
