const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { generateToken } = require('../middleware/auth');

// Register new user
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    // Generate JWT token
    const token = generateToken({ 
      userId: result.insertId, 
      email 
    });

    // Create default user preferences
    await pool.execute(
      'INSERT INTO user_preferences (user_id, categories, notification_settings) VALUES (?, ?, ?)',
      [
        result.insertId,
        JSON.stringify(['AI', 'Gadgets', 'Software']),
        JSON.stringify({ email: true, push: false })
      ]
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({ 
      userId: user.id, 
      email: user.email 
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.execute(
      'SELECT id, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get user preferences
    const [preferences] = await pool.execute(
      'SELECT categories, notification_settings FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    const userPreferences = preferences.length > 0 ? {
      categories: JSON.parse(preferences[0].categories || '[]'),
      notification_settings: JSON.parse(preferences[0].notification_settings || '{}')
    } : {
      categories: ['AI', 'Gadgets', 'Software'],
      notification_settings: { email: true, push: false }
    };

    res.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        preferences: userPreferences
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { categories, notification_settings } = req.body;

    // Validate categories
    const validCategories = ['AI', 'Gadgets', 'Software', 'Programming', 'Startups', 'Tech News'];
    if (categories && !Array.isArray(categories)) {
      return res.status(400).json({ error: 'Categories must be an array' });
    }

    if (categories) {
      const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        return res.status(400).json({ 
          error: `Invalid categories: ${invalidCategories.join(', ')}` 
        });
      }
    }

    // Update preferences
    await pool.execute(
      `INSERT INTO user_preferences (user_id, categories, notification_settings) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       categories = VALUES(categories), 
       notification_settings = VALUES(notification_settings),
       updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        JSON.stringify(categories || ['AI', 'Gadgets', 'Software']),
        JSON.stringify(notification_settings || { email: true, push: false })
      ]
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences: {
        categories: categories || ['AI', 'Gadgets', 'Software'],
        notification_settings: notification_settings || { email: true, push: false }
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updatePreferences
};
