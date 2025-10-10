const { pool } = require('../../src/config/database');
const { 
  getArticles, 
  searchArticles, 
  getArticleById, 
  getCategories, 
  getSources 
} = require('../../src/controllers/articleController');

describe('Article Controller', () => {
  let mockReq, mockRes;

  beforeEach(async () => {
    mockReq = {
      query: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Insert test articles
    await pool.execute(`
      INSERT INTO articles (title, description, url, source, category, published_at, image_url)
      VALUES 
        ('Test AI Article', 'Description about AI', 'https://example.com/ai', 'Test Source', 'AI', NOW(), 'https://example.com/image1.jpg'),
        ('Test Gadget Article', 'Description about gadgets', 'https://example.com/gadget', 'Test Source', 'Gadgets', NOW(), 'https://example.com/image2.jpg'),
        ('Test Software Article', 'Description about software', 'https://example.com/software', 'Another Source', 'Software', NOW(), 'https://example.com/image3.jpg')
    `);
  });

  afterEach(async () => {
    // Clean up test data
    await pool.execute('DELETE FROM articles WHERE id > 0');
  });

  describe('getArticles', () => {
    it('should return all articles with pagination', async () => {
      mockReq.query = { page: 1, limit: 10 };

      await getArticles(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          articles: expect.arrayContaining([
            expect.objectContaining({
              title: expect.any(String),
              source: expect.any(String),
              category: expect.any(String)
            })
          ]),
          pagination: expect.objectContaining({
            currentPage: 1,
            totalItems: 3,
            hasNextPage: false
          })
        })
      );
    });

    it('should filter articles by category', async () => {
      mockReq.query = { category: 'AI' };

      await getArticles(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          articles: expect.arrayContaining([
            expect.objectContaining({
              category: 'AI'
            })
          ]),
          pagination: expect.objectContaining({
            totalItems: 1
          })
        })
      );
    });

    it('should filter articles by source', async () => {
      mockReq.query = { source: 'Test Source' };

      await getArticles(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          articles: expect.arrayContaining([
            expect.objectContaining({
              source: 'Test Source'
            })
          ]),
          pagination: expect.objectContaining({
            totalItems: 2
          })
        })
      );
    });
  });

  describe('searchArticles', () => {
    it('should search articles by keyword', async () => {
      mockReq.query = { q: 'AI' };

      await searchArticles(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          articles: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('AI')
            })
          ]),
          query: 'AI'
        })
      );
    });

    it('should return error for empty search query', async () => {
      mockReq.query = { q: '' };

      await searchArticles(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Search query is required'
      });
    });

    it('should return empty results for non-matching query', async () => {
      mockReq.query = { q: 'nonexistent' };

      await searchArticles(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          articles: [],
          query: 'nonexistent',
          pagination: expect.objectContaining({
            totalItems: 0
          })
        })
      );
    });
  });

  describe('getArticleById', () => {
    it('should return article by ID', async () => {
      mockReq.params = { id: 1 };

      await getArticleById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          article: expect.objectContaining({
            id: 1,
            title: 'Test AI Article'
          })
        })
      );
    });

    it('should return 404 for non-existent article', async () => {
      mockReq.params = { id: 999 };

      await getArticleById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Article not found'
      });
    });
  });

  describe('getCategories', () => {
    it('should return all categories with counts', async () => {
      await getCategories(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: expect.arrayContaining([
            expect.objectContaining({
              category: 'AI',
              count: 1
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
        })
      );
    });
  });

  describe('getSources', () => {
    it('should return all sources with counts', async () => {
      await getSources(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: expect.arrayContaining([
            expect.objectContaining({
              source: 'Test Source',
              count: 2
            }),
            expect.objectContaining({
              source: 'Another Source',
              count: 1
            })
          ])
        })
      );
    });
  });
});
