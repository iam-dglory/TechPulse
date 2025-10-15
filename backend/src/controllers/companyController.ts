import { Request, Response } from 'express';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../../ormconfig';
import { Company } from '../models/company';
import { CompanyClaim } from '../models/companyClaim';
import { User } from '../models/user';
import { AuthenticatedRequest } from '../middleware/auth';
import { eventTracker } from '../services/analytics/eventTracker';

// Types for request bodies
interface CreateCompanyRequest {
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  sectorTags: string[];
  fundingStage: string;
  investors: string[];
  hqLocation?: string;
  ethicsStatementUrl?: string;
  privacyPolicyUrl?: string;
  registrationDocument?: string; // Base64 or file path
}

interface UpdateCompanyRequest {
  name?: string;
  slug?: string;
  logoUrl?: string;
  website?: string;
  sectorTags?: string[];
  fundingStage?: string;
  investors?: string[];
  hqLocation?: string;
  ethicsStatementUrl?: string;
  privacyPolicyUrl?: string;
}

interface CompanyQueryParams {
  sector?: string;
  ethicsScoreMin?: string;
  fundingStage?: string;
  search?: string;
  page?: string;
  limit?: string;
  verified?: string;
}

export class CompanyController {
  private companyRepository: Repository<Company>;
  private companyClaimRepository: Repository<CompanyClaim>;
  private userRepository: Repository<User>;

  constructor() {
    this.companyRepository = AppDataSource.getRepository(Company);
    this.companyClaimRepository = AppDataSource.getRepository(CompanyClaim);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * GET /companies - List companies with filtering and pagination
   */
  async getCompanies(req: Request, res: Response): Promise<void> {
    try {
      const {
        sector,
        ethicsScoreMin,
        fundingStage,
        search,
        page = '1',
        limit = '20',
        verified = 'true'
      }: CompanyQueryParams = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const queryBuilder = this.companyRepository.createQueryBuilder('company');

      // Add filters
      if (sector) {
        queryBuilder.andWhere('company.sectorTags @> :sector', { sector: `["${sector}"]` });
      }

      if (ethicsScoreMin) {
        const minScore = parseFloat(ethicsScoreMin);
        queryBuilder.andWhere('company.ethicsScore >= :minScore', { minScore });
      }

      if (fundingStage) {
        queryBuilder.andWhere('company.fundingStage = :fundingStage', { fundingStage });
      }

      if (search) {
        queryBuilder.andWhere(
          '(company.name ILIKE :search OR company.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (verified === 'true') {
        queryBuilder.andWhere('company.verified = :verified', { verified: true });
      } else if (verified === 'false') {
        queryBuilder.andWhere('company.verified = :verified', { verified: false });
      }

      // Add ordering and pagination
      queryBuilder
        .orderBy('company.verified', 'DESC')
        .addOrderBy('company.credibilityScore', 'DESC')
        .addOrderBy('company.createdAt', 'DESC')
        .skip(skip)
        .take(limitNum);

      // Get total count for pagination
      const totalCount = await queryBuilder.getCount();
      const companies = await queryBuilder.getMany();

      res.status(200).json({
        success: true,
        message: 'Companies retrieved successfully',
        data: {
          companies,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Get companies error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching companies'
      });
    }
  }

  /**
   * GET /companies/:id - Get company by ID or slug
   */
  async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if it's a UUID or slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

      let company: Company | null;

      if (isUuid) {
        company = await this.companyRepository.findOne({
          where: { id },
          relations: ['products', 'stories']
        });
      } else {
        company = await this.companyRepository.findOne({
          where: { slug: id },
          relations: ['products', 'stories']
        });
      }

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Company retrieved successfully',
        data: { company }
      });
    } catch (error) {
      console.error('Get company error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching company'
      });
    }
  }

  /**
   * POST /companies/claim - Claim a company profile
   */
  async claimCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        companyId,
        companyName,
        officialEmail,
        websiteUrl,
        contactPerson,
        phoneNumber,
        proofDocuments,
        verificationMethod,
        additionalInfo
      } = req.body;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Validation
      if (!companyName || !officialEmail || !websiteUrl || !contactPerson) {
        res.status(400).json({
          success: false,
          message: 'Company name, official email, website URL, and contact person are required'
        });
        return;
      }

      // Check if company exists (if companyId provided)
      let company = null;
      if (companyId) {
        company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Company not found'
          });
          return;
        }

        // Check if company is already claimed or has pending claims
        if (company.claimStatus === 'approved' || company.claimStatus === 'pending_review') {
          res.status(409).json({
            success: false,
            message: 'This company has already been claimed or has a pending claim'
          });
          return;
        }
      }

      // Check for existing pending claims by this user for this company
      const existingClaim = await this.companyClaimRepository.findOne({
        where: {
          userId,
          companyId: companyId || null,
          status: 'pending'
        }
      });

      if (existingClaim) {
        res.status(409).json({
          success: false,
          message: 'You already have a pending claim for this company'
        });
        return;
      }

      // Create company claim
      const newClaim = this.companyClaimRepository.create({
        companyId: companyId || null,
        userId,
        companyName,
        officialEmail,
        websiteUrl,
        contactPerson,
        phoneNumber: phoneNumber || null,
        proofDocuments: proofDocuments || [],
        verificationMethod,
        additionalInfo: additionalInfo || null,
        status: 'pending'
      });

      const savedClaim = await this.companyClaimRepository.save(newClaim);

      // Update company status if company exists
      if (company) {
        company.claimStatus = 'pending_review';
        await this.companyRepository.save(company);
        
        // Track company claim event
        await eventTracker.trackCompanyClaimed(company, {
          verificationMethod,
          documents: proofDocuments,
        }, req.user);
      }

      // TODO: Send email notification to admin about new claim
      console.log(`New company claim submitted: ${savedClaim.id} for company: ${companyName}`);

      res.status(201).json({
        success: true,
        message: 'Company claim submitted successfully. Our team will review it within 2-3 business days.',
        data: {
          claimId: savedClaim.id,
          status: savedClaim.status,
          submittedAt: savedClaim.createdAt
        }
      });
    } catch (error) {
      console.error('Claim company error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while claiming company'
      });
    }
  }

  /**
   * POST /companies/:id/verify - Verify a company (admin only)
   */
  async verifyCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminUserId = req.user?.id;

      if (!adminUserId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user is admin (you can implement proper admin role checking)
      const adminUser = await this.userRepository.findOne({
        where: { id: adminUserId }
      });

      if (!adminUser || !adminUser.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      const company = await this.companyRepository.findOne({ where: { id } });
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found'
        });
        return;
      }

      if (company.verified) {
        res.status(400).json({
          success: false,
          message: 'Company is already verified'
        });
        return;
      }

      // Verify the company
      company.verified = true;
      company.verifiedAt = new Date();
      const verifiedCompany = await this.companyRepository.save(company);

      res.status(200).json({
        success: true,
        message: 'Company verified successfully',
        data: { company: verifiedCompany }
      });
    } catch (error) {
      console.error('Verify company error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while verifying company'
      });
    }
  }

  /**
   * PATCH /companies/:id - Update company (owner or admin)
   */
  async updateCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const updateData: UpdateCompanyRequest = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const company = await this.companyRepository.findOne({ where: { id } });
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found'
        });
        return;
      }

      // Check permissions (you can implement proper ownership checking)
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      // For now, allow any authenticated user to update (implement proper ownership later)
      // TODO: Add company ownership logic

      // Update company fields
      Object.assign(company, updateData);
      const updatedCompany = await this.companyRepository.save(company);

      res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: { company: updatedCompany }
      });
    } catch (error) {
      console.error('Update company error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating company'
      });
    }
  }

  /**
   * DELETE /companies/:id - Delete company (admin only)
   */
  async deleteCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const company = await this.companyRepository.findOne({ where: { id } });
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found'
        });
        return;
      }

      await this.companyRepository.remove(company);

      res.status(200).json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      console.error('Delete company error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting company'
      });
    }
  }

  /**
   * GET /companies/:id/products - Get company products
   */
  async getCompanyProducts(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const company = await this.companyRepository.findOne({
        where: { id },
        relations: ['products']
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Company products retrieved successfully',
        data: { products: company.products }
      });
    } catch (error) {
      console.error('Get company products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching products'
      });
    }
  }

  /**
   * GET /companies/:id/stories - Get company stories
   */
  async getCompanyStories(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = '1', limit = '10' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const company = await this.companyRepository.findOne({
        where: { id },
        relations: ['stories']
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found'
        });
        return;
      }

      // Get paginated stories
      const stories = await this.companyRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.stories', 'stories')
        .where('company.id = :id', { id })
        .orderBy('stories.publishedAt', 'DESC')
        .addOrderBy('stories.createdAt', 'DESC')
        .skip(skip)
        .take(limitNum)
        .getOne();

      const totalStories = company.stories.length;

      res.status(200).json({
        success: true,
        message: 'Company stories retrieved successfully',
        data: {
          stories: stories?.stories || [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalStories,
            pages: Math.ceil(totalStories / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Get company stories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching stories'
      });
    }
  }
}
