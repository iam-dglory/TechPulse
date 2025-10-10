const request = require('supertest');
const app = require('../../src/server');
const { pool } = require('../../src/config/database');
const bcrypt = require('bcrypt');

describe('Auth Integration Tests', () => {
  afterEach(async () => {
    // Clean up test data
    await pool.execute('DELETE FROM user_preferences WHERE user_id > 0');
    await pool.execute('DELETE FROM users WHERE id > 0');
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'User registered successfully',
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          email: 'test@example.com'
        }
      });

      // Verify user was created in database
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', ['test@example.com']);
      expect(users).toHaveLength(1);
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return validation error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return error for duplicate email', async () => {
      // Create existing user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['test@example.com', hashedPassword]
      );

      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['test@example.com', hashedPassword]
      );
    });

    it('should login with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Login successful',
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          email: 'test@example.com'
        }
      });
    });

    it('should return error for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Create test user and get token
      const hashedPassword = await bcrypt.hash('password123', 10);
      const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['test@example.com', hashedPassword]
      );
      userId = result.insertId;

      // Create user preferences
      await pool.execute(
        'INSERT INTO user_preferences (user_id, categories, notification_settings) VALUES (?, ?, ?)',
        [userId, JSON.stringify(['AI', 'Gadgets']), JSON.stringify({ email: true, push: false })]
      );

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user: {
          id: userId,
          email: 'test@example.com',
          preferences: {
            categories: ['AI', 'Gadgets'],
            notification_settings: { email: true, push: false }
          }
        }
      });
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('PUT /api/auth/preferences', () => {
    let authToken;

    beforeEach(async () => {
      // Create test user and get token
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['test@example.com', hashedPassword]
      );

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should update user preferences', async () => {
      const preferences = {
        categories: ['AI', 'Programming'],
        notification_settings: { email: false, push: true }
      };

      const response = await request(app)
        .put('/api/auth/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferences)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Preferences updated successfully',
        preferences: {
          categories: ['AI', 'Programming'],
          notification_settings: { email: false, push: true }
        }
      });

      // Verify preferences were saved
      const [preferencesData] = await pool.execute(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [1]
      );
      expect(JSON.parse(preferencesData[0].categories)).toEqual(['AI', 'Programming']);
    });

    it('should return error for invalid categories', async () => {
      const preferences = {
        categories: ['InvalidCategory'],
        notification_settings: { email: true, push: false }
      };

      const response = await request(app)
        .put('/api/auth/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferences)
        .expect(400);

      expect(response.body.error).toContain('Invalid categories');
    });
  });
});
