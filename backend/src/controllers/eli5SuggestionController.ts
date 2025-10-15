import { Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { Eli5Suggestion } from '../models/eli5Suggestion';
import { Story } from '../models/story';
import { User } from '../models/user';
import { AuthenticatedRequest } from '../middleware/auth';

interface Eli5SuggestionQueryParams {
  storyId?: string;
  status?: string;
  mode?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface CreateSuggestionRequest {
  storyId: string;
  mode: 'simple' | 'technical';
  suggestedText: string;
  explanation?: string;
}

export class Eli5SuggestionController {
  private suggestionRepository = AppDataSource.getRepository(Eli5Suggestion);
  private storyRepository = AppDataSource.getRepository(Story);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * GET /eli5-suggestions - List ELI5 suggestions with filtering
   */
  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const {
        storyId,
        status,
        mode,
        page = '1',
        limit = '20',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      }: Eli5SuggestionQueryParams = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const queryBuilder = this.suggestionRepository.createQueryBuilder('suggestion')
        .leftJoinAndSelect('suggestion.story', 'story')
        .leftJoinAndSelect('suggestion.user', 'user')
        .leftJoinAndSelect('suggestion.reviewer', 'reviewer')
        .orderBy(`suggestion.${sortBy}`, sortOrder as 'ASC' | 'DESC');

      // Add filters
      if (storyId) {
        queryBuilder.andWhere('suggestion.storyId = :storyId', { storyId });
      }

      if (status && status !== 'all') {
        queryBuilder.andWhere('suggestion.status = :status', { status });
      }

      if (mode && mode !== 'all') {
        queryBuilder.andWhere('suggestion.mode = :mode', { mode });
      }

      // Add pagination
      queryBuilder.skip(skip).take(limitNum);

      // Get total count
      const totalCount = await queryBuilder.getCount();
      const suggestions = await queryBuilder.getMany();

      res.status(200).json({
        success: true,
        message: 'ELI5 suggestions retrieved successfully',
        data: {
          suggestions: suggestions.map(suggestion => ({
            id: suggestion.id,
            storyId: suggestion.storyId,
            mode: suggestion.mode,
            suggestedText: suggestion.suggestedText,
            explanation: suggestion.explanation,
            status: suggestion.status,
            reviewNotes: suggestion.reviewNotes,
            upvotes: suggestion.upvotes,
            downvotes: suggestion.downvotes,
            netVotes: suggestion.netVotes,
            createdAt: suggestion.createdAt,
            reviewedAt: suggestion.reviewedAt,
            // Related data
            story: suggestion.story ? {
              id: suggestion.story.id,
              title: suggestion.story.title,
            } : null,
            user: {
              id: suggestion.user.id,
              username: suggestion.user.username,
            },
            reviewer: suggestion.reviewer ? {
              id: suggestion.reviewer.id,
              username: suggestion.reviewer.username,
            } : null,
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum)
          },
          filters: {
            storyId,
            status,
            mode,
            sortBy,
            sortOrder
          }
        }
      });
    } catch (error) {
      console.error('Get ELI5 suggestions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching ELI5 suggestions'
      });
    }
  }

  /**
   * POST /eli5-suggestions - Create new ELI5 suggestion
   */
  async createSuggestion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        storyId,
        mode,
        suggestedText,
        explanation
      }: CreateSuggestionRequest = req.body;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Validate required fields
      if (!storyId || !mode || !suggestedText) {
        res.status(400).json({
          success: false,
          message: 'Story ID, mode, and suggested text are required'
        });
        return;
      }

      if (!['simple', 'technical'].includes(mode)) {
        res.status(400).json({
          success: false,
          message: 'Mode must be simple or technical'
        });
        return;
      }

      // Verify story exists
      const story = await this.storyRepository.findOne({ where: { id: storyId } });
      if (!story) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }

      // Check for existing pending suggestion by same user for same story and mode
      const existingSuggestion = await this.suggestionRepository.findOne({
        where: {
          storyId,
          userId,
          mode,
          status: 'pending'
        }
      });

      if (existingSuggestion) {
        res.status(409).json({
          success: false,
          message: 'You already have a pending suggestion for this story and mode'
        });
        return;
      }

      // Create suggestion
      const newSuggestion = this.suggestionRepository.create({
        storyId,
        userId,
        mode,
        suggestedText,
        explanation: explanation || null,
        status: 'pending'
      });

      const savedSuggestion = await this.suggestionRepository.save(newSuggestion);

      // Fetch the complete suggestion with relations
      const completeSuggestion = await this.suggestionRepository.findOne({
        where: { id: savedSuggestion.id },
        relations: ['story', 'user']
      });

      res.status(201).json({
        success: true,
        message: 'ELI5 suggestion created successfully',
        data: { suggestion: completeSuggestion }
      });
    } catch (error) {
      console.error('Create ELI5 suggestion error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating ELI5 suggestion'
      });
    }
  }

  /**
   * PUT /eli5-suggestions/:id - Update ELI5 suggestion (admin only)
   */
  async updateSuggestion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;

      const adminUserId = req.user?.id;
      if (!adminUserId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user is admin
      const adminUser = await this.userRepository.findOne({ where: { id: adminUserId } });
      if (!adminUser || !adminUser.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      // Find the suggestion
      const suggestion = await this.suggestionRepository.findOne({
        where: { id },
        relations: ['story']
      });

      if (!suggestion) {
        res.status(404).json({
          success: false,
          message: 'ELI5 suggestion not found'
        });
        return;
      }

      if (suggestion.status !== 'pending') {
        res.status(400).json({
          success: false,
          message: 'Suggestion has already been processed'
        });
        return;
      }

      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status must be approved or rejected'
        });
        return;
      }

      // Update suggestion
      suggestion.status = status;
      suggestion.reviewNotes = reviewNotes || null;
      suggestion.reviewedBy = adminUserId;
      suggestion.reviewedAt = new Date();

      await this.suggestionRepository.save(suggestion);

      // If approved, update the story with the suggested text
      if (status === 'approved') {
        const updateData: Partial<Story> = {};
        
        if (suggestion.mode === 'simple') {
          updateData.simpleSummary = suggestion.suggestedText;
          updateData.eli5Summary = suggestion.suggestedText;
        } else {
          updateData.technicalSummary = suggestion.suggestedText;
        }

        await this.storyRepository.update(suggestion.storyId, updateData);
      }

      res.status(200).json({
        success: true,
        message: `ELI5 suggestion ${status} successfully`,
        data: {
          suggestionId: suggestion.id,
          status: suggestion.status,
          reviewedAt: suggestion.reviewedAt,
          storyUpdated: status === 'approved'
        }
      });
    } catch (error) {
      console.error('Update ELI5 suggestion error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating ELI5 suggestion'
      });
    }
  }

  /**
   * POST /eli5-suggestions/:id/vote - Vote on ELI5 suggestion
   */
  async voteOnSuggestion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { voteType } = req.body; // 'upvote' or 'downvote'

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!['upvote', 'downvote'].includes(voteType)) {
        res.status(400).json({
          success: false,
          message: 'Vote type must be upvote or downvote'
        });
        return;
      }

      // Find the suggestion
      const suggestion = await this.suggestionRepository.findOne({ where: { id } });
      if (!suggestion) {
        res.status(404).json({
          success: false,
          message: 'ELI5 suggestion not found'
        });
        return;
      }

      // Update vote counts (simplified - in production you'd want user-specific voting)
      if (voteType === 'upvote') {
        suggestion.upvotes += 1;
      } else {
        suggestion.downvotes += 1;
      }

      await this.suggestionRepository.save(suggestion);

      res.status(200).json({
        success: true,
        message: 'Vote recorded successfully',
        data: {
          suggestionId: suggestion.id,
          upvotes: suggestion.upvotes,
          downvotes: suggestion.downvotes,
          netVotes: suggestion.netVotes
        }
      });
    } catch (error) {
      console.error('Vote on ELI5 suggestion error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while voting on ELI5 suggestion'
      });
    }
  }

  /**
   * GET /eli5-suggestions/stats - Get ELI5 suggestions statistics
   */
  async getSuggestionStats(req: Request, res: Response): Promise<void> {
    try {
      const totalSuggestions = await this.suggestionRepository.count();
      const pendingSuggestions = await this.suggestionRepository.count({ where: { status: 'pending' } });
      const approvedSuggestions = await this.suggestionRepository.count({ where: { status: 'approved' } });
      const rejectedSuggestions = await this.suggestionRepository.count({ where: { status: 'rejected' } });

      // Count by mode
      const simpleSuggestions = await this.suggestionRepository.count({ where: { mode: 'simple' } });
      const technicalSuggestions = await this.suggestionRepository.count({ where: { mode: 'technical' } });

      // Recent suggestions (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentSuggestions = await this.suggestionRepository.count({
        where: {
          createdAt: {
            $gte: sevenDaysAgo
          } as any
        }
      });

      res.status(200).json({
        success: true,
        message: 'ELI5 suggestions statistics retrieved successfully',
        data: {
          total: totalSuggestions,
          pending: pendingSuggestions,
          approved: approvedSuggestions,
          rejected: rejectedSuggestions,
          recent: recentSuggestions,
          byMode: {
            simple: simpleSuggestions,
            technical: technicalSuggestions
          },
          approvalRate: totalSuggestions > 0 ? Math.round((approvedSuggestions / totalSuggestions) * 100) : 0
        }
      });
    } catch (error) {
      console.error('Get ELI5 suggestions stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching ELI5 suggestions statistics'
      });
    }
  }
}

