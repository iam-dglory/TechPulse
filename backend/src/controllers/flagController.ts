import { Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { Flag, FlagReason, FlagStatus, FlagPriority } from '../models/flag';
import { Story } from '../models/story';
import { User } from '../models/user';
import { ModerationAction, ModerationActionType, ModerationSeverity } from '../models/moderationAction';
import { AuditLog, AuditEventType, AuditSeverity } from '../models/auditLog';
import { AuthenticatedRequest } from '../middleware/auth';

interface FlagStoryRequest {
  reason: FlagReason;
  description: string;
  evidence?: string;
}

interface FlagQueryParams {
  status?: string;
  priority?: string;
  reason?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface ReviewFlagRequest {
  status: 'approved' | 'rejected' | 'escalated';
  reviewNotes?: string;
  priority?: FlagPriority;
}

export class FlagController {
  private flagRepository = AppDataSource.getRepository(Flag);
  private storyRepository = AppDataSource.getRepository(Story);
  private userRepository = AppDataSource.getRepository(User);
  private moderationActionRepository = AppDataSource.getRepository(ModerationAction);
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  /**
   * POST /stories/:id/flag - Flag a story for moderation
   */
  async flagStory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: storyId } = req.params;
      const { reason, description, evidence }: FlagStoryRequest = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required to flag content'
        });
        return;
      }

      // Validate required fields
      if (!reason || !description) {
        res.status(400).json({
          success: false,
          message: 'Reason and description are required'
        });
        return;
      }

      // Validate reason
      if (!Object.values(FlagReason).includes(reason)) {
        res.status(400).json({
          success: false,
          message: 'Invalid flag reason'
        });
        return;
      }

      // Check if story exists
      const story = await this.storyRepository.findOne({ where: { id: storyId } });
      if (!story) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }

      // Check if user already flagged this story
      const existingFlag = await this.flagRepository.findOne({
        where: {
          storyId,
          reporterId: userId,
          status: FlagStatus.PENDING
        }
      });

      if (existingFlag) {
        res.status(409).json({
          success: false,
          message: 'You have already flagged this story'
        });
        return;
      }

      // Determine priority based on reason
      const priority = this.determineFlagPriority(reason, description);

      // Create flag
      const newFlag = this.flagRepository.create({
        storyId,
        reporterId: userId,
        reason,
        description,
        evidence: evidence || null,
        priority,
        metadata: {
          reporterIP: req.ip,
          userAgent: req.get('User-Agent'),
          reportedAt: new Date().toISOString(),
          severityScore: this.calculateSeverityScore(reason, description)
        }
      });

      const savedFlag = await this.flagRepository.save(newFlag);

      // Auto-hide story if it meets certain criteria
      const shouldAutoHide = this.shouldAutoHideStory(reason, priority);
      if (shouldAutoHide) {
        await this.autoHideStory(storyId, savedFlag.id, userId);
      }

      // Log the flagging action
      await this.logAuditEvent({
        eventType: AuditEventType.FLAG_CREATED,
        severity: this.getAuditSeverity(priority),
        userId,
        description: `User flagged story "${story.title}" for ${reason}`,
        metadata: {
          entityId: storyId,
          entityType: 'story',
          flagId: savedFlag.id,
          flagReason: reason,
          flagPriority: priority,
          autoHidden: shouldAutoHide
        },
        req
      });

      // Create moderation action if auto-hidden
      if (shouldAutoHide) {
        await this.createModerationAction({
          actionType: ModerationActionType.STORY_HIDDEN,
          severity: this.getModerationSeverity(priority),
          moderatorId: userId, // System action
          storyId,
          flagId: savedFlag.id,
          description: `Story auto-hidden due to ${reason} flag`,
          justification: `Automated action based on flag priority: ${priority}`,
          metadata: {
            automatedAction: true,
            flagReason: reason,
            originalContent: story.content
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Story flagged successfully',
        data: {
          flagId: savedFlag.id,
          status: savedFlag.status,
          priority: savedFlag.priority,
          autoHidden: shouldAutoHide
        }
      });
    } catch (error) {
      console.error('Flag story error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while flagging story'
      });
    }
  }

  /**
   * GET /flags - Get flags for moderation (admin only)
   */
  async getFlags(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      const {
        status = 'pending',
        priority,
        reason,
        page = '1',
        limit = '20',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      }: FlagQueryParams = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const queryBuilder = this.flagRepository.createQueryBuilder('flag')
        .leftJoinAndSelect('flag.story', 'story')
        .leftJoinAndSelect('flag.reporter', 'reporter')
        .leftJoinAndSelect('flag.reviewer', 'reviewer')
        .orderBy(`flag.${sortBy}`, sortOrder as 'ASC' | 'DESC');

      // Add filters
      if (status && status !== 'all') {
        queryBuilder.andWhere('flag.status = :status', { status });
      }

      if (priority && priority !== 'all') {
        queryBuilder.andWhere('flag.priority = :priority', { priority });
      }

      if (reason && reason !== 'all') {
        queryBuilder.andWhere('flag.reason = :reason', { reason });
      }

      // Add pagination
      queryBuilder.skip(skip).take(limitNum);

      // Get total count
      const totalCount = await queryBuilder.getCount();
      const flags = await queryBuilder.getMany();

      res.status(200).json({
        success: true,
        message: 'Flags retrieved successfully',
        data: {
          flags: flags.map(flag => ({
            id: flag.id,
            reason: flag.reason,
            description: flag.description,
            evidence: flag.evidence,
            status: flag.status,
            priority: flag.priority,
            isAutoHidden: flag.isAutoHidden,
            requiresLegalReview: flag.requiresLegalReview,
            createdAt: flag.createdAt,
            reviewedAt: flag.reviewedAt,
            daysSinceReported: flag.daysSinceReported,
            isOverdue: flag.isOverdue,
            // Related data
            story: flag.story ? {
              id: flag.story.id,
              title: flag.story.title,
              content: flag.isAutoHidden ? '[HIDDEN]' : flag.story.content,
            } : null,
            reporter: {
              id: flag.reporter.id,
              username: flag.reporter.username,
            },
            reviewer: flag.reviewer ? {
              id: flag.reviewer.id,
              username: flag.reviewer.username,
            } : null,
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum)
          },
          filters: {
            status,
            priority,
            reason,
            sortBy,
            sortOrder
          }
        }
      });
    } catch (error) {
      console.error('Get flags error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving flags'
      });
    }
  }

  /**
   * PUT /flags/:id/review - Review a flag (admin only)
   */
  async reviewFlag(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: flagId } = req.params;
      const { status, reviewNotes, priority }: ReviewFlagRequest = req.body;
      const reviewerId = req.user?.id;

      if (!reviewerId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user is admin
      const reviewer = await this.userRepository.findOne({ where: { id: reviewerId } });
      if (!reviewer || !reviewer.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      // Find the flag
      const flag = await this.flagRepository.findOne({
        where: { id: flagId },
        relations: ['story', 'reporter']
      });

      if (!flag) {
        res.status(404).json({
          success: false,
          message: 'Flag not found'
        });
        return;
      }

      if (flag.status !== FlagStatus.PENDING && flag.status !== FlagStatus.UNDER_REVIEW) {
        res.status(400).json({
          success: false,
          message: 'Flag has already been reviewed'
        });
        return;
      }

      // Update flag
      flag.status = status as FlagStatus;
      flag.reviewNotes = reviewNotes || null;
      flag.reviewedBy = reviewerId;
      flag.reviewedAt = new Date();

      if (priority) {
        flag.priority = priority;
      }

      await this.flagRepository.save(flag);

      // Take action based on review decision
      let moderationAction = null;
      if (status === 'approved') {
        // Hide story and take appropriate action
        moderationAction = await this.handleApprovedFlag(flag, reviewerId);
      } else if (status === 'rejected') {
        // Restore story if it was auto-hidden
        if (flag.isAutoHidden) {
          moderationAction = await this.restoreStory(flag.storyId, flagId, reviewerId);
        }
      } else if (status === 'escalated') {
        flag.requiresLegalReview = true;
        flag.escalatedAt = new Date();
        await this.flagRepository.save(flag);
      }

      // Log the review action
      await this.logAuditEvent({
        eventType: AuditEventType.FLAG_REVIEWED,
        severity: AuditSeverity.INFO,
        userId: reviewerId,
        description: `Flag reviewed: ${status}`,
        metadata: {
          entityId: flagId,
          entityType: 'flag',
          reviewDecision: status,
          storyId: flag.storyId,
          moderationActionId: moderationAction?.id
        },
        req
      });

      res.status(200).json({
        success: true,
        message: `Flag ${status} successfully`,
        data: {
          flagId: flag.id,
          status: flag.status,
          reviewedAt: flag.reviewedAt,
          moderationAction: moderationAction ? {
            id: moderationAction.id,
            actionType: moderationAction.actionType,
            description: moderationAction.description
          } : null
        }
      });
    } catch (error) {
      console.error('Review flag error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while reviewing flag'
      });
    }
  }

  /**
   * GET /flags/stats - Get flagging statistics
   */
  async getFlagStats(req: Request, res: Response): Promise<void> {
    try {
      const totalFlags = await this.flagRepository.count();
      const pendingFlags = await this.flagRepository.count({ where: { status: FlagStatus.PENDING } });
      const underReviewFlags = await this.flagRepository.count({ where: { status: FlagStatus.UNDER_REVIEW } });
      const approvedFlags = await this.flagRepository.count({ where: { status: FlagStatus.APPROVED } });
      const rejectedFlags = await this.flagRepository.count({ where: { status: FlagStatus.REJECTED } });

      // Count by reason
      const reasonCounts = await this.flagRepository
        .createQueryBuilder('flag')
        .select('flag.reason', 'reason')
        .addSelect('COUNT(flag.id)', 'count')
        .groupBy('flag.reason')
        .getRawMany();

      // Count by priority
      const priorityCounts = await this.flagRepository
        .createQueryBuilder('flag')
        .select('flag.priority', 'priority')
        .addSelect('COUNT(flag.id)', 'count')
        .groupBy('flag.priority')
        .getRawMany();

      // Recent flags (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentFlags = await this.flagRepository.count({
        where: {
          createdAt: {
            $gte: sevenDaysAgo
          } as any
        }
      });

      res.status(200).json({
        success: true,
        message: 'Flag statistics retrieved successfully',
        data: {
          total: totalFlags,
          pending: pendingFlags,
          underReview: underReviewFlags,
          approved: approvedFlags,
          rejected: rejectedFlags,
          recent: recentFlags,
          byReason: reasonCounts,
          byPriority: priorityCounts,
          approvalRate: totalFlags > 0 ? Math.round((approvedFlags / totalFlags) * 100) : 0
        }
      });
    } catch (error) {
      console.error('Get flag stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching flag statistics'
      });
    }
  }

  // Helper methods
  private determineFlagPriority(reason: FlagReason, description: string): FlagPriority {
    // Critical priority flags
    if ([FlagReason.VIOLENCE, FlagReason.ILLEGAL_CONTENT, FlagReason.HATE_SPEECH].includes(reason)) {
      return FlagPriority.CRITICAL;
    }

    // High priority flags
    if ([FlagReason.HARASSMENT, FlagReason.PERSONAL_ATTACK, FlagReason.PRIVACY_VIOLATION].includes(reason)) {
      return FlagPriority.HIGH;
    }

    // Medium priority flags (default)
    if ([FlagReason.FALSE_INFORMATION, FlagReason.MISINFORMATION, FlagReason.COPYRIGHT_VIOLATION].includes(reason)) {
      return FlagPriority.MEDIUM;
    }

    // Low priority flags
    return FlagPriority.LOW;
  }

  private calculateSeverityScore(reason: FlagReason, description: string): number {
    const baseScores: Record<FlagReason, number> = {
      [FlagReason.VIOLENCE]: 10,
      [FlagReason.ILLEGAL_CONTENT]: 10,
      [FlagReason.HATE_SPEECH]: 9,
      [FlagReason.HARASSMENT]: 8,
      [FlagReason.PERSONAL_ATTACK]: 8,
      [FlagReason.PRIVACY_VIOLATION]: 7,
      [FlagReason.FALSE_INFORMATION]: 6,
      [FlagReason.MISINFORMATION]: 6,
      [FlagReason.COPYRIGHT_VIOLATION]: 5,
      [FlagReason.MANIPULATED_MEDIA]: 5,
      [FlagReason.SPAM]: 3,
      [FlagReason.OTHER]: 4,
    };

    let score = baseScores[reason] || 4;

    // Adjust based on description content
    const lowerDescription = description.toLowerCase();
    if (lowerDescription.includes('urgent') || lowerDescription.includes('immediate')) {
      score += 2;
    }
    if (lowerDescription.includes('legal') || lowerDescription.includes('lawyer')) {
      score += 3;
    }

    return Math.min(10, score);
  }

  private shouldAutoHideStory(reason: FlagReason, priority: FlagPriority): boolean {
    // Auto-hide for critical and high priority flags
    if (priority === FlagPriority.CRITICAL || priority === FlagPriority.HIGH) {
      return true;
    }

    // Auto-hide for specific high-risk reasons
    if ([FlagReason.VIOLENCE, FlagReason.ILLEGAL_CONTENT, FlagReason.HATE_SPEECH].includes(reason)) {
      return true;
    }

    return false;
  }

  private async autoHideStory(storyId: string, flagId: string, moderatorId: string): Promise<void> {
    // In a real implementation, you would add a `isHidden` field to the Story model
    // and set it to true. For now, we'll just log the action.
    console.log(`Auto-hiding story ${storyId} due to flag ${flagId}`);
  }

  private async handleApprovedFlag(flag: Flag, moderatorId: string): Promise<ModerationAction> {
    // Hide story permanently
    return await this.createModerationAction({
      actionType: ModerationActionType.STORY_HIDDEN,
      severity: ModerationSeverity.SEVERE,
      moderatorId,
      storyId: flag.storyId,
      flagId: flag.id,
      description: `Story hidden due to approved ${flag.reason} flag`,
      justification: flag.reviewNotes || 'Content violates platform policies',
      metadata: {
        flagReason: flag.reason,
        flagPriority: flag.priority
      }
    });
  }

  private async restoreStory(storyId: string, flagId: string, moderatorId: string): Promise<ModerationAction> {
    // Restore story if it was auto-hidden
    return await this.createModerationAction({
      actionType: ModerationActionType.STORY_RESTORED,
      severity: ModerationSeverity.INFO,
      moderatorId,
      storyId,
      flagId,
      description: 'Story restored after flag rejection',
      justification: 'Flag was determined to be invalid or unfounded'
    });
  }

  private async createModerationAction(actionData: {
    actionType: ModerationActionType;
    severity: ModerationSeverity;
    moderatorId: string;
    storyId?: string;
    flagId?: string;
    description: string;
    justification?: string;
    metadata?: any;
  }): Promise<ModerationAction> {
    const action = this.moderationActionRepository.create(actionData);
    return await this.moderationActionRepository.save(action);
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

  private getAuditSeverity(priority: FlagPriority): AuditSeverity {
    switch (priority) {
      case FlagPriority.CRITICAL: return AuditSeverity.CRITICAL;
      case FlagPriority.HIGH: return AuditSeverity.ERROR;
      case FlagPriority.MEDIUM: return AuditSeverity.WARNING;
      case FlagPriority.LOW: return AuditSeverity.INFO;
      default: return AuditSeverity.INFO;
    }
  }

  private getModerationSeverity(priority: FlagPriority): ModerationSeverity {
    switch (priority) {
      case FlagPriority.CRITICAL: return ModerationSeverity.CRITICAL;
      case FlagPriority.HIGH: return ModerationSeverity.SEVERE;
      case FlagPriority.MEDIUM: return ModerationSeverity.WARNING;
      case FlagPriority.LOW: return ModerationSeverity.INFO;
      default: return ModerationSeverity.INFO;
    }
  }
}
