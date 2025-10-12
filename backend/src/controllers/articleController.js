const { validationResult } = require('express-validator');
const { pool } = require('../config/database');
const newsAggregator = require('../services/newsAggregator');
const fallbackMiddleware = require('../middleware/fallback');

// Get articles with pagination and filtering
const getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const source = req.query.source;
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = [];
    let queryParams = [];

    if (category && category !== 'all') {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }

    if (source && source !== 'all') {
      whereConditions.push('source = ?');
      queryParams.push(source);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM articles ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Get articles
    const [articles] = await pool.execute(
      `SELECT id, title, description, url, source, category, published_at, image_url, created_at
       FROM articles 
       ${whereClause}
       ORDER BY published_at DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    
    // Check if it's a database error and use fallback
    if (fallbackMiddleware.isDatabaseError(error)) {
      console.log('🔄 Using fallback data for getArticles');
      const fallbackResult = fallbackMiddleware.getFallbackArticles(req.query);
      return res.json(fallbackResult);
    }
    
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

// Search articles by keyword
const searchArticles = async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${query.trim()}%`;

    // Search using FULLTEXT index for better performance
    const [articles] = await pool.execute(
      `SELECT id, title, description, url, source, category, published_at, image_url, created_at,
              MATCH(title, description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
       FROM articles 
       WHERE MATCH(title, description) AGAINST(? IN NATURAL LANGUAGE MODE)
       ORDER BY relevance DESC, published_at DESC
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM articles 
       WHERE MATCH(title, description) AGAINST(? IN NATURAL LANGUAGE MODE)`,
      [searchTerm]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      articles,
      query,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Search articles error:', error);
    
    // Check if it's a database error and use fallback
    if (fallbackMiddleware.isDatabaseError(error)) {
      console.log('🔄 Using fallback data for searchArticles');
      const fallbackResult = fallbackMiddleware.getFallbackArticles({
        ...req.query,
        search: req.query.q
      });
      return res.json({
        ...fallbackResult,
        query: req.query.q
      });
    }
    
    res.status(500).json({ error: 'Search failed' });
  }
};

// Get article by ID
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [articles] = await pool.execute(
      `SELECT id, title, description, url, source, category, published_at, image_url, created_at
       FROM articles 
       WHERE id = ?`,
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ article: articles[0] });
  } catch (error) {
    console.error('Get article by ID error:', error);
    
    // Check if it's a database error and use fallback
    if (fallbackMiddleware.isDatabaseError(error)) {
      console.log('🔄 Using fallback data for getArticleById');
      const fallbackArticle = fallbackMiddleware.getFallbackArticleById(req.params.id);
      if (fallbackArticle) {
        return res.json({ 
          article: fallbackArticle,
          fallback_mode: true,
          message: "Serving fallback data due to database unavailability"
        });
      } else {
        return res.status(404).json({ error: 'Article not found' });
      }
    }
    
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

// Get available categories
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category, COUNT(*) as count FROM articles GROUP BY category ORDER BY count DESC'
    );

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    
    // Check if it's a database error and use fallback
    if (fallbackMiddleware.isDatabaseError(error)) {
      console.log('🔄 Using fallback data for getCategories');
      const fallbackResult = fallbackMiddleware.getFallbackCategories();
      return res.json(fallbackResult);
    }
    
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get available sources
const getSources = async (req, res) => {
  try {
    const [sources] = await pool.execute(
      'SELECT DISTINCT source, COUNT(*) as count FROM articles GROUP BY source ORDER BY count DESC'
    );

    res.json({ sources });
  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
};

// Trigger manual news aggregation
const refreshNews = async (req, res) => {
  try {
    console.log('🔄 Manual news refresh triggered');
    const result = await newsAggregator.aggregateNews();
    
    res.json({
      message: 'News refreshed successfully',
      result
    });
  } catch (error) {
    console.error('Refresh news error:', error);
    res.status(500).json({ error: 'Failed to refresh news' });
  }
};

// Get trending articles (most recent with engagement)
const getTrendingArticles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get articles from last 7 days with favorites count
    const [articles] = await pool.execute(
      `SELECT a.id, a.title, a.description, a.url, a.source, a.category, 
              a.published_at, a.image_url, COUNT(f.id) as favorite_count
       FROM articles a
       LEFT JOIN favorites f ON a.id = f.article_id
       WHERE a.published_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY a.id
       ORDER BY favorite_count DESC, a.published_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json({ articles });
  } catch (error) {
    console.error('Get trending articles error:', error);
    res.status(500).json({ error: 'Failed to fetch trending articles' });
  }
};

module.exports = {
  getArticles,
  searchArticles,
  getArticleById,
  getCategories,
  getSources,
  refreshNews,
  getTrendingArticles
};
