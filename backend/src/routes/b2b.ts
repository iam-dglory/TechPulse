import { Router } from 'express';
import { body, query } from 'express-validator';
import { B2BController } from '../controllers/b2bController';
import { authenticateApiKey } from '../middleware/auth';

const router = Router();

// Apply API key authentication to all B2B routes
router.use(authenticateApiKey);

/**
 * Vendor Risk Assessment API
 * POST /api/b2b/vendor-risk
 * 
 * Body:
 * {
 *   "companyIds": ["uuid1", "uuid2"],
 *   "includeHistorical": true
 * }
 */
router.post('/vendor-risk', [
  body('companyIds').isArray().withMessage('Company IDs must be an array'),
  body('companyIds.*').isUUID().withMessage('Each company ID must be a valid UUID'),
  body('includeHistorical').optional().isBoolean()
], B2BController.getVendorRiskAssessment);

/**
 * Competitive Intelligence API
 * GET /api/b2b/competitive-intelligence?sector=ai&timeframe=6months
 */
router.get('/competitive-intelligence', [
  query('sector').notEmpty().withMessage('Sector parameter is required'),
  query('timeframe').optional().isIn(['1month', '3months', '6months', '1year']),
  query('includePredictions').optional().isBoolean()
], B2BController.getCompetitiveIntelligence);

/**
 * Historical Accuracy API
 * GET /api/b2b/historical-accuracy?companyId=uuid&timeframe=1year
 */
router.get('/historical-accuracy', [
  query('companyId').isUUID().withMessage('Company ID must be a valid UUID'),
  query('timeframe').optional().isIn(['1month', '3months', '6months', '1year'])
], B2BController.getHistoricalAccuracy);

export default router;
