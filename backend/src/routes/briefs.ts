import { Router } from 'express';
import { BriefController } from '../controllers/briefController';

const router = Router();
const briefController = new BriefController();

/**
 * @route GET /briefs/daily
 * @desc Get personalized daily tech brief
 * @access Public
 * @query {string} userId - User ID for personalization
 * @query {string} duration - Brief duration in minutes (5, 10, or 15)
 * @query {string} mode - Brief mode (trending, personalized, balanced)
 * @query {string} limit - Maximum number of stories
 */
router.get(
  '/daily',
  briefController.getDailyBrief.bind(briefController)
);

/**
 * @route GET /briefs/stats
 * @desc Get brief generation statistics
 * @access Public
 */
router.get(
  '/stats',
  briefController.getBriefStats.bind(briefController)
);

export default router;
