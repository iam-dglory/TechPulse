import { Router } from 'express';
import { GraveyardController } from '../controllers/graveyardController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const graveyardController = new GraveyardController();

/**
 * @route GET /graveyard
 * @desc Get all graveyard entries with filtering and search
 * @access Public
 */
router.get(
  '/',
  graveyardController.getGraveyardEntries.bind(graveyardController)
);

/**
 * @route GET /graveyard/stats
 * @desc Get graveyard statistics
 * @access Public
 */
router.get(
  '/stats',
  graveyardController.getGraveyardStats.bind(graveyardController)
);

/**
 * @route GET /graveyard/:id
 * @desc Get single graveyard entry
 * @access Public
 */
router.get(
  '/:id',
  graveyardController.getGraveyardEntry.bind(graveyardController)
);

/**
 * @route POST /admin/graveyard
 * @desc Create new graveyard entry
 * @access Private (admin only)
 */
router.post(
  '/',
  isAuthenticated,
  graveyardController.createGraveyardEntry.bind(graveyardController)
);

/**
 * @route PUT /admin/graveyard/:id
 * @desc Update graveyard entry
 * @access Private (admin only)
 */
router.put(
  '/:id',
  isAuthenticated,
  graveyardController.updateGraveyardEntry.bind(graveyardController)
);

/**
 * @route DELETE /admin/graveyard/:id
 * @desc Delete graveyard entry
 * @access Private (admin only)
 */
router.delete(
  '/:id',
  isAuthenticated,
  graveyardController.deleteGraveyardEntry.bind(graveyardController)
);

export default router;
