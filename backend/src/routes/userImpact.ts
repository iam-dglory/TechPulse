import { Router } from 'express';
import { UserImpactController } from '../controllers/userImpactController';
import { isAuthenticated } from '../middleware/auth';
import { validateUserImpact } from '../middleware/validation';

const router = Router();
const userImpactController = new UserImpactController();

/**
 * @route GET /users/:id/impact
 * @desc Get user impact profile
 * @access Private (user must be authenticated and can only access their own profile)
 */
router.get(
  '/:id/impact',
  isAuthenticated,
  userImpactController.getUserImpact.bind(userImpactController)
);

/**
 * @route POST /users/:id/impact
 * @desc Create or update user impact profile
 * @access Private (user must be authenticated and can only update their own profile)
 */
router.post(
  '/:id/impact',
  isAuthenticated,
  validateUserImpact,
  userImpactController.saveUserImpact.bind(userImpactController)
);

export default router;

