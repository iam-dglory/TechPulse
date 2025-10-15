import { Router } from 'express';
import { LegalController } from '../controllers/legalController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const legalController = new LegalController();

/**
 * @route GET /policy
 * @desc Get privacy policy and terms of service
 * @access Public
 */
router.get(
  '/policy',
  legalController.getPrivacyPolicy.bind(legalController)
);

/**
 * @route POST /legal/data-export
 * @desc Request data export (GDPR compliance)
 * @access Private
 */
router.post(
  '/data-export',
  isAuthenticated,
  legalController.requestDataExport.bind(legalController)
);

/**
 * @route POST /legal/data-deletion
 * @desc Request data deletion (GDPR compliance)
 * @access Private
 */
router.post(
  '/data-deletion',
  isAuthenticated,
  legalController.requestDataDeletion.bind(legalController)
);

/**
 * @route GET /legal/audit-logs
 * @desc Get audit logs for legal compliance (admin only)
 * @access Private (admin only)
 */
router.get(
  '/audit-logs',
  isAuthenticated,
  legalController.getAuditLogs.bind(legalController)
);

export default router;
