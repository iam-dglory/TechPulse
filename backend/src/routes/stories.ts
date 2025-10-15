import { Router } from 'express';
import { Not, MoreThan } from 'typeorm';
import { StoryController } from '../controllers/storyController';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { isAdmin } from '../middleware/permissions';
import {
  validateStoryCreation,
  validateStoryUpdate,
  validateStoryId,
  validateStoryQuery,
  validateDiscussion
} from '../middleware/validation';

const router = Router();
const storyController = new StoryController();

/**
 * @route GET /stories
 * @desc Get all stories with filtering and sorting
 * @access Public
 */
router.get('/', validateStoryQuery, async (req, res) => {
  await storyController.getStories(req, res);
});

/**
 * @route GET /stories/:id
 * @desc Get story by ID
 * @access Public
 */
router.get('/:id', validateStoryId, async (req, res) => {
  await storyController.getStoryById(req, res);
});

/**
 * @route POST /stories
 * @desc Create new story
 * @access Private (authenticated users only)
 */
router.post('/', 
  authenticateToken,
  validateStoryCreation,
  async (req: AuthenticatedRequest, res) => {
    await storyController.createStory(req, res);
  }
);

/**
 * @route PATCH /stories/:id
 * @desc Update story
 * @access Private (creator or admin only)
 */
router.patch('/:id',
  authenticateToken,
  validateStoryId,
  validateStoryUpdate,
  async (req: AuthenticatedRequest, res) => {
    await storyController.updateStory(req, res);
  }
);

/**
 * @route DELETE /stories/:id
 * @desc Delete story
 * @access Private (creator or admin only)
 */
router.delete('/:id',
  authenticateToken,
  validateStoryId,
  async (req: AuthenticatedRequest, res) => {
    await storyController.deleteStory(req, res);
  }
);

/**
 * @route GET /stories/:id/discussions
 * @desc Get story discussions/votes
 * @access Public
 */
router.get('/:id/discussions', 
  validateStoryId,
  async (req, res) => {
    await storyController.getStoryDiscussions(req, res);
  }
);

/**
 * @route POST /stories/:id/discussions
 * @desc Add discussion/vote to story
 * @access Private (authenticated users only)
 */
router.post('/:id/discussions',
  authenticateToken,
  validateStoryId,
  validateDiscussion,
  async (req: AuthenticatedRequest, res) => {
    await storyController.addStoryDiscussion(req, res);
  }
);

/**
 * @route GET /stories/trending/now
 * @desc Get trending stories (last 24 hours)
 * @access Public
 */
router.get('/trending/now', async (req, res) => {
  try {
    // Override query to get trending stories
    const trendingReq = {
      ...req,
      query: { ...req.query, sort: 'trending', limit: '10' }
    };
    await storyController.getStories(trendingReq, res);
  } catch (error) {
    console.error('Get trending stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching trending stories'
    });
  }
});

/**
 * @route GET /stories/search/suggestions
 * @desc Get story search suggestions
 * @access Public
 */
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
      return;
    }

    // Get stories matching search query
    const searchReq = {
      query: { search: q, limit: '10' }
    } as any;
    
    await storyController.getStories(searchReq, res);
  } catch (error) {
    console.error('Story search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching suggestions'
    });
  }
});

/**
 * @route GET /stories/stats/overview
 * @desc Get story statistics overview
 * @access Public
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const storyController = new StoryController();
    
    // Get basic statistics using repository
    const { storyRepository } = storyController as any;
    if (!storyRepository) {
      res.status(500).json({
        success: false,
        message: 'Story repository not available'
      });
      return;
    }

    const [
      totalStories,
      publishedStories,
      avgHypeScore,
      avgEthicsScore,
      storiesLast24h
    ] = await Promise.all([
      storyRepository.count(),
      storyRepository.count({ where: { publishedAt: Not(null) } }),
      storyRepository
        .createQueryBuilder('story')
        .select('AVG(story.hypeScore)', 'avg')
        .where('story.publishedAt IS NOT NULL')
        .getRawOne(),
      storyRepository
        .createQueryBuilder('story')
        .select('AVG(story.ethicsScore)', 'avg')
        .where('story.publishedAt IS NOT NULL')
        .getRawOne(),
      storyRepository.count({
        where: {
          createdAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000))
        }
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Story statistics retrieved successfully',
      data: {
        totalStories,
        publishedStories,
        avgHypeScore: parseFloat(avgHypeScore?.avg || '0'),
        avgEthicsScore: parseFloat(avgEthicsScore?.avg || '0'),
        storiesLast24h,
        publicationRate: totalStories > 0 ? (publishedStories / totalStories) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Story stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching statistics'
    });
  }
});

/**
 * @route GET /stories/sectors/list
 * @desc Get list of all sector tags
 * @access Public
 */
router.get('/sectors/list', async (req, res) => {
  try {
    const storyController = new StoryController();
    const { storyRepository } = storyController as any;

    // Get unique sector tags
    const sectors = await storyRepository
      .createQueryBuilder('story')
      .select('DISTINCT story.sectorTag', 'sectorTag')
      .where('story.sectorTag IS NOT NULL')
      .orderBy('story.sectorTag', 'ASC')
      .getRawMany();

    const sectorList = sectors.map(s => s.sectorTag);

    res.status(200).json({
      success: true,
      message: 'Sector tags retrieved successfully',
      data: {
        sectors: sectorList,
        count: sectorList.length
      }
    });
  } catch (error) {
    console.error('Get sectors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching sectors'
    });
  }
});

/**
 * @route GET /stories/impact-tags/list
 * @desc Get list of all impact tags
 * @access Public
 */
router.get('/impact-tags/list', async (req, res) => {
  try {
    const storyController = new StoryController();
    const { storyRepository } = storyController as any;

    // Get all impact tags from all stories
    const stories = await storyRepository.find({
      select: ['impactTags'],
      where: { impactTags: Not([]) }
    });

    // Flatten and get unique impact tags
    const allImpactTags = stories.flatMap(story => story.impactTags || []);
    const uniqueImpactTags = [...new Set(allImpactTags)].sort();

    res.status(200).json({
      success: true,
      message: 'Impact tags retrieved successfully',
      data: {
        impactTags: uniqueImpactTags,
        count: uniqueImpactTags.length
      }
    });
  } catch (error) {
    console.error('Get impact tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching impact tags'
    });
  }
});

/**
 * @route GET /stories/feed/personalized
 * @desc Get personalized story feed for user
 * @access Private (authenticated users only)
 */
router.get('/feed/personalized',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Get user's industry preferences and voting history
      // For now, return hot stories with some personalization
      const personalizedReq = {
        query: { 
          sort: 'hot', 
          limit: '20',
          // Add user preferences here in the future
        }
      } as any;

      await storyController.getStories(personalizedReq, res);
    } catch (error) {
      console.error('Personalized feed error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching personalized feed'
      });
    }
  }
);

/**
 * @route GET /stories/scoring/job/:jobId
 * @desc Get scoring job status
 * @access Public
 */
router.get('/scoring/job/:jobId', async (req, res) => {
  await storyController.getScoringJobStatus(req, res);
});

/**
 * @route GET /stories/scoring/stats
 * @desc Get scoring statistics
 * @access Public
 */
router.get('/scoring/stats', async (req, res) => {
  await storyController.getScoringStats(req, res);
});

/**
 * @route GET /stories/scoring/openai/test
 * @desc Test OpenAI connection
 * @access Public
 */
router.get('/scoring/openai/test', async (req, res) => {
  await storyController.testOpenAIConnection(req, res);
});

/**
 * @route POST /stories/:id/eli5
 * @desc Generate ELI5 explanations for a story
 * @access Private
 */
router.post(
  '/:id/eli5',
  isAuthenticated,
  storyController.generateELI5.bind(storyController)
);

/**
 * @route GET /stories/:id/eli5
 * @desc Get cached ELI5 explanations
 * @access Public
 */
router.get(
  '/:id/eli5',
  storyController.getELI5.bind(storyController)
);

/**
 * @route DELETE /stories/:id/eli5
 * @desc Clear cached ELI5 explanations
 * @access Private (admin or creator)
 */
router.delete(
  '/:id/eli5',
  isAuthenticated,
  storyController.clearELI5.bind(storyController)
);

export default router;
