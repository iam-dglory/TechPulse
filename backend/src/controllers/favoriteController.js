const { pool } = require('../config/database');
const fallbackMiddleware = require('../middleware/fallback');

// Add article to favorites
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: 'Article ID is required' });
    }

    // Check if article exists
    const [articles] = await pool.execute(
      'SELECT id FROM articles WHERE id = ?',
      [articleId]
    );

    if (articles.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if already favorited
    const [existingFavorites] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND article_id = ?',
      [userId, articleId]
    );

    if (existingFavorites.length > 0) {
      return res.status(409).json({ error: 'Article already in favorites' });
    }

    // Add to favorites
    await pool.execute(
      'INSERT INTO favorites (user_id, article_id) VALUES (?, ?)',
      [userId, articleId]
    );

    res.status(201).json({ 
      message: 'Article added to favorites',
      articleId 
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};

// Remove article from favorites
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND article_id = ?',
      [userId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ 
      message: 'Article removed from favorites',
      articleId: id 
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
};

// Get user's favorite articles
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;

    // Get favorite articles with article details
    const [favorites] = await pool.execute(
      `SELECT f.id as favorite_id, f.created_at as favorited_at,
              a.id, a.title, a.description, a.url, a.source, a.category, 
              a.published_at, a.image_url
       FROM favorites f
       JOIN articles a ON f.article_id = a.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    res.json({
      favorites,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    
    // Check if it's a database error and use fallback
    if (fallbackMiddleware.isDatabaseError(error)) {
      console.log('🔄 Using fallback data for getFavorites');
      const fallbackResult = fallbackMiddleware.getFallbackFavorites(req.user?.userId || 1);
      return res.json({
        ...fallbackResult,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: fallbackResult.favorites.length,
          itemsPerPage: fallbackResult.favorites.length,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};

// Check if article is favorited by user
const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [favorites] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND article_id = ?',
      [userId, id]
    );

    res.json({ 
      isFavorited: favorites.length > 0,
      articleId: id 
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
};

// Toggle favorite status
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ error: 'Article ID is required' });
    }

    // Check if article exists
    const [articles] = await pool.execute(
      'SELECT id FROM articles WHERE id = ?',
      [articleId]
    );

    if (articles.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check current favorite status
    const [existingFavorites] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND article_id = ?',
      [userId, articleId]
    );

    let isFavorited;
    if (existingFavorites.length > 0) {
      // Remove from favorites
      await pool.execute(
        'DELETE FROM favorites WHERE user_id = ? AND article_id = ?',
        [userId, articleId]
      );
      isFavorited = false;
    } else {
      // Add to favorites
      await pool.execute(
        'INSERT INTO favorites (user_id, article_id) VALUES (?, ?)',
        [userId, articleId]
      );
      isFavorited = true;
    }

    res.json({
      message: isFavorited ? 'Article added to favorites' : 'Article removed from favorites',
      isFavorited,
      articleId
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
  toggleFavorite
};
