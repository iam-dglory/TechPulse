import { Router } from 'express';
import { body } from 'express-validator';
import { NewsletterController } from '../controllers/newsletterController';

const router = Router();

/**
 * Newsletter subscription validation
 */
const subscribeValidation = [
  body('email').isEmail().normalizeEmail(),
  body('interests').optional().isArray(),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly'])
];

/**
 * Newsletter routes
 */
router.post('/subscribe', subscribeValidation, NewsletterController.subscribe);
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail()
], NewsletterController.unsubscribe);
router.get('/content', NewsletterController.getNewsletterContent);
router.post('/send', NewsletterController.sendNewsletter);
router.get('/analytics', NewsletterController.getNewsletterAnalytics);

export default router;
