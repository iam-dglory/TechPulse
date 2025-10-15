import { Request, Response } from 'express';
import { AppDataSource } from '../../ormconfig';
import { CompanyClaim } from '../models/companyClaim';
import { Company } from '../models/company';
import { User } from '../models/user';
import { AuthenticatedRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

export class AdminController {
  private companyClaimRepository = AppDataSource.getRepository(CompanyClaim);
  private companyRepository = AppDataSource.getRepository(Company);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * GET /admin/claims - Get all company claims (admin only)
   */
  async getClaims(req: Request, res: Response): Promise<void> {
    try {
      const { status, page = '1', limit = '20' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const queryBuilder = this.companyClaimRepository.createQueryBuilder('claim')
        .leftJoinAndSelect('claim.company', 'company')
        .leftJoinAndSelect('claim.user', 'user')
        .leftJoinAndSelect('claim.reviewer', 'reviewer')
        .orderBy('claim.createdAt', 'DESC');

      // Add status filter
      if (status && status !== 'all') {
        queryBuilder.andWhere('claim.status = :status', { status });
      }

      // Add pagination
      queryBuilder.skip(skip).take(limitNum);

      // Get total count
      const totalCount = await queryBuilder.getCount();
      const claims = await queryBuilder.getMany();

      res.status(200).json({
        success: true,
        message: 'Claims retrieved successfully',
        data: {
          claims: claims.map(claim => ({
            id: claim.id,
            companyId: claim.companyId,
            companyName: claim.companyName,
            officialEmail: claim.officialEmail,
            websiteUrl: claim.websiteUrl,
            contactPerson: claim.contactPerson,
            phoneNumber: claim.phoneNumber,
            proofDocuments: claim.proofDocuments,
            verificationMethod: claim.verificationMethod,
            additionalInfo: claim.additionalInfo,
            status: claim.status,
            reviewNotes: claim.reviewNotes,
            reviewedBy: claim.reviewedBy,
            reviewedAt: claim.reviewedAt,
            createdAt: claim.createdAt,
            updatedAt: claim.updatedAt,
            // Related data
            company: claim.company ? {
              id: claim.company.id,
              name: claim.company.name,
              slug: claim.company.slug,
              claimStatus: claim.company.claimStatus,
              verified: claim.company.verified,
            } : null,
            user: {
              id: claim.user.id,
              username: claim.user.username,
              email: claim.user.email,
            },
            reviewer: claim.reviewer ? {
              id: claim.reviewer.id,
              username: claim.reviewer.username,
            } : null,
          })),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum)
          },
          filters: {
            status: status || 'all'
          }
        }
      });
    } catch (error) {
      console.error('Get claims error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching claims'
      });
    }
  }

  /**
   * POST /admin/claims/:id/approve - Approve a company claim (admin only)
   */
  async approveClaim(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const adminUserId = req.user?.id;

      if (!adminUserId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if admin user exists
      const adminUser = await this.userRepository.findOne({ where: { id: adminUserId } });
      if (!adminUser || !adminUser.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      // Find the claim
      const claim = await this.companyClaimRepository.findOne({
        where: { id },
        relations: ['company', 'user']
      });

      if (!claim) {
        res.status(404).json({
          success: false,
          message: 'Claim not found'
        });
        return;
      }

      if (claim.status !== 'pending') {
        res.status(400).json({
          success: false,
          message: 'Claim has already been processed'
        });
        return;
      }

      // Update claim status
      claim.status = 'approved';
      claim.reviewNotes = reviewNotes || 'Claim approved';
      claim.reviewedBy = adminUserId;
      claim.reviewedAt = new Date();

      await this.companyClaimRepository.save(claim);

      // Update company status if company exists
      if (claim.companyId && claim.company) {
        claim.company.claimStatus = 'approved';
        claim.company.verified = true;
        claim.company.verifiedAt = new Date();
        await this.companyRepository.save(claim.company);
      }

      // Send email notification to user about approval
      await emailService.sendClaimApprovalEmail({
        companyName: claim.companyName,
        contactPerson: claim.officialEmail, // Using official email as contact
        claimDate: claim.createdAt.toLocaleDateString(),
        adminNotes: reviewNotes,
      });

      console.log(`Company claim approved: ${claim.id} for company: ${claim.companyName}`);

      res.status(200).json({
        success: true,
        message: 'Claim approved successfully',
        data: {
          claimId: claim.id,
          status: claim.status,
          reviewedAt: claim.reviewedAt,
          companyVerified: claim.companyId ? true : false
        }
      });
    } catch (error) {
      console.error('Approve claim error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while approving claim'
      });
    }
  }

  /**
   * POST /admin/claims/:id/reject - Reject a company claim (admin only)
   */
  async rejectClaim(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const adminUserId = req.user?.id;

      if (!adminUserId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if admin user exists
      const adminUser = await this.userRepository.findOne({ where: { id: adminUserId } });
      if (!adminUser || !adminUser.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      // Find the claim
      const claim = await this.companyClaimRepository.findOne({
        where: { id },
        relations: ['company', 'user']
      });

      if (!claim) {
        res.status(404).json({
          success: false,
          message: 'Claim not found'
        });
        return;
      }

      if (claim.status !== 'pending') {
        res.status(400).json({
          success: false,
          message: 'Claim has already been processed'
        });
        return;
      }

      // Update claim status
      claim.status = 'rejected';
      claim.reviewNotes = reviewNotes || 'Claim rejected';
      claim.reviewedBy = adminUserId;
      claim.reviewedAt = new Date();

      await this.companyClaimRepository.save(claim);

      // Update company status if company exists
      if (claim.companyId && claim.company) {
        claim.company.claimStatus = 'rejected';
        await this.companyRepository.save(claim.company);
      }

      // Send email notification to user about rejection
      await emailService.sendClaimRejectionEmail({
        companyName: claim.companyName,
        contactPerson: claim.officialEmail, // Using official email as contact
        claimDate: claim.createdAt.toLocaleDateString(),
        rejectionReason: reviewNotes || 'Insufficient documentation or information provided.',
      });

      console.log(`Company claim rejected: ${claim.id} for company: ${claim.companyName}`);

      res.status(200).json({
        success: true,
        message: 'Claim rejected successfully',
        data: {
          claimId: claim.id,
          status: claim.status,
          reviewedAt: claim.reviewedAt
        }
      });
    } catch (error) {
      console.error('Reject claim error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while rejecting claim'
      });
    }
  }

  /**
   * GET /admin/claims/stats - Get claims statistics (admin only)
   */
  async getClaimsStats(req: Request, res: Response): Promise<void> {
    try {
      const totalClaims = await this.companyClaimRepository.count();
      const pendingClaims = await this.companyClaimRepository.count({ where: { status: 'pending' } });
      const approvedClaims = await this.companyClaimRepository.count({ where: { status: 'approved' } });
      const rejectedClaims = await this.companyClaimRepository.count({ where: { status: 'rejected' } });

      // Recent claims (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentClaims = await this.companyClaimRepository.count({
        where: {
          createdAt: {
            $gte: sevenDaysAgo
          } as any
        }
      });

      res.status(200).json({
        success: true,
        message: 'Claims statistics retrieved successfully',
        data: {
          total: totalClaims,
          pending: pendingClaims,
          approved: approvedClaims,
          rejected: rejectedClaims,
          recent: recentClaims,
          approvalRate: totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0
        }
      });
    } catch (error) {
      console.error('Get claims stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching claims statistics'
      });
    }
  }
}
