const request = require('supertest');
const express = require('express');
const fallbackMiddleware = require('../src/middleware/fallback');

describe('Fallback Middleware Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Fallback Data Loading', () => {
    test('should load fallback data successfully', () => {
      expect(fallbackMiddleware.fallbackData).toBeDefined();
      expect(fallbackMiddleware.fallbackData.articles).toBeDefined();
      expect(Array.isArray(fallbackMiddleware.fallbackData.articles)).toBe(true);
      expect(fallbackMiddleware.fallbackData.articles.length).toBeGreaterThan(0);
    });

    test('should have valid article structure', () => {
      const articles = fallbackMiddleware.fallbackData.articles;
      const firstArticle = articles[0];
      
      expect(firstArticle).toHaveProperty('id');
      expect(firstArticle).toHaveProperty('title');
      expect(firstArticle).toHaveProperty('summary');
      expect(firstArticle).toHaveProperty('content');
      expect(firstArticle).toHaveProperty('url');
      expect(firstArticle).toHaveProperty('source');
      expect(firstArticle).toHaveProperty('category');
      expect(firstArticle).toHaveProperty('image_url');
      expect(firstArticle).toHaveProperty('published_at');
    });
  });

  describe('Database Error Detection', () => {
    test('should detect database connection errors', () => {
      const dbErrors = [
        new Error('ECONNREFUSED: Connection refused'),
        new Error('ETIMEDOUT: Connection timeout'),
        new Error('ENOTFOUND: Host not found'),
        new Error('ER_ACCESS_DENIED_ERROR: Access denied'),
        new Error('connection lost to database'),
        new Error('mysql connection failed'),
        new Error('connection refused'),
        new Error('timeout connecting to database')
      ];

      dbErrors.forEach(error => {
        expect(fallbackMiddleware.isDatabaseError(error)).toBe(true);
      });
    });

    test('should not detect non-database errors', () => {
      const nonDbErrors = [
        new Error('Validation failed'),
        new Error('Invalid input'),
        new Error('File not found'),
        new Error('Permission denied'),
        new Error('Network error')
      ];

      nonDbErrors.forEach(error => {
        expect(fallbackMiddleware.isDatabaseError(error)).toBe(false);
      });
    });
  });

  describe('Fallback Articles', () => {
    test('should return fallback articles with pagination', () => {
      const result = fallbackMiddleware.getFallbackArticles({
        page: 1,
        limit: 5
      });

      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('fallback_mode', true);
      expect(result).toHaveProperty('message');
      expect(Array.isArray(result.articles)).toBe(true);
      expect(result.articles.length).toBeLessThanOrEqual(5);
    });

    test('should filter articles by category', () => {
      const result = fallbackMiddleware.getFallbackArticles({
        category: 'AI',
        page: 1,
        limit: 10
      });

      expect(result.fallback_mode).toBe(true);
      result.articles.forEach(article => {
        expect(article.category.toLowerCase()).toBe('ai');
      });
    });

    test('should filter articles by search term', () => {
      const result = fallbackMiddleware.getFallbackArticles({
        search: 'AI',
        page: 1,
        limit: 10
      });

      expect(result.fallback_mode).toBe(true);
      result.articles.forEach(article => {
        const searchTerm = 'AI'.toLowerCase();
        const title = article.title.toLowerCase();
        const summary = article.summary.toLowerCase();
        const content = article.content.toLowerCase();
        
        expect(
          title.includes(searchTerm) || 
          summary.includes(searchTerm) || 
          content.includes(searchTerm)
        ).toBe(true);
      });
    });
  });

  describe('Fallback Article by ID', () => {
    test('should return article by ID', () => {
      const article = fallbackMiddleware.getFallbackArticleById(1);
      
      expect(article).toBeDefined();
      expect(article.id).toBe(1);
      expect(article.title).toBeDefined();
    });

    test('should return null for non-existent ID', () => {
      const article = fallbackMiddleware.getFallbackArticleById(999);
      
      expect(article).toBeNull();
    });
  });

  describe('Fallback Categories', () => {
    test('should return fallback categories', () => {
      const result = fallbackMiddleware.getFallbackCategories();
      
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('fallback_mode', true);
      expect(result).toHaveProperty('message');
      expect(Array.isArray(result.categories)).toBe(true);
      expect(result.categories.length).toBeGreaterThan(0);
    });
  });

  describe('Fallback Favorites', () => {
    test('should return fallback favorites for user', () => {
      const result = fallbackMiddleware.getFallbackFavorites(1);
      
      expect(result).toHaveProperty('favorites');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('fallback_mode', true);
      expect(result).toHaveProperty('message');
      expect(Array.isArray(result.favorites)).toBe(true);
    });
  });

  describe('Fallback User Authentication', () => {
    test('should find user by email', () => {
      const user = fallbackMiddleware.getFallbackUserByEmail('demo@techpulse.app');
      
      expect(user).toBeDefined();
      expect(user.email).toBe('demo@techpulse.app');
      expect(user.id).toBe(1);
    });

    test('should return null for non-existent email', () => {
      const user = fallbackMiddleware.getFallbackUserByEmail('nonexistent@example.com');
      
      expect(user).toBeNull();
    });

    test('should create fallback auth response', () => {
      const user = { id: 1, email: 'demo@techpulse.app', name: 'Demo User', role: 'citizen' };
      const token = 'test-token';
      
      const response = fallbackMiddleware.createFallbackAuthResponse(user, token);
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('user');
      expect(response).toHaveProperty('token', token);
      expect(response).toHaveProperty('fallback_mode', true);
      expect(response).toHaveProperty('warning');
    });
  });

  describe('Fallback Result Generation', () => {
    test('should return appropriate fallback result for articles endpoint', () => {
      const req = {
        path: '/api/articles',
        method: 'GET',
        query: { page: 1, limit: 10 }
      };
      
      const result = fallbackMiddleware.getFallbackResult(req);
      
      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('fallback_mode', true);
    });

    test('should return appropriate fallback result for categories endpoint', () => {
      const req = {
        path: '/api/categories',
        method: 'GET'
      };
      
      const result = fallbackMiddleware.getFallbackResult(req);
      
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('fallback_mode', true);
    });

    test('should return default fallback for unknown endpoints', () => {
      const req = {
        path: '/api/unknown',
        method: 'GET'
      };
      
      const result = fallbackMiddleware.getFallbackResult(req);
      
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('fallback_mode', true);
    });
  });
});
