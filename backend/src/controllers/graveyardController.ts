import { Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { Graveyard } from '../models/graveyard';
import { Story } from '../models/story';
import { Company } from '../models/company';
import { User } from '../models/user';
import { AuthenticatedRequest } from '../middleware/auth';

interface GraveyardQueryParams {
  search?: string;
  failureType?: string;
  companyId?: string;
  published?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface CreateGraveyardRequest {
  originalClaimStoryId: string;
  companyId?: string;
  title: string;
  followUpSummary: string;
  actualOutcome: string;
  outcomeDate: string;
  failureType: 'broken-promise' | 'overhyped' | 'failed-delivery' | 'misleading-claims' | 'cancelled-project' | 'delayed-indefinitely';
  impactAssessment?: {
    usersAffected?: number;
    financialImpact?: string;
    reputationDamage?: string;
    lessonsLearned?: string[];
  };
  originalPromises?: string;
  sources?: Array<{
    url: string;
    title: string;
    date: string;
    type: 'follow-up-article' | 'official-statement' | 'news-report' | 'social-media' | 'other';
  }>;
  isPublished?: boolean;
}

export class GraveyardController {
  private graveyardRepository = AppDataSource.getRepository(Graveyard);
  private storyRepository = AppDataSource.getRepository(Story);
  private companyRepository = AppDataSource.getRepository(Company);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * GET /graveyard - List graveyard entries with filtering and search
   */
  async getGraveyardEntries(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        failureType,
        companyId,
        published,
        page = '1',
        limit = '20',
        sortBy = 'outcomeDate',
        sortOrder = 'DESC'
      }: GraveyardQueryParams = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const queryBuilder = this.graveyardRepository.createQueryBuilder('graveyard')
        .leftJoinAndSelect('graveyard.originalClaimStory', 'originalClaimStory')
        .leftJoinAndSelect('graveyard.company', 'company')
        .leftJoinAndSelect('graveyard.creator', 'creator')
        .leftJoinAndSelect('graveyard.reviewer', 'reviewer')
        .orderBy(`graveyard.${sortBy}`, sortOrder as 'ASC' | 'DESC');

      // Add filters
      if (search) {
        queryBuilder.andWhere(
          '(graveyard.title ILIKE :search OR graveyard.followUpSummary ILIKE :search OR graveyard.actualOutcome ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (failureType && failureType !== 'all') {
        queryBuilder.andWhere('graveyard.failureType = :failureType', { failureType });
      }

      if (companyId) {
        queryBuilder.andWhere('graveyard.companyId = :companyId', { companyId });
      }

      if (published !== undefined) {
        const isPublished = published === 'true';
        queryBuilder.andWhere('graveyard.isPublished = :isPublished', { isPublished });
      }

      // Add pagination
      queryBuilder.skip(skip).take(limitNum);

      // Get total count
      const totalCount = await queryBuilder.getCount();
      const entries = await queryBuilder.getMany();

      res.status(200).json({
        success: true,
        message: 'Graveyard entries retrieved successfully',
        data: {
          entries: entries.map(entry => ({
            id: entry.id,
            title: entry.title,
            followUpSummary: entry.followUpSummary,
            actualOutcome: entry.actualOutcome,
            outcomeDate: entry.outcomeDate,
            failureType: entry.failureType,
            impactAssessment: entry.impactAssessment,
            originalPromises: entry.originalPromises,
            sources: entry.sources,
            isPublished: entry.isPublished,
            publishedAt: entry.publishedAt,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            // Related data
            originalClaimStory: entry.originalClaimStory ? {
              id: entry.originalClaimStory.id,
              title: entry.originalClaimStory.title,
              publishedAt: entry.originalClaimStory.publishedAt,
              hypeScore: entry.originalClaimStory.hypeScore,
              ethicsScore: entry.originalClaimStory.ethicsScore,
            } : null,
            company: entry.company ? {
              id: entry.company.id,
              name: entry.company.name,
              slug: entry.company.slug,
            } : null,
            creator: {
              id: entry.creator.id,
              username: entry.creator.username,
            },
            reviewer: entry.reviewer ? {
              id: entry.reviewer.id,
              username: entry.reviewer.username,
            } : null,
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum)
          },
          filters: {
            search,
            failureType,
            companyId,
            published,
            sortBy,
            sortOrder
          }
        }
      });
    } catch (error) {
      console.error('Get graveyard entries error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching graveyard entries'
      });
    }
  }

  /**
   * GET /graveyard/:id - Get single graveyard entry
   */
  async getGraveyardEntry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const entry = await this.graveyardRepository.findOne({
        where: { id },
        relations: ['originalClaimStory', 'company', 'creator', 'reviewer']
      });

      if (!entry) {
        res.status(404).json({
          success: false,
          message: 'Graveyard entry not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Graveyard entry retrieved successfully',
        data: { entry }
      });
    } catch (error) {
      console.error('Get graveyard entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching graveyard entry'
      });
    }
  }

  /**
   * POST /admin/graveyard - Create new graveyard entry (admin only)
   */
  async createGraveyardEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        originalClaimStoryId,
        companyId,
        title,
        followUpSummary,
        actualOutcome,
        outcomeDate,
        failureType,
        impactAssessment,
        originalPromises,
        sources,
        isPublished = false
      }: CreateGraveyardRequest = req.body;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user is admin
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      // Validate required fields
      if (!originalClaimStoryId || !title || !followUpSummary || !actualOutcome || !outcomeDate || !failureType) {
        res.status(400).json({
          success: false,
          message: 'Original claim story ID, title, follow-up summary, actual outcome, outcome date, and failure type are required'
        });
        return;
      }

      // Verify original claim story exists
      const originalStory = await this.storyRepository.findOne({ where: { id: originalClaimStoryId } });
      if (!originalStory) {
        res.status(404).json({
          success: false,
          message: 'Original claim story not found'
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

      // Create graveyard entry
      const newEntry = this.graveyardRepository.create({
        originalClaimStoryId,
        companyId: companyId || null,
        title,
        followUpSummary,
        actualOutcome,
        outcomeDate: new Date(outcomeDate),
        failureType,
        impactAssessment: impactAssessment || null,
        originalPromises: originalPromises || null,
        sources: sources || null,
        createdBy: userId,
        isPublished,
        publishedAt: isPublished ? new Date() : null
      });

      const savedEntry = await this.graveyardRepository.save(newEntry);

      // Fetch the complete entry with relations
      const completeEntry = await this.graveyardRepository.findOne({
        where: { id: savedEntry.id },
        relations: ['originalClaimStory', 'company', 'creator', 'reviewer']
      });

      res.status(201).json({
        success: true,
        message: 'Graveyard entry created successfully',
        data: { entry: completeEntry }
      });
    } catch (error) {
      console.error('Create graveyard entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating graveyard entry'
      });
    }
  }

  /**
   * PUT /admin/graveyard/:id - Update graveyard entry (admin only)
   */
  async updateGraveyardEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user is admin
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      // Find the entry
      const entry = await this.graveyardRepository.findOne({ where: { id } });
      if (!entry) {
        res.status(404).json({
          success: false,
          message: 'Graveyard entry not found'
        });
        return;
      }

      // Update fields
      if (updateData.outcomeDate) {
        updateData.outcomeDate = new Date(updateData.outcomeDate);
      }

      if (updateData.isPublished && !entry.isPublished) {
        updateData.publishedAt = new Date();
      }

      await this.graveyardRepository.update(id, updateData);

      // Fetch updated entry
      const updatedEntry = await this.graveyardRepository.findOne({
        where: { id },
        relations: ['originalClaimStory', 'company', 'creator', 'reviewer']
      });

      res.status(200).json({
        success: true,
        message: 'Graveyard entry updated successfully',
        data: { entry: updatedEntry }
      });
    } catch (error) {
      console.error('Update graveyard entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating graveyard entry'
      });
    }
  }

  /**
   * DELETE /admin/graveyard/:id - Delete graveyard entry (admin only)
   */
  async deleteGraveyardEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Check if user is admin
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      // Find and delete the entry
      const entry = await this.graveyardRepository.findOne({ where: { id } });
      if (!entry) {
        res.status(404).json({
          success: false,
          message: 'Graveyard entry not found'
        });
        return;
      }

      await this.graveyardRepository.remove(entry);

      res.status(200).json({
        success: true,
        message: 'Graveyard entry deleted successfully'
      });
    } catch (error) {
      console.error('Delete graveyard entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting graveyard entry'
      });
    }
  }

  /**
   * GET /graveyard/stats - Get graveyard statistics
   */
  async getGraveyardStats(req: Request, res: Response): Promise<void> {
    try {
      const totalEntries = await this.graveyardRepository.count();
      const publishedEntries = await this.graveyardRepository.count({ where: { isPublished: true } });
      const unpublishedEntries = await this.graveyardRepository.count({ where: { isPublished: false } });

      // Count by failure type
      const failureTypeStats = await this.graveyardRepository
        .createQueryBuilder('graveyard')
        .select('graveyard.failureType', 'failureType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('graveyard.failureType')
        .getRawMany();

      // Recent entries (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentEntries = await this.graveyardRepository.count({
        where: {
          createdAt: {
            $gte: thirtyDaysAgo
          } as any
        }
      });

      res.status(200).json({
        success: true,
        message: 'Graveyard statistics retrieved successfully',
        data: {
          total: totalEntries,
          published: publishedEntries,
          unpublished: unpublishedEntries,
          recent: recentEntries,
          byFailureType: failureTypeStats.reduce((acc, stat) => {
            acc[stat.failureType] = parseInt(stat.count);
            return acc;
          }, {} as Record<string, number>)
        }
      });
    } catch (error) {
      console.error('Get graveyard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching graveyard statistics'
      });
    }
  }
}
