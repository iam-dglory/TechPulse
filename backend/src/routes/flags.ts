import { Router } from 'express';
import { FlagController } from '../controllers/flagController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const flagController = new FlagController();

/**
 * @route POST /stories/:id/flag
 * @desc Flag a story for moderation
 * @access Private
 */
router.post(
  '/stories/:id/flag',
  isAuthenticated,
  flagController.flagStory.bind(flagController)
);

/**
 * @route GET /flags
 * @desc Get flags for moderation (admin only)
 * @access Private (admin only)
 */
router.get(
  '/',
  isAuthenticated,
  flagController.getFlags.bind(flagController)
);

/**
 * @route PUT /flags/:id/review
 * @desc Review a flag (admin only)
 * @access Private (admin only)
 */
router.put(
  '/:id/review',
  isAuthenticated,
  flagController.reviewFlag.bind(flagController)
);

/**
 * @route GET /flags/stats
 * @desc Get flagging statistics
 * @access Public
 */
router.get(
  '/stats',
  flagController.getFlagStats.bind(flagController)
);

export default router;
