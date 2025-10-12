const fs = require('fs');
const path = require('path');

/**
 * Database Fallback Middleware
 * 
 * This middleware catches database connection errors and serves fallback data
 * from a local JSON file when the database is unavailable.
 */

class FallbackMiddleware {
  constructor() {
    this.fallbackData = null;
    this.fallbackPath = path.join(__dirname, '../../data/fallback.json');
    this.loadFallbackData();
  }

  /**
   * Load fallback data from JSON file
   */
  loadFallbackData() {
    try {
      const data = fs.readFileSync(this.fallbackPath, 'utf8');
      this.fallbackData = JSON.parse(data);
      console.log('✅ Fallback data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load fallback data:', error.message);
      this.fallbackData = this.getDefaultFallbackData();
    }
  }

  /**
   * Get default fallback data if file loading fails
   */
  getDefaultFallbackData() {
    return {
      articles: [
        {
          id: 1,
          title: "TechPulse API is running in fallback mode",
          summary: "The database is currently unavailable, but the API is serving fallback data to ensure continued operation.",
          content: "This is fallback data served when the database connection is unavailable. The TechPulse API is designed to maintain service even during database outages.",
          url: "https://techpulse.app",
          source: "TechPulse",
          category: "System",
          image_url: "https://via.placeholder.com/400x200/4ECDC4/FFFFFF?text=Fallback+Mode",
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      categories: ["AI", "Gadgets", "Software", "System"],
      users: [],
      favorites: [],
      metadata: {
        version: "1.0.0",
        last_updated: new Date().toISOString(),
        total_articles: 1,
        description: "Default fallback data for TechPulse API"
      }
    };
  }

  /**
   * Check if database connection is available
   */
  async checkDatabaseConnection() {
    try {
      const db = require('../config/database');
      if (db && db.testConnection) {
        return await db.testConnection();
      }
      return false;
    } catch (error) {
      console.log('Database connection check failed:', error.message);
      return false;
    }
  }

  /**
   * Handle database errors and return fallback response
   */
  handleDatabaseError(error, req, res, next) {
    console.log('🔄 Database error detected, switching to fallback mode:', error.message);
    
    // Add fallback indicator to response headers
    res.setHeader('X-Fallback-Mode', 'true');
    res.setHeader('X-Fallback-Reason', error.message);

    // Don't call next() to prevent further error handling
    // The calling controller will handle the response
    return false;
  }

  /**
   * Get fallback articles with pagination and filtering
   */
  getFallbackArticles(options = {}) {
    let articles = [...this.fallbackData.articles];

    // Apply category filter
    if (options.category && options.category !== 'all') {
      articles = articles.filter(article => 
        article.category.toLowerCase() === options.category.toLowerCase()
      );
    }

    // Apply search filter
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm) ||
        article.summary.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by published date (newest first)
    articles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // Apply pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedArticles = articles.slice(startIndex, endIndex);

    return {
      articles: paginatedArticles,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(articles.length / limit),
        total_articles: articles.length,
        limit: limit,
        has_next: endIndex < articles.length,
        has_prev: page > 1
      },
      fallback_mode: true,
      message: "Serving fallback data due to database unavailability"
    };
  }

  /**
   * Get fallback article by ID
   */
  getFallbackArticleById(id) {
    const article = this.fallbackData.articles.find(a => a.id === parseInt(id));
    return article || null;
  }

  /**
   * Get fallback categories
   */
  getFallbackCategories() {
    return {
      categories: this.fallbackData.categories,
      fallback_mode: true,
      message: "Serving fallback data due to database unavailability"
    };
  }

  /**
   * Get fallback user favorites
   */
  getFallbackFavorites(userId) {
    const userFavorites = this.fallbackData.favorites.filter(f => f.user_id === parseInt(userId));
    const favoriteArticles = userFavorites.map(fav => {
      const article = this.fallbackData.articles.find(a => a.id === fav.article_id);
      return article ? { ...article, favorite_id: fav.id } : null;
    }).filter(Boolean);

    return {
      favorites: favoriteArticles,
      total: favoriteArticles.length,
      fallback_mode: true,
      message: "Serving fallback data due to database unavailability"
    };
  }

  /**
   * Get fallback user by ID
   */
  getFallbackUserById(id) {
    return this.fallbackData.users.find(u => u.id === parseInt(id)) || null;
  }

  /**
   * Get fallback user by email
   */
  getFallbackUserByEmail(email) {
    return this.fallbackData.users.find(u => u.email === email) || null;
  }

  /**
   * Create a mock authentication response
   */
  createFallbackAuthResponse(user, token) {
    return {
      success: true,
      message: "Authentication successful (fallback mode)",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: token || 'fallback-token-' + Date.now(),
      fallback_mode: true,
      warning: "Database unavailable - using fallback authentication"
    };
  }

  /**
   * Middleware function to wrap database operations
   */
  async withFallback(operation, req, res, next) {
    try {
      // Try the database operation first
      const result = await operation();
      return result;
    } catch (error) {
      // Check if it's a database connection error
      if (this.isDatabaseError(error)) {
        console.log('🔄 Database error in operation, using fallback:', error.message);
        
        // Set fallback headers
        res.setHeader('X-Fallback-Mode', 'true');
        res.setHeader('X-Fallback-Reason', error.message);

        // Return fallback result based on the operation type
        return this.getFallbackResult(req);
      }
      
      // If it's not a database error, re-throw it
      throw error;
    }
  }

  /**
   * Check if error is related to database connection
   */
  isDatabaseError(error) {
    const dbErrorMessages = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ER_ACCESS_DENIED_ERROR',
      'ER_BAD_DB_ERROR',
      'ER_DBACCESS_DENIED_ERROR',
      'connection lost',
      'database connection',
      'mysql connection',
      'connection refused',
      'timeout'
    ];

    const errorMessage = error.message.toLowerCase();
    return dbErrorMessages.some(msg => errorMessage.includes(msg));
  }

  /**
   * Get fallback result based on request path and method
   */
  getFallbackResult(req) {
    const { path: requestPath, method } = req;

    if (requestPath.includes('/articles')) {
      if (method === 'GET') {
        return this.getFallbackArticles(req.query);
      }
    }

    if (requestPath.includes('/categories')) {
      if (method === 'GET') {
        return this.getFallbackCategories();
      }
    }

    if (requestPath.includes('/favorites')) {
      if (method === 'GET') {
        return this.getFallbackFavorites(req.user?.id || 1);
      }
    }

    // Default fallback response
    return {
      success: false,
      message: "Service temporarily unavailable - database connection lost",
      fallback_mode: true,
      data: null
    };
  }
}

// Create singleton instance
const fallbackMiddleware = new FallbackMiddleware();

module.exports = fallbackMiddleware;
