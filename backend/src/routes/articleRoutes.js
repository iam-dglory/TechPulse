const express = require('express');
const { query } = require('express-validator');
const { 
  getArticles, 
  searchArticles, 
  getArticleById, 
  getCategories, 
  getSources, 
  refreshNews,
  getTrendingArticles 
} = require('../controllers/articleController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const searchValidation = [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Public routes
router.get('/', paginationValidation, getArticles);
router.get('/search', searchValidation, searchArticles);
router.get('/categories', getCategories);
router.get('/sources', getSources);
router.get('/trending', getTrendingArticles);
router.get('/:id', getArticleById);

// Protected routes (admin functions)
router.post('/refresh', authenticateToken, refreshNews);

module.exports = router;
