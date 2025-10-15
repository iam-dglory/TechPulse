import { Request, Response } from 'express';
import { Repository, Like, In, Between } from 'typeorm';
import { AppDataSource } from '../../ormconfig';
import { Story } from '../models/story';
import { Company } from '../models/company';
import { Vote } from '../models/vote';
import { User } from '../models/user';
import { AuthenticatedRequest } from '../middleware/auth';
import { ScoringPipeline, StoryContent, CompanyData } from '../services/scoring';
import { meetsRecommendationThreshold, getIndustryMapping } from '../config/industryImpactMap';
import { eli5Service } from '../services/eli5Service';
import { eventTracker } from '../services/analytics/eventTracker';

// Types for request bodies
interface CreateStoryRequest {
  title: string;
  content: string;
  sourceUrl?: string;
  companyId?: string;
  sectorTag: string;
  impactTags: string[];
  publishedAt?: string;
}

interface UpdateStoryRequest {
  title?: string;
  content?: string;
  sourceUrl?: string;
  companyId?: string;
  sectorTag?: string;
  impactTags?: string[];
  realityCheck?: string;
  publishedAt?: string;
}

interface StoryQueryParams {
  sectorTag?: string;
  companyId?: string;
  impactTag?: string;
  sort?: 'hot' | 'new' | 'top' | 'trending';
  page?: string;
  limit?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  recommendedFor?: string;
}

interface DiscussionRequest {
  comment: string;
  industry: string;
  voteValue: 'helpful' | 'harmful' | 'neutral';
}

export class StoryController {
  private storyRepository: Repository<Story>;
  private companyRepository: Repository<Company>;
  private voteRepository: Repository<Vote>;
  private userRepository: Repository<User>;
  private scoringPipeline: ScoringPipeline;

  constructor() {
    this.storyRepository = AppDataSource.getRepository(Story);
    this.companyRepository = AppDataSource.getRepository(Company);
    this.voteRepository = AppDataSource.getRepository(Vote);
    this.userRepository = AppDataSource.getRepository(User);
    this.scoringPipeline = new ScoringPipeline();
  }

  /**
   * GET /stories - List stories with filtering and sorting
   */
  async getStories(req: Request, res: Response): Promise<void> {
    try {
      const {
        sectorTag,
        companyId,
        impactTag,
        sort = 'new',
        page = '1',
        limit = '20',
        search,
        dateFrom,
        dateTo,
        recommendedFor
      }: StoryQueryParams = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const queryBuilder = this.storyRepository.createQueryBuilder('story')
        .leftJoinAndSelect('story.company', 'company')
        .leftJoinAndSelect('story.votes', 'votes');

      // Add filters
      if (sectorTag) {
        queryBuilder.andWhere('story.sectorTag = :sectorTag', { sectorTag });
      }

      if (companyId) {
        queryBuilder.andWhere('story.companyId = :companyId', { companyId });
      }

      if (impactTag) {
        queryBuilder.andWhere('story.impactTags @> :impactTag', { impactTag: `["${impactTag}"]` });
      }

      if (search) {
        queryBuilder.andWhere(
          '(story.title ILIKE :search OR story.content ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (dateFrom && dateTo) {
        queryBuilder.andWhere('story.publishedAt BETWEEN :dateFrom AND :dateTo', {
          dateFrom: new Date(dateFrom),
          dateTo: new Date(dateTo)
        });
      }

      // Only show published stories
      queryBuilder.andWhere('story.publishedAt IS NOT NULL');
      queryBuilder.andWhere('story.publishedAt <= :now', { now: new Date() });

      // Handle recommendation filtering
      let recommendedStoryIds: string[] = [];
      if (recommendedFor) {
        // Get all stories first to apply recommendation logic
        const allStories = await queryBuilder.getMany();
        
        // Filter stories based on industry recommendation threshold
        recommendedStoryIds = allStories
          .filter(story => meetsRecommendationThreshold(story, recommendedFor))
          .map(story => story.id);

        if (recommendedStoryIds.length > 0) {
          // Clear existing query and rebuild with story IDs
          queryBuilder.where('story.id IN (:...storyIds)', { storyIds: recommendedStoryIds });
        } else {
          // No stories meet recommendation threshold, return empty result
          res.status(200).json({
            success: true,
            message: `No stories recommended for ${recommendedFor}`,
            data: {
              stories: [],
              pagination: {
                page: pageNum,
                limit: limitNum,
                total: 0,
                pages: 0
              },
              filters: {
                sectorTag,
                companyId,
                impactTag,
                sort,
                search,
                recommendedFor
              },
              recommendationInfo: {
                industry: recommendedFor,
                threshold: getIndustryMapping(recommendedFor)?.mapping.threshold || 0,
                totalEligible: allStories.length
              }
            }
          });
          return;
        }
      }

      // Add sorting
      switch (sort) {
        case 'hot':
          // Hot: combination of recent + high engagement
          queryBuilder
            .orderBy('story.createdAt', 'DESC')
            .addOrderBy('story.hypeScore', 'DESC')
            .addOrderBy('story.ethicsScore', 'DESC');
          break;
        case 'top':
          // Top: highest overall scores
          queryBuilder
            .orderBy('story.hypeScore', 'DESC')
            .addOrderBy('story.ethicsScore', 'DESC')
            .addOrderBy('story.publishedAt', 'DESC');
          break;
        case 'trending':
          // Trending: high engagement in last 24 hours
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
          queryBuilder
            .andWhere('story.createdAt >= :yesterday', { yesterday })
            .orderBy('story.hypeScore', 'DESC')
            .addOrderBy('story.ethicsScore', 'DESC');
          break;
        case 'new':
        default:
          // New: most recent first
          queryBuilder.orderBy('story.publishedAt', 'DESC');
          break;
      }

      // Add pagination
      queryBuilder.skip(skip).take(limitNum);

      // Get total count for pagination
      const totalCount = await queryBuilder.getCount();
      const stories = await queryBuilder.getMany();

      // Calculate sentiment scores for each story
      const storiesWithSentiment = stories.map(story => ({
        ...story,
        sentimentScore: this.calculateSentimentScore(story.votes || []),
        voteCount: story.votes?.length || 0,
        helpfulVotes: story.votes?.filter(vote => vote.voteValue === 'helpful').length || 0,
        harmfulVotes: story.votes?.filter(vote => vote.voteValue === 'harmful').length || 0
      }));

      res.status(200).json({
        success: true,
        message: 'Stories retrieved successfully',
        data: {
          stories: storiesWithSentiment,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum)
          },
          filters: {
            sectorTag,
            companyId,
            impactTag,
            sort,
            search,
            recommendedFor
          },
          ...(recommendedFor && {
            recommendationInfo: {
              industry: recommendedFor,
              threshold: getIndustryMapping(recommendedFor)?.mapping.threshold || 0,
              totalEligible: recommendedStoryIds.length,
              applied: true
            }
          })
        }
      });
    } catch (error) {
      console.error('Get stories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching stories'
      });
    }
  }

  /**
   * GET /stories/:id - Get story by ID
   */
  async getStoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const story = await this.storyRepository.findOne({
        where: { id },
        relations: ['company', 'votes']
      });

      if (!story) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }

      // Calculate sentiment score
      const sentimentScore = this.calculateSentimentScore(story.votes || []);

      res.status(200).json({
        success: true,
        message: 'Story retrieved successfully',
        data: {
          story: {
            ...story,
            sentimentScore,
            voteCount: story.votes?.length || 0,
            helpfulVotes: story.votes?.filter(vote => vote.voteValue === 'helpful').length || 0,
            harmfulVotes: story.votes?.filter(vote => vote.voteValue === 'harmful').length || 0
          }
        }
      });
    } catch (error) {
      console.error('Get story error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching story'
      });
    }
  }

  /**
   * POST /stories - Create new story
   */
  async createStory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        title,
        content,
        sourceUrl,
        companyId,
        sectorTag,
        impactTags,
        publishedAt
      }: CreateStoryRequest = req.body;

      const createdBy = req.user?.username || 'anonymous';

      // Validation
      if (!title || !content || !sectorTag || !impactTags) {
        res.status(400).json({
          success: false,
          message: 'Title, content, sectorTag, and impactTags are required'
        });
        return;
      }

      // Verify company exists if provided
      if (companyId) {
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Company not found'
          });
          return;
        }
      }

      // Get company data if provided
      let companyData: CompanyData | undefined;
      if (companyId) {
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (company) {
          companyData = {
            id: company.id,
            name: company.name,
            ethicsStatementUrl: company.ethicsStatementUrl,
            privacyPolicyUrl: company.privacyPolicyUrl,
            sectorTags: company.sectorTags,
            credibilityScore: company.credibilityScore,
            ethicsScore: company.ethicsScore
          };
        }
      }

      // Calculate scores using scoring pipeline
      const storyContent: StoryContent = {
        title,
        content,
        sourceUrl,
        companyId
      };

      const scores = await this.scoringPipeline.scoreStoryLocally(storyContent, companyData);

      // Create new story
      const newStory = this.storyRepository.create({
        title,
        content,
        sourceUrl,
        companyId,
        sectorTag,
        impactTags: scores.impactTags,
        hypeScore: scores.hypeScore,
        ethicsScore: scores.ethicsScore,
        realityCheck: scores.realityCheck,
        createdBy,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date()
      });

      const savedStory = await this.storyRepository.save(newStory);

      // Track story creation event
      await eventTracker.trackStoryCreated(savedStory, req.user);

      // Queue for OpenAI enhancement if configured
      if (this.scoringPipeline.getOpenAIConfigurationStatus().configured) {
        try {
          await this.scoringPipeline.queueStoryForEnhancement(
            savedStory.id,
            storyContent,
            companyData
          );
        } catch (error) {
          console.warn('Failed to queue story for OpenAI enhancement:', error);
        }
      }

      // Load with relations
      const storyWithRelations = await this.storyRepository.findOne({
        where: { id: savedStory.id },
        relations: ['company']
      });

      res.status(201).json({
        success: true,
        message: 'Story created successfully',
        data: { story: storyWithRelations }
      });
    } catch (error) {
      console.error('Create story error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating story'
      });
    }
  }

  /**
   * PATCH /stories/:id - Update story
   */
  async updateStory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateStoryRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const story = await this.storyRepository.findOne({ where: { id } });
      if (!story) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }

      // Check permissions (creator or admin)
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const isAdmin = user?.email.includes('admin') || user?.username.includes('admin');
      const isCreator = story.createdBy === req.user?.username;

      if (!isAdmin && !isCreator) {
        res.status(403).json({
          success: false,
          message: 'Permission denied. Only the creator or admin can edit this story.'
        });
        return;
      }

      // Recalculate scores if content changed
      if (updateData.title || updateData.content || updateData.sectorTag || updateData.impactTags) {
        // Get company data if needed
        let companyData: CompanyData | undefined;
        const companyId = updateData.companyId || story.companyId;
        if (companyId) {
          const company = await this.companyRepository.findOne({ where: { id: companyId } });
          if (company) {
            companyData = {
              id: company.id,
              name: company.name,
              ethicsStatementUrl: company.ethicsStatementUrl,
              privacyPolicyUrl: company.privacyPolicyUrl,
              sectorTags: company.sectorTags,
              credibilityScore: company.credibilityScore,
              ethicsScore: company.ethicsScore
            };
          }
        }

        const storyContent: StoryContent = {
          title: updateData.title || story.title,
          content: updateData.content || story.content,
          sourceUrl: updateData.sourceUrl || story.sourceUrl,
          companyId
        };

        const scores = await this.scoringPipeline.scoreStoryLocally(storyContent, companyData);

        updateData.hypeScore = scores.hypeScore;
        updateData.ethicsScore = scores.ethicsScore;
        if (scores.realityCheck) {
          updateData.realityCheck = scores.realityCheck;
        }
      }

      // Update story
      Object.assign(story, updateData);
      const updatedStory = await this.storyRepository.save(story);

      res.status(200).json({
        success: true,
        message: 'Story updated successfully',
        data: { story: updatedStory }
      });
    } catch (error) {
      console.error('Update story error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating story'
      });
    }
  }

  /**
   * GET /stories/:id/discussions - Get story discussions/votes
   */
  async getStoryDiscussions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const story = await this.storyRepository.findOne({ where: { id } });
      if (!story) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }

      // Get votes/discussions with pagination
      const votes = await this.voteRepository.find({
        where: { storyId: id },
        order: { createdAt: 'DESC' },
        skip,
        take: limitNum
      });

      const totalVotes = await this.voteRepository.count({ where: { storyId: id } });

      // Calculate sentiment breakdown
      const sentimentBreakdown = {
        helpful: await this.voteRepository.count({ where: { storyId: id, voteValue: 'helpful' } }),
        harmful: await this.voteRepository.count({ where: { storyId: id, voteValue: 'harmful' } }),
        neutral: await this.voteRepository.count({ where: { storyId: id, voteValue: 'neutral' } })
      };

      res.status(200).json({
        success: true,
        message: 'Story discussions retrieved successfully',
        data: {
          discussions: votes,
          sentimentBreakdown,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalVotes,
            pages: Math.ceil(totalVotes / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Get story discussions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching discussions'
      });
    }
  }

  /**
   * POST /stories/:id/discussions - Add discussion/vote
   */
  async addStoryDiscussion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { comment, industry, voteValue }: DiscussionRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!industry || !voteValue) {
        res.status(400).json({
          success: false,
          message: 'Industry and voteValue are required'
        });
        return;
      }

      const story = await this.storyRepository.findOne({ where: { id } });
      if (!story) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }

      // Check if user already voted
      const existingVote = await this.voteRepository.findOne({
        where: { storyId: id, userId }
      });

      if (existingVote) {
        res.status(409).json({
          success: false,
          message: 'You have already voted on this story'
        });
        return;
      }

      // Create new vote/discussion
      const newVote = this.voteRepository.create({
        storyId: id,
        userId,
        industry,
        voteValue,
        comment: comment || null
      });

      const savedVote = await this.voteRepository.save(newVote);

      // Track story vote event
      await eventTracker.trackStoryVoted(story, savedVote, req.user);

      res.status(201).json({
        success: true,
        message: 'Discussion added successfully',
        data: { vote: savedVote }
      });
    } catch (error) {
      console.error('Add story discussion error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while adding discussion'
      });
    }
  }

  /**
   * DELETE /stories/:id - Delete story (admin or creator)
   */
  async deleteStory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const story = await this.storyRepository.findOne({ where: { id } });
      if (!story) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }

      // Check permissions
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const isAdmin = user?.email.includes('admin') || user?.username.includes('admin');
      const isCreator = story.createdBy === req.user?.username;

      if (!isAdmin && !isCreator) {
        res.status(403).json({
          success: false,
          message: 'Permission denied. Only the creator or admin can delete this story.'
        });
        return;
      }

      await this.storyRepository.remove(story);

      res.status(200).json({
        success: true,
        message: 'Story deleted successfully'
      });
    } catch (error) {
      console.error('Delete story error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting story'
      });
    }
  }

  /**
   * Get scoring job status
   */
  async getScoringJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = await this.scoringPipeline.getScoringJobStatus(jobId);
      
      if (!job) {
        res.status(404).json({
          success: false,
          message: 'Scoring job not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Scoring job status retrieved successfully',
        data: { job }
      });
    } catch (error) {
      console.error('Get scoring job status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching scoring job status'
      });
    }
  }

  /**
   * Get scoring statistics
   */
  async getScoringStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.scoringPipeline.getScoringStats();
      
      res.status(200).json({
        success: true,
        message: 'Scoring statistics retrieved successfully',
        data: { stats }
      });
    } catch (error) {
      console.error('Get scoring stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching scoring statistics'
      });
    }
  }

  /**
   * Test OpenAI connection
   */
  async testOpenAIConnection(req: Request, res: Response): Promise<void> {
    try {
      const isConnected = await this.scoringPipeline.testOpenAIConnection();
      const config = this.scoringPipeline.getOpenAIConfigurationStatus();
      
      res.status(200).json({
        success: true,
        message: 'OpenAI connection test completed',
        data: {
          connected: isConnected,
          configured: config.configured,
          hasApiKey: config.hasApiKey
        }
      });
    } catch (error) {
      console.error('Test OpenAI connection error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while testing OpenAI connection'
      });
    }
  }

  /**
   * POST /stories/:id/eli5 - Generate ELI5 explanations for a story
   */
  async generateELI5(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { mode = 'both' } = req.body;

      if (!['simple', 'technical', 'both'].includes(mode)) {
        res.status(400).json({
          success: false,
          message: 'Mode must be simple, technical, or both'
        });
        return;
      }

      const result = await eli5Service.explainTextForStory(id, mode);

      res.status(200).json({
        success: true,
        message: 'ELI5 explanations generated successfully',
        data: {
          storyId: id,
          mode,
          ...result
        }
      });
    } catch (error) {
      console.error('Generate ELI5 error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating ELI5 explanations'
      });
    }
  }

  /**
   * GET /stories/:id/eli5 - Get cached ELI5 explanations
   */
  async getELI5(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { mode = 'both' } = req.query;

      if (!['simple', 'technical', 'both'].includes(mode as string)) {
        res.status(400).json({
          success: false,
          message: 'Mode must be simple, technical, or both'
        });
        return;
      }

      const story = await this.storyRepository.findOne({ 
        where: { id },
        select: ['simpleSummary', 'technicalSummary', 'eli5Summary']
      });

      if (!story) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }

      const result: any = {
        storyId: id,
        mode,
        hasCached: false
      };

      if (mode === 'simple' || mode === 'both') {
        result.simpleSummary = story.simpleSummary || story.eli5Summary;
        result.hasSimple = !!(story.simpleSummary || story.eli5Summary);
      }

      if (mode === 'technical' || mode === 'both') {
        result.technicalSummary = story.technicalSummary;
        result.hasTechnical = !!story.technicalSummary;
      }

      if (mode === 'both') {
        result.hasCached = !!(story.simpleSummary || story.eli5Summary) && !!story.technicalSummary;
      } else {
        result.hasCached = mode === 'simple' ? 
          !!(story.simpleSummary || story.eli5Summary) : 
          !!story.technicalSummary;
      }

      res.status(200).json({
        success: true,
        message: 'ELI5 explanations retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Get ELI5 error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving ELI5 explanations'
      });
    }
  }

  /**
   * DELETE /stories/:id/eli5 - Clear cached ELI5 explanations
   */
  async clearELI5(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user is admin or story creator
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const story = await this.storyRepository.findOne({ where: { id } });
      if (!story) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || (!user.isActive && story.createdBy !== userId)) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required or must be story creator'
        });
        return;
      }

      await eli5Service.clearCachedSummaries(id);

      res.status(200).json({
        success: true,
        message: 'ELI5 explanations cleared successfully',
        data: { storyId: id }
      });
    } catch (error) {
      console.error('Clear ELI5 error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while clearing ELI5 explanations'
      });
    }
  }

  /**
   * Calculate sentiment score from votes
   */
  private calculateSentimentScore(votes: Vote[]): number {
    if (votes.length === 0) return 0;

    const helpfulCount = votes.filter(vote => vote.voteValue === 'helpful').length;
    const harmfulCount = votes.filter(vote => vote.voteValue === 'harmful').length;
    const neutralCount = votes.filter(vote => vote.voteValue === 'neutral').length;

    const totalWeighted = (helpfulCount * 1) + (harmfulCount * -1) + (neutralCount * 0);
    return totalWeighted / votes.length;
  }
}
