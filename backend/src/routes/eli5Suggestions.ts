import { Router } from 'express';
import { Eli5SuggestionController } from '../controllers/eli5SuggestionController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const eli5SuggestionController = new Eli5SuggestionController();

/**
 * @route GET /eli5-suggestions
 * @desc Get all ELI5 suggestions with filtering
 * @access Public
 */
router.get(
  '/',
  eli5SuggestionController.getSuggestions.bind(eli5SuggestionController)
);

/**
 * @route GET /eli5-suggestions/stats
 * @desc Get ELI5 suggestions statistics
 * @access Public
 */
router.get(
  '/stats',
  eli5SuggestionController.getSuggestionStats.bind(eli5SuggestionController)
);

/**
 * @route POST /eli5-suggestions
 * @desc Create new ELI5 suggestion
 * @access Private
 */
router.post(
  '/',
  isAuthenticated,
  eli5SuggestionController.createSuggestion.bind(eli5SuggestionController)
);

/**
 * @route PUT /eli5-suggestions/:id
 * @desc Update ELI5 suggestion (approve/reject)
 * @access Private (admin only)
 */
router.put(
  '/:id',
  isAuthenticated,
  eli5SuggestionController.updateSuggestion.bind(eli5SuggestionController)
);

/**
 * @route POST /eli5-suggestions/:id/vote
 * @desc Vote on ELI5 suggestion
 * @access Private
 */
router.post(
  '/:id/vote',
  isAuthenticated,
  eli5SuggestionController.voteOnSuggestion.bind(eli5SuggestionController)
);

export default router;

