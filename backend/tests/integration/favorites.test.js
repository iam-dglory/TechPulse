const request = require('supertest');
const app = require('../../src/server');
const { pool } = require('../../src/config/database');
const bcrypt = require('bcrypt');

describe('Favorites Integration Tests', () => {
  let authToken;
  let userId;
  let articleId;

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [userResult] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      ['test@example.com', hashedPassword]
    );
    userId = userResult.insertId;

    // Create test article
    const [articleResult] = await pool.execute(`
      INSERT INTO articles (title, description, url, source, category, published_at, image_url)
      VALUES (?, ?, ?, ?, ?, NOW(), ?)
    `, ['Test Article', 'Test Description', 'https://example.com/test', 'Test Source', 'AI', 'https://example.com/image.jpg']);
    articleId = articleResult.insertId;

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterEach(async () => {
    // Clean up test data
    await pool.execute('DELETE FROM favorites WHERE user_id > 0');
    await pool.execute('DELETE FROM articles WHERE id > 0');
    await pool.execute('DELETE FROM users WHERE id > 0');
  });

  describe('POST /api/favorites', () => {
    it('should add article to favorites', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ articleId })
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Article added to favorites',
        articleId
      });

      // Verify favorite was saved
      const [favorites] = await pool.execute(
        'SELECT * FROM favorites WHERE user_id = ? AND article_id = ?',
        [userId, articleId]
      );
      expect(favorites).toHaveLength(1);
    });

    it('should return error for non-existent article', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ articleId: 999 })
        .expect(404);

      expect(response.body.error).toBe('Article not found');
    });

    it('should return error for duplicate favorite', async () => {
      // Add favorite first time
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ articleId })
        .expect(201);

      // Try to add again
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ articleId })
        .expect(409);

      expect(response.body.error).toBe('Article already in favorites');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .send({ articleId })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should validate article ID', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ articleId: 'invalid' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/favorites', () => {
    beforeEach(async () => {
      // Add some favorites
      await pool.execute(
        'INSERT INTO favorites (user_id, article_id) VALUES (?, ?)',
        [userId, articleId]
      );

      // Add another article and favorite
      const [articleResult2] = await pool.execute(`
        INSERT INTO articles (title, description, url, source, category, published_at, image_url)
        VALUES (?, ?, ?, ?, ?, NOW(), ?)
      `, ['Test Article 2', 'Test Description 2', 'https://example.com/test2', 'Test Source 2', 'Gadgets', 'https://example.com/image2.jpg']);
      
      await pool.execute(
        'INSERT INTO favorites (user_id, article_id) VALUES (?, ?)',
        [userId, articleResult2.insertId]
      );
    });

    it('should return user favorites', async () => {
      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        favorites: expect.arrayContaining([
          expect.objectContaining({
            favorite_id: expect.any(Number),
            favorited_at: expect.any(String),
            title: expect.any(String),
            source: expect.any(String),
            category: expect.any(String)
          })
        ]),
        pagination: expect.objectContaining({
          currentPage: 1,
          totalItems: 2,
          hasNextPage: false
        })
      });
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/favorites?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.favorites).toHaveLength(1);
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        itemsPerPage: 1,
        totalItems: 2,
        hasNextPage: true
      });
    });

    it('should return empty array for user with no favorites', async () => {
      // Create another user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['test2@example.com', hashedPassword]
      );

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test2@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);

      expect(response.body.favorites).toHaveLength(0);
      expect(response.body.pagination.totalItems).toBe(0);
    });
  });

  describe('GET /api/favorites/:id', () => {
    it('should check if article is favorited', async () => {
      // Add favorite
      await pool.execute(
        'INSERT INTO favorites (user_id, article_id) VALUES (?, ?)',
        [userId, articleId]
      );

      const response = await request(app)
        .get(`/api/favorites/${articleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        isFavorited: true,
        articleId
      });
    });

    it('should return false for non-favorited article', async () => {
      const response = await request(app)
        .get(`/api/favorites/${articleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        isFavorited: false,
        articleId
      });
    });
  });

  describe('DELETE /api/favorites/:id', () => {
    beforeEach(async () => {
      // Add favorite
      await pool.execute(
        'INSERT INTO favorites (user_id, article_id) VALUES (?, ?)',
        [userId, articleId]
      );
    });

    it('should remove article from favorites', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${articleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Article removed from favorites',
        articleId
      });

      // Verify favorite was removed
      const [favorites] = await pool.execute(
        'SELECT * FROM favorites WHERE user_id = ? AND article_id = ?',
        [userId, articleId]
      );
      expect(favorites).toHaveLength(0);
    });

    it('should return error for non-existent favorite', async () => {
      const response = await request(app)
        .delete('/api/favorites/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Favorite not found');
    });
  });

  describe('POST /api/favorites/toggle', () => {
    it('should add article to favorites if not favorited', async () => {
      const response = await request(app)
        .post('/api/favorites/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ articleId })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Article added to favorites',
        isFavorited: true,
        articleId
      });
    });

    it('should remove article from favorites if already favorited', async () => {
      // Add favorite first
      await pool.execute(
        'INSERT INTO favorites (user_id, article_id) VALUES (?, ?)',
        [userId, articleId]
      );

      const response = await request(app)
        .post('/api/favorites/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ articleId })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Article removed from favorites',
        isFavorited: false,
        articleId
      });
    });

    it('should return error for non-existent article', async () => {
      const response = await request(app)
        .post('/api/favorites/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ articleId: 999 })
        .expect(404);

      expect(response.body.error).toBe('Article not found');
    });
  });
});
