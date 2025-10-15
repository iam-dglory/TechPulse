import { Router } from 'express';
import { CompanyController } from '../controllers/companyController';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { isAdmin, isCompanyOwnerOrAdmin, canClaimCompany } from '../middleware/permissions';
import {
  validateCompanyClaim,
  validateCompanyUpdate,
  validateCompanyId,
  validateCompanyQuery
} from '../middleware/validation';

const router = Router();
const companyController = new CompanyController();

/**
 * @route GET /companies
 * @desc Get all companies with filtering and pagination
 * @access Public
 */
router.get('/', validateCompanyQuery, async (req, res) => {
  await companyController.getCompanies(req, res);
});

/**
 * @route GET /companies/:id
 * @desc Get company by ID or slug
 * @access Public
 */
router.get('/:id', validateCompanyId, async (req, res) => {
  await companyController.getCompanyById(req, res);
});

/**
 * @route GET /companies/:id/products
 * @desc Get company products
 * @access Public
 */
router.get('/:id/products', validateCompanyId, async (req, res) => {
  await companyController.getCompanyProducts(req, res);
});

/**
 * @route GET /companies/:id/stories
 * @desc Get company stories
 * @access Public
 */
router.get('/:id/stories', validateCompanyId, async (req, res) => {
  await companyController.getCompanyStories(req, res);
});

/**
 * @route POST /companies/claim
 * @desc Claim a company profile
 * @access Private (authenticated users only)
 */
router.post('/claim', 
  authenticateToken,
  canClaimCompany,
  validateCompanyClaim,
  async (req: AuthenticatedRequest, res) => {
    await companyController.claimCompany(req, res);
  }
);

/**
 * @route POST /companies/:id/verify
 * @desc Verify a company (admin only)
 * @access Private (admin only)
 */
router.post('/:id/verify',
  authenticateToken,
  isAdmin,
  validateCompanyId,
  async (req: AuthenticatedRequest, res) => {
    await companyController.verifyCompany(req, res);
  }
);

/**
 * @route PATCH /companies/:id
 * @desc Update company profile
 * @access Private (company owner or admin)
 */
router.patch('/:id',
  authenticateToken,
  isCompanyOwnerOrAdmin,
  validateCompanyId,
  validateCompanyUpdate,
  async (req: AuthenticatedRequest, res) => {
    await companyController.updateCompany(req, res);
  }
);

/**
 * @route DELETE /companies/:id
 * @desc Delete company
 * @access Private (admin only)
 */
router.delete('/:id',
  authenticateToken,
  isAdmin,
  validateCompanyId,
  async (req: AuthenticatedRequest, res) => {
    await companyController.deleteCompany(req, res);
  }
);

/**
 * @route GET /companies/search/suggestions
 * @desc Get company search suggestions
 * @access Public
 */
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
      return;
    }

    // This would typically use a search service like Elasticsearch
    // For now, we'll do a simple database query
    const companyController = new CompanyController();
    const mockReq = {
      query: { search: q, limit: '10' }
    } as any;
    
    await companyController.getCompanies(mockReq, res);
  } catch (error) {
    console.error('Company search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching suggestions'
    });
  }
});

/**
 * @route GET /companies/stats/overview
 * @desc Get company statistics overview
 * @access Public
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const companyController = new CompanyController();
    
    // Get basic statistics
    const { companyRepository } = companyController as any;
    if (!companyRepository) {
      res.status(500).json({
        success: false,
        message: 'Company repository not available'
      });
      return;
    }

    const [
      totalCompanies,
      verifiedCompanies,
      unverifiedCompanies,
      avgEthicsScore,
      avgCredibilityScore
    ] = await Promise.all([
      companyRepository.count(),
      companyRepository.count({ where: { verified: true } }),
      companyRepository.count({ where: { verified: false } }),
      companyRepository
        .createQueryBuilder('company')
        .select('AVG(company.ethicsScore)', 'avg')
        .getRawOne(),
      companyRepository
        .createQueryBuilder('company')
        .select('AVG(company.credibilityScore)', 'avg')
        .getRawOne()
    ]);

    res.status(200).json({
      success: true,
      message: 'Company statistics retrieved successfully',
      data: {
        totalCompanies,
        verifiedCompanies,
        unverifiedCompanies,
        avgEthicsScore: parseFloat(avgEthicsScore?.avg || '0'),
        avgCredibilityScore: parseFloat(avgCredibilityScore?.avg || '0'),
        verificationRate: totalCompanies > 0 ? (verifiedCompanies / totalCompanies) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Company stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching statistics'
    });
  }
});

export default router;
