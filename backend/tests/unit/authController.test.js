const request = require('supertest');
const bcrypt = require('bcrypt');
const { pool } = require('../../src/config/database');
const { register, login, getProfile, updatePreferences } = require('../../src/controllers/authController');

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => [])
  }))
}));

describe('Auth Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { userId: 1, email: 'test@example.com' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(async () => {
    // Clean up test data
    await pool.execute('DELETE FROM user_preferences WHERE user_id > 0');
    await pool.execute('DELETE FROM users WHERE id > 0');
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registered successfully',
          token: expect.any(String),
          user: expect.objectContaining({
            id: expect.any(Number),
            email: 'test@example.com'
          })
        })
      );

      // Verify user was created in database
      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', ['test@example.com']);
      expect(users).toHaveLength(1);
      expect(bcrypt.compareSync('password123', users[0].password_hash)).toBe(true);
    });

    it('should return error if user already exists', async () => {
      // Create existing user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['test@example.com', hashedPassword]
      );

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User already exists'
      });
    });

    it('should create default user preferences', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      await register(mockReq, mockRes);

      const [preferences] = await pool.execute(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [1]
      );
      expect(preferences).toHaveLength(1);
      expect(JSON.parse(preferences[0].categories)).toEqual(['AI', 'Gadgets', 'Software']);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['test@example.com', hashedPassword]
      );
    });

    it('should login user with correct credentials', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          token: expect.any(String),
          user: expect.objectContaining({
            id: expect.any(Number),
            email: 'test@example.com'
          })
        })
      );
    });

    it('should return error for incorrect password', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });

    it('should return error for non-existent user', async () => {
      mockReq.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });
  });

  describe('getProfile', () => {
    beforeEach(async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['test@example.com', hashedPassword]
      );
      
      // Create user preferences
      await pool.execute(
        'INSERT INTO user_preferences (user_id, categories, notification_settings) VALUES (?, ?, ?)',
        [1, JSON.stringify(['AI', 'Gadgets']), JSON.stringify({ email: true, push: false })]
      );
    });

    it('should return user profile with preferences', async () => {
      mockReq.user = { userId: 1 };

      await getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: 1,
            email: 'test@example.com',
            preferences: expect.objectContaining({
              categories: ['AI', 'Gadgets'],
              notification_settings: { email: true, push: false }
            })
          })
        })
      );
    });

    it('should return default preferences if none exist', async () => {
      // Remove preferences
      await pool.execute('DELETE FROM user_preferences WHERE user_id = 1');
      mockReq.user = { userId: 1 };

      await getProfile(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            preferences: {
              categories: ['AI', 'Gadgets', 'Software'],
              notification_settings: { email: true, push: false }
            }
          })
        })
      );
    });
  });

  describe('updatePreferences', () => {
    beforeEach(async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['test@example.com', hashedPassword]
      );
    });

    it('should update user preferences', async () => {
      mockReq.user = { userId: 1 };
      mockReq.body = {
        categories: ['AI', 'Programming'],
        notification_settings: { email: false, push: true }
      };

      await updatePreferences(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Preferences updated successfully',
          preferences: {
            categories: ['AI', 'Programming'],
            notification_settings: { email: false, push: true }
          }
        })
      );

      // Verify preferences were saved
      const [preferences] = await pool.execute(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [1]
      );
      expect(JSON.parse(preferences[0].categories)).toEqual(['AI', 'Programming']);
    });

    it('should reject invalid categories', async () => {
      mockReq.user = { userId: 1 };
      mockReq.body = {
        categories: ['InvalidCategory'],
        notification_settings: { email: true, push: false }
      };

      await updatePreferences(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid categories')
        })
      );
    });
  });
});
