import { Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { Story } from '../models/story';
import { User } from '../models/user';
import { AuthenticatedRequest } from '../middleware/auth';

interface DailyBriefQueryParams {
  userId?: string;
  duration?: string; // '5' | '10' | '15' (minutes)
  mode?: 'personalized' | 'trending' | 'balanced';
  limit?: string;
}

interface BriefStory {
  id: string;
  title: string;
  simpleSummary: string;
  technicalSummary?: string;
  sectorTag: string;
  hypeScore: number;
  ethicsScore: number;
  publishedAt: string;
  company?: {
    id: string;
    name: string;
    slug: string;
  };
  estimatedReadTime: number; // in seconds for audio
  priority: 'high' | 'medium' | 'low';
}

interface DailyBriefResponse {
  briefId: string;
  generatedAt: string;
  duration: number; // in minutes
  estimatedTotalTime: number; // in seconds
  mode: string;
  stories: BriefStory[];
  introText: string;
  outroText: string;
  personalizedInsights?: {
    userIndustry?: string;
    relevantStories: number;
    topSectors: string[];
    riskAlerts: number;
  };
}

export class BriefController {
  private storyRepository = AppDataSource.getRepository(Story);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * GET /briefs/daily - Get personalized daily tech brief
   */
  async getDailyBrief(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        duration = '10',
        mode = 'balanced',
        limit
      }: DailyBriefQueryParams = req.query;

      const durationNum = parseInt(duration);
      const modeParam = mode as 'personalized' | 'trending' | 'balanced';

      // Validate duration
      if (!['5', '10', '15'].includes(duration)) {
        res.status(400).json({
          success: false,
          message: 'Duration must be 5, 10, or 15 minutes'
        });
        return;
      }

      // Get user profile if userId provided
      let userProfile = null;
      if (userId) {
        try {
          userProfile = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'username', 'industry', 'isActive']
          });
        } catch (error) {
          console.log('User not found, proceeding without personalization');
        }
      }

      // Calculate story count based on duration
      const storyCount = this.calculateStoryCount(durationNum, modeParam);

      // Get stories based on mode
      const stories = await this.getStoriesForBrief({
        userId,
        duration: durationNum,
        mode: modeParam,
        limit: limit ? parseInt(limit) : storyCount,
        userProfile
      });

      // Generate brief content
      const brief = await this.generateBriefContent({
        stories,
        duration: durationNum,
        mode: modeParam,
        userProfile
      });

      res.status(200).json({
        success: true,
        message: 'Daily brief generated successfully',
        data: brief
      });
    } catch (error) {
      console.error('Get daily brief error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating daily brief'
      });
    }
  }

  /**
   * Calculate optimal story count based on duration and mode
   */
  private calculateStoryCount(duration: number, mode: string): number {
    // Base calculation: ~30 seconds per story (including intro/outro)
    const baseStoriesPerMinute = 2;
    
    let multiplier = 1;
    switch (mode) {
      case 'trending':
        multiplier = 0.8; // Fewer stories, more detail
        break;
      case 'personalized':
        multiplier = 1.2; // More stories, less detail each
        break;
      case 'balanced':
      default:
        multiplier = 1;
        break;
    }

    return Math.max(3, Math.min(20, Math.floor(duration * baseStoriesPerMinute * multiplier)));
  }

  /**
   * Get stories for the brief based on mode and user profile
   */
  private async getStoriesForBrief(params: {
    userId?: string;
    duration: number;
    mode: string;
    limit: number;
    userProfile?: any;
  }): Promise<Story[]> {
    const { mode, limit, userProfile } = params;

    let queryBuilder = this.storyRepository
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.company', 'company')
      .where('story.publishedAt IS NOT NULL')
      .andWhere('story.publishedAt >= :recentDate', {
        recentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      })
      .andWhere('(story.simpleSummary IS NOT NULL OR story.eli5Summary IS NOT NULL)');

    switch (mode) {
      case 'trending':
        // Stories with high engagement and recent activity
        queryBuilder = queryBuilder
          .orderBy('story.hypeScore', 'DESC')
          .addOrderBy('story.publishedAt', 'DESC');
        break;

      case 'personalized':
        if (userProfile?.industry) {
          // Add industry relevance scoring
          queryBuilder = queryBuilder
            .andWhere('story.impactTags && :industryTags', {
              industryTags: this.getIndustryRelevantTags(userProfile.industry)
            })
            .orderBy('story.hypeScore', 'DESC')
            .addOrderBy('story.ethicsScore', 'DESC')
            .addOrderBy('story.publishedAt', 'DESC');
        } else {
          // Fallback to balanced approach
          queryBuilder = queryBuilder
            .orderBy('(story.hypeScore + story.ethicsScore)', 'DESC')
            .addOrderBy('story.publishedAt', 'DESC');
        }
        break;

      case 'balanced':
      default:
        // Mix of trending and important stories
        queryBuilder = queryBuilder
          .orderBy('(story.hypeScore * 0.7 + story.ethicsScore * 0.3)', 'DESC')
          .addOrderBy('story.publishedAt', 'DESC');
        break;
    }

    // Add personalization if user profile available
    if (userProfile?.industry) {
      queryBuilder = queryBuilder
        .addSelect('CASE WHEN story.impactTags && :industryTags THEN 1 ELSE 0 END', 'industry_relevance')
        .setParameter('industryTags', this.getIndustryRelevantTags(userProfile.industry));
    }

    queryBuilder = queryBuilder.take(limit);

    const stories = await queryBuilder.getMany();
    return stories;
  }

  /**
   * Generate brief content with intro, stories, and outro
   */
  private async generateBriefContent(params: {
    stories: Story[];
    duration: number;
    mode: string;
    userProfile?: any;
  }): Promise<DailyBriefResponse> {
    const { stories, duration, mode, userProfile } = params;

    const briefId = `brief_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generatedAt = new Date().toISOString();

    // Calculate estimated total time
    const estimatedTotalTime = this.calculateEstimatedTime(stories, duration);

    // Generate intro and outro text
    const introText = this.generateIntroText(duration, mode, userProfile);
    const outroText = this.generateOutroText(duration, stories.length);

    // Convert stories to brief format
    const briefStories: BriefStory[] = stories.map((story, index) => ({
      id: story.id,
      title: story.title,
      simpleSummary: story.simpleSummary || story.eli5Summary || this.generateFallbackSummary(story),
      technicalSummary: story.technicalSummary,
      sectorTag: story.sectorTag,
      hypeScore: story.hypeScore,
      ethicsScore: story.ethicsScore,
      publishedAt: story.publishedAt.toISOString(),
      company: story.company ? {
        id: story.company.id,
        name: story.company.name,
        slug: story.company.slug
      } : undefined,
      estimatedReadTime: this.calculateStoryReadTime(story),
      priority: this.determineStoryPriority(story, index, stories.length)
    }));

    // Generate personalized insights if user profile available
    const personalizedInsights = userProfile ? this.generatePersonalizedInsights(stories, userProfile) : undefined;

    return {
      briefId,
      generatedAt,
      duration,
      estimatedTotalTime,
      mode,
      stories: briefStories,
      introText,
      outroText,
      personalizedInsights
    };
  }

  /**
   * Calculate estimated total time for the brief
   */
  private calculateEstimatedTime(stories: Story[], duration: number): number {
    const introTime = 15; // 15 seconds for intro
    const outroTime = 10; // 10 seconds for outro
    const storyTime = stories.reduce((total, story) => {
      return total + this.calculateStoryReadTime(story);
    }, 0);
    const transitionTime = (stories.length - 1) * 3; // 3 seconds between stories

    return introTime + storyTime + transitionTime + outroTime;
  }

  /**
   * Calculate read time for a single story
   */
  private calculateStoryReadTime(story: Story): number {
    const wordsPerMinute = 150; // Average speaking rate
    const summaryText = story.simpleSummary || story.eli5Summary || story.content;
    const wordCount = summaryText.split(' ').length;
    
    // Add time for title and metadata
    const titleTime = Math.ceil(story.title.split(' ').length / wordsPerMinute * 60);
    const metadataTime = 5; // 5 seconds for company/sector info
    
    return Math.max(30, Math.ceil(wordCount / wordsPerMinute * 60) + titleTime + metadataTime);
  }

  /**
   * Determine story priority for ordering
   */
  private determineStoryPriority(story: Story, index: number, totalStories: number): 'high' | 'medium' | 'low' {
    if (index < Math.ceil(totalStories / 3)) return 'high';
    if (index < Math.ceil(totalStories * 2 / 3)) return 'medium';
    return 'low';
  }

  /**
   * Generate intro text for the brief
   */
  private generateIntroText(duration: number, mode: string, userProfile?: any): string {
    const userName = userProfile?.username ? `, ${userProfile.username}` : '';
    const industry = userProfile?.industry ? ` in ${userProfile.industry}` : '';
    
    let intro = `Good ${this.getTimeOfDay()}${userName}! Welcome to your ${duration}-minute tech brief${industry}. `;
    
    switch (mode) {
      case 'trending':
        intro += 'Today we\'re covering the most talked-about stories in tech. ';
        break;
      case 'personalized':
        intro += 'Here are the stories most relevant to your work and interests. ';
        break;
      case 'balanced':
      default:
        intro += 'We\'ve curated today\'s most important tech developments for you. ';
        break;
    }
    
    intro += 'Let\'s dive in.';
    
    return intro;
  }

  /**
   * Generate outro text for the brief
   */
  private generateOutroText(duration: number, storyCount: number): string {
    return `That concludes your ${duration}-minute tech brief with ${storyCount} stories. Thank you for staying informed with TexhPulze. Have a great day!`;
  }

  /**
   * Generate fallback summary if none exists
   */
  private generateFallbackSummary(story: Story): string {
    const companyText = story.company ? ` from ${story.company.name}` : '';
    return `This story covers ${story.title.toLowerCase()}${companyText} in the ${story.sectorTag} sector. The development has a hype score of ${story.hypeScore} out of 10 and an ethics score of ${story.ethicsScore} out of 10.`;
  }

  /**
   * Generate personalized insights
   */
  private generatePersonalizedInsights(stories: Story[], userProfile: any): any {
    const relevantStories = stories.filter(story => 
      story.impactTags && story.impactTags.some(tag => 
        this.getIndustryRelevantTags(userProfile.industry).includes(tag)
      )
    ).length;

    const topSectors = [...new Set(stories.map(story => story.sectorTag))].slice(0, 3);
    
    const riskAlerts = stories.filter(story => story.ethicsScore <= 3).length;

    return {
      userIndustry: userProfile.industry,
      relevantStories,
      topSectors,
      riskAlerts
    };
  }

  /**
   * Get industry-relevant impact tags
   */
  private getIndustryRelevantTags(industry: string): string[] {
    const industryTagMap: Record<string, string[]> = {
      'Customer Service': ['automation', 'ai-tools', 'job-displacement', 'customer-experience'],
      'Healthcare': ['healthcare-ai', 'medical-diagnostics', 'patient-privacy', 'ethics'],
      'Education': ['personalized-learning', 'student-privacy', 'teacher-roles', 'ai-tutoring'],
      'Finance': ['fintech', 'algorithmic-trading', 'data-security', 'regulatory-compliance'],
      'Technology': ['ai-ethics', 'data-privacy', 'developer-tools', 'cloud-security'],
      'Retail': ['e-commerce', 'automation', 'consumer-privacy', 'supply-chain'],
      'Manufacturing': ['automation', 'robotics', 'job-displacement', 'safety'],
      'Transportation': ['autonomous-vehicles', 'job-displacement', 'safety', 'logistics']
    };

    return industryTagMap[industry] || [];
  }

  /**
   * Get time of day greeting
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  /**
   * GET /briefs/stats - Get brief generation statistics
   */
  async getBriefStats(req: Request, res: Response): Promise<void> {
    try {
      const totalStories = await this.storyRepository.count({
        where: {
          publishedAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          } as any
        }
      });

      const storiesWithSummaries = await this.storyRepository.count({
        where: [
          { simpleSummary: { $ne: null } as any },
          { eli5Summary: { $ne: null } as any }
        ]
      });

      const avgHypeScore = await this.storyRepository
        .createQueryBuilder('story')
        .select('AVG(story.hypeScore)', 'avg')
        .where('story.publishedAt >= :recentDate', {
          recentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        })
        .getRawOne();

      res.status(200).json({
        success: true,
        message: 'Brief statistics retrieved successfully',
        data: {
          totalStories,
          storiesWithSummaries,
          coveragePercentage: totalStories > 0 ? Math.round((storiesWithSummaries / totalStories) * 100) : 0,
          averageHypeScore: parseFloat(avgHypeScore?.avg || '0'),
          availableDurations: [5, 10, 15],
          availableModes: ['trending', 'personalized', 'balanced']
        }
      });
    } catch (error) {
      console.error('Get brief stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching brief statistics'
      });
    }
  }
}
