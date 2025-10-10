const express = require('express');
const { body } = require('express-validator');
const { 
  addFavorite, 
  removeFavorite, 
  getFavorites, 
  checkFavorite, 
  toggleFavorite 
} = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const favoriteValidation = [
  body('articleId')
    .isInt({ min: 1 })
    .withMessage('Article ID must be a positive integer')
];

const paginationValidation = [
  // Note: query validation would go here if needed
];

// Routes
router.post('/', favoriteValidation, addFavorite);
router.get('/', paginationValidation, getFavorites);
router.get('/:id', checkFavorite);
router.delete('/:id', removeFavorite);
router.post('/toggle', favoriteValidation, toggleFavorite);

module.exports = router;
