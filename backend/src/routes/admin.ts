import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

/**
 * @route GET /admin/claims
 * @desc Get all company claims
 * @access Private (admin only)
 */
router.get(
  '/claims',
  isAuthenticated,
  adminController.getClaims.bind(adminController)
);

/**
 * @route GET /admin/claims/stats
 * @desc Get claims statistics
 * @access Private (admin only)
 */
router.get(
  '/claims/stats',
  isAuthenticated,
  adminController.getClaimsStats.bind(adminController)
);

/**
 * @route POST /admin/claims/:id/approve
 * @desc Approve a company claim
 * @access Private (admin only)
 */
router.post(
  '/claims/:id/approve',
  isAuthenticated,
  adminController.approveClaim.bind(adminController)
);

/**
 * @route POST /admin/claims/:id/reject
 * @desc Reject a company claim
 * @access Private (admin only)
 */
router.post(
  '/claims/:id/reject',
  isAuthenticated,
  adminController.rejectClaim.bind(adminController)
);

export default router;
