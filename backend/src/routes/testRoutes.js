const express = require('express');
const router = express.Router();
const fallbackMiddleware = require('../middleware/fallback');

// Test endpoint to simulate database errors and trigger fallback
router.get('/test-fallback', async (req, res) => {
  try {
    // Simulate a database connection error
    const mockDbError = new Error('ECONNREFUSED: Connection refused to database');
    
    // This will trigger the fallback mechanism
    throw mockDbError;
  } catch (error) {
    console.log('🔄 Simulated database error, testing fallback...');
    
    if (fallbackMiddleware.isDatabaseError(error)) {
      const fallbackResult = fallbackMiddleware.getFallbackArticles(req.query);
      return res.json({
        ...fallbackResult,
        test_mode: true,
        simulated_error: error.message
      });
    }
    
    res.status(500).json({ error: 'Unexpected error' });
  }
});

// Test endpoint to check fallback data directly
router.get('/fallback-data', (req, res) => {
  res.json({
    message: 'Fallback data status',
    fallback_loaded: !!fallbackMiddleware.fallbackData,
    total_articles: fallbackMiddleware.fallbackData?.articles?.length || 0,
    total_categories: fallbackMiddleware.fallbackData?.categories?.length || 0,
    total_users: fallbackMiddleware.fallbackData?.users?.length || 0,
    metadata: fallbackMiddleware.fallbackData?.metadata || null
  });
});

// Test endpoint to simulate different types of database errors
router.get('/test-db-errors', (req, res) => {
  const errorTypes = [
    'ECONNREFUSED: Connection refused',
    'ETIMEDOUT: Connection timeout',
    'ENOTFOUND: Host not found',
    'ER_ACCESS_DENIED_ERROR: Access denied',
    'connection lost to database',
    'mysql connection failed'
  ];

  const results = errorTypes.map(errorMsg => {
    const error = new Error(errorMsg);
    return {
      error_message: errorMsg,
      is_database_error: fallbackMiddleware.isDatabaseError(error)
    };
  });

  res.json({
    message: 'Database error detection test',
    results
  });
});

module.exports = router;
