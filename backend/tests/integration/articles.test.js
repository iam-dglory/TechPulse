const request = require('supertest');
const app = require('../../src/server');
const { pool } = require('../../src/config/database');

describe('Articles Integration Tests', () => {
  beforeEach(async () => {
    // Insert test articles
    await pool.execute(`
      INSERT INTO articles (title, description, url, source, category, published_at, image_url)
      VALUES 
        ('AI Breakthrough', 'Revolutionary AI technology', 'https://example.com/ai', 'TechNews', 'AI', NOW(), 'https://example.com/ai.jpg'),
        ('New Smartphone', 'Latest smartphone release', 'https://example.com/phone', 'GadgetWorld', 'Gadgets', NOW(), 'https://example.com/phone.jpg'),
        ('Software Update', 'New software features', 'https://example.com/software', 'DevNews', 'Software', NOW(), 'https://example.com/software.jpg'),
        ('Another AI Article', 'More AI news', 'https://example.com/ai2', 'TechNews', 'AI', NOW(), 'https://example.com/ai2.jpg')
    `);
  });

  afterEach(async () => {
    // Clean up test data
    await pool.execute('DELETE FROM articles WHERE id > 0');
  });

  describe('GET /api/articles', () => {
    it('should return all articles with pagination', async () => {
      const response = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(response.body).toMatchObject({
        articles: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            source: expect.any(String),
            category: expect.any(String),
            url: expect.any(String)
          })
        ]),
        pagination: expect.objectContaining({
          currentPage: 1,
          totalItems: 4,
          itemsPerPage: 20,
          hasNextPage: false
        })
      });
    });

    it('should filter articles by category', async () => {
      const response = await request(app)
        .get('/api/articles?category=AI')
        .expect(200);

      expect(response.body.articles).toHaveLength(2);
      expect(response.body.articles.every(article => article.category === 'AI')).toBe(true);
      expect(response.body.pagination.totalItems).toBe(2);
    });

    it('should filter articles by source', async () => {
      const response = await request(app)
        .get('/api/articles?source=TechNews')
        .expect(200);

      expect(response.body.articles).toHaveLength(2);
      expect(response.body.articles.every(article => article.source === 'TechNews')).toBe(true);
      expect(response.body.pagination.totalItems).toBe(2);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/articles?page=1&limit=2')
        .expect(200);

      expect(response.body.articles).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        itemsPerPage: 2,
        totalItems: 4,
        hasNextPage: true
      });
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/api/articles?page=0&limit=0')
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/articles/search', () => {
    it('should search articles by keyword', async () => {
      const response = await request(app)
        .get('/api/articles/search?q=AI')
        .expect(200);

      expect(response.body).toMatchObject({
        articles: expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('AI')
          })
        ]),
        query: 'AI',
        pagination: expect.objectContaining({
          totalItems: expect.any(Number)
        })
      });
    });

    it('should return error for empty search query', async () => {
      const response = await request(app)
        .get('/api/articles/search?q=')
        .expect(400);

      expect(response.body.error).toBe('Search query is required');
    });

    it('should return empty results for non-matching query', async () => {
      const response = await request(app)
        .get('/api/articles/search?q=nonexistent')
        .expect(200);

      expect(response.body.articles).toHaveLength(0);
      expect(response.body.pagination.totalItems).toBe(0);
    });

    it('should validate search parameters', async () => {
      const response = await request(app)
        .get('/api/articles/search?q=test&page=0')
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should return article by ID', async () => {
      const response = await request(app)
        .get('/api/articles/1')
        .expect(200);

      expect(response.body).toMatchObject({
        article: expect.objectContaining({
          id: 1,
          title: 'AI Breakthrough',
          source: 'TechNews',
          category: 'AI'
        })
      });
    });

    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .get('/api/articles/999')
        .expect(404);

      expect(response.body.error).toBe('Article not found');
    });
  });

  describe('GET /api/articles/categories', () => {
    it('should return all categories with counts', async () => {
      const response = await request(app)
        .get('/api/articles/categories')
        .expect(200);

      expect(response.body).toMatchObject({
        categories: expect.arrayContaining([
          expect.objectContaining({
            category: 'AI',
            count: 2
          }),
          expect.objectContaining({
            category: 'Gadgets',
            count: 1
          }),
          expect.objectContaining({
            category: 'Software',
            count: 1
          })
        ])
      });
    });
  });

  describe('GET /api/articles/sources', () => {
    it('should return all sources with counts', async () => {
      const response = await request(app)
        .get('/api/articles/sources')
        .expect(200);

      expect(response.body).toMatchObject({
        sources: expect.arrayContaining([
          expect.objectContaining({
            source: 'TechNews',
            count: 2
          }),
          expect.objectContaining({
            source: 'GadgetWorld',
            count: 1
          }),
          expect.objectContaining({
            source: 'DevNews',
            count: 1
          })
        ])
      });
    });
  });

  describe('GET /api/articles/trending', () => {
    it('should return trending articles', async () => {
      const response = await request(app)
        .get('/api/articles/trending')
        .expect(200);

      expect(response.body).toMatchObject({
        articles: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            source: expect.any(String),
            category: expect.any(String),
            favorite_count: expect.any(Number)
          })
        ])
      });
    });

    it('should limit trending articles', async () => {
      const response = await request(app)
        .get('/api/articles/trending?limit=2')
        .expect(200);

      expect(response.body.articles.length).toBeLessThanOrEqual(2);
    });
  });
});
