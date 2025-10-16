import { Router } from 'express';
import { PremiumCompanyController } from '../controllers/premiumCompanyController';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

// Apply API key authentication to all premium company routes
router.use(authenticateApiKey);

/**
 * Premium Company Profile Routes
 * These routes provide enhanced company data for B2B customers
 */

/**
 * GET /api/companies/:companyId/premium
 * Get enhanced company profile with premium features
 * Query params: includeAnalytics, includeCompetitors
 */
router.get('/:companyId/premium', PremiumCompanyController.getPremiumProfile);

/**
 * POST /api/companies/:companyId/insights-report
 * Generate comprehensive insights report
 * Query params: timeframe (7days, 30days, 6months, 1year)
 */
router.post('/:companyId/insights-report', PremiumCompanyController.generateInsightsReport);

/**
 * GET /api/companies/:companyId/dashboard
 * Get company dashboard data with analytics
 * Query params: period (7days, 30days, 6months, 1year)
 */
router.get('/:companyId/dashboard', PremiumCompanyController.getDashboardData);

/**
 * PATCH /api/companies/:companyId/profile
 * Update company profile (premium feature)
 * Body: name, website, sectorTags, hqLocation, ethicsStatementUrl, privacyPolicyUrl, products
 */
router.patch('/:companyId/profile', PremiumCompanyController.updateProfile);

export default router;


