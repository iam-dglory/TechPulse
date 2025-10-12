const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection for Render deployment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  acquireTimeoutMillis: 10000,
});

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔄 Attempting to connect to PostgreSQL database...');
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL environment variable not found');
      return false;
    }
    
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Database error details:', error.code, error.severity);
    return false;
  }
};

// Initialize database and create tables
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE,
        full_name VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create posts table (for grievances and AI news)
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('grievance', 'ai_news', 'news')),
        category VARCHAR(100),
        criticality VARCHAR(50) DEFAULT 'medium',
        ai_risk_score INTEGER CHECK (ai_risk_score >= 1 AND ai_risk_score <= 10),
        government_action VARCHAR(100),
        location VARCHAR(200),
        tags TEXT[],
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        votes INTEGER DEFAULT 0,
        votes_up INTEGER DEFAULT 0,
        votes_down INTEGER DEFAULT 0,
        hot_score DECIMAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        votes_up INTEGER DEFAULT 0,
        votes_down INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id),
        UNIQUE(user_id, comment_id)
      )
    `);
    
    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_hot_score ON posts(hot_score DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_votes_post_id ON votes(post_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');
    
    console.log('✅ PostgreSQL Database tables created successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

// Update hot score for posts
const updateHotScore = async (postId) => {
  try {
    const client = await pool.connect();
    
    // Calculate hot score based on votes and time
    const result = await client.query(`
      UPDATE posts 
      SET hot_score = (
        (votes_up - votes_down) / 
        GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600, 1)
      )
      WHERE id = $1
    `, [postId]);
    
    client.release();
    return result;
  } catch (error) {
    console.error('❌ Hot score update failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  updateHotScore
};
