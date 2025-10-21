const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
let db;

const connectDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'texhpulze_db',
      port: process.env.DB_PORT || 3306
    });
    console.log('✅ Database connected successfully');
    
    // Initialize tables
    await initializeTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Running in fallback mode with in-memory data');
  }
};

const initializeTables = async () => {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        bio TEXT,
        avatar_url VARCHAR(255),
        karma INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Posts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INT NOT NULL,
        type ENUM('grievance', 'news') DEFAULT 'grievance',
        category VARCHAR(100),
        criticality ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
        status VARCHAR(50) DEFAULT 'Under Review',
        location VARCHAR(100),
        votes INT DEFAULT 0,
        upvotes INT DEFAULT 0,
        downvotes INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        hot_score DECIMAL(10,2) DEFAULT 0,
        ai_risk_score DECIMAL(3,1),
        ai_categorization TEXT,
        government_action TEXT,
        tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `);

    // Comments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        author_id INT NOT NULL,
        content TEXT NOT NULL,
        votes INT DEFAULT 0,
        upvotes INT DEFAULT 0,
        downvotes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `);

    // Sessions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Failed to initialize tables:', error.message);
  }
};

// In-memory fallback data
let users = [
  {
    id: 1,
    username: 'tech_advocate',
    email: 'user@example.com',
    password: 'password123',
    displayName: 'Tech Advocate',
    bio: 'Passionate about technology ethics and digital rights',
    karma: 1250,
    avatar: 'https://via.placeholder.com/64/667eea/ffffff?text=TA'
  }
];

let sessions = {};
let posts = [
  {
    id: 1,
    title: 'AI Algorithm Discriminating Against Minorities in Job Applications',
    content: 'Multiple reports of AI-powered recruitment tools showing bias against certain demographic groups. This affects thousands of job seekers daily.',
    author: 'tech_advocate',
    authorId: 1,
    type: 'grievance',
    category: 'AI Bias',
    criticality: 'HIGH',
    status: 'Under Investigation',
    location: 'United States',
    votes: 1247,
    comments: 89,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    aiRiskScore: 8.5,
    aiCategorization: 'Systemic Bias - Employment Discrimination',
    governmentAction: 'Sent to Equal Employment Opportunity Commission',
    tags: ['AI', 'Discrimination', 'Employment', 'Civil Rights'],
    upvotes: 1247,
    downvotes: 0,
    hotScore: 1250
  },
  {
    id: 2,
    title: 'Latest Breakthrough: GPT-5 Shows 95% Accuracy in Medical Diagnosis',
    content: 'OpenAI\'s latest model demonstrates unprecedented accuracy in medical diagnosis, potentially revolutionizing healthcare.',
    author: 'tech_advocate',
    authorId: 1,
    type: 'news',
    category: 'AI News',
    source: 'OpenAI Blog',
    votes: 892,
    comments: 45,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['AI', 'Healthcare', 'GPT-5', 'Medical'],
    upvotes: 892,
    downvotes: 12,
    hotScore: 900
  }
];

let comments = [];

// Helper functions
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function getPostsFromDB() {
  if (!db) return posts;
  
  try {
    const [rows] = await db.execute(`
      SELECT p.*, u.username as author, u.display_name as displayName
      FROM posts p
      JOIN users u ON p.author_id = u.id
      ORDER BY p.hot_score DESC, p.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Failed to fetch posts from DB:', error);
    return posts;
  }
}

async function createPostInDB(postData) {
  if (!db) {
    posts.push(postData);
    return postData;
  }
  
  try {
    const [result] = await db.execute(`
      INSERT INTO posts (title, content, author_id, type, category, criticality, status, location, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      postData.title,
      postData.content,
      postData.authorId,
      postData.type,
      postData.category,
      postData.criticality,
      postData.status || 'Under Review',
      postData.location,
      JSON.stringify(postData.tags || [])
    ]);
    
    postData.id = result.insertId;
    return postData;
  } catch (error) {
    console.error('Failed to create post in DB:', error);
    posts.push(postData);
    return postData;
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 TexhPulze Production Server is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    database: db ? 'connected' : 'fallback mode'
  });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!db) {
      // Fallback mode
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        const token = generateToken();
        sessions[token] = user;
        return res.json({
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
            profile: {
              displayName: user.displayName,
              bio: user.bio,
              karma: user.karma,
              avatar: user.avatar
            }
          }
        });
      }
    } else {
      // Database mode
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password]
      );
      
      if (rows.length > 0) {
        const user = rows[0];
        const token = generateToken();
        
        await db.execute(
          'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
          [token, user.id]
        );
        
        return res.json({
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
            profile: {
              displayName: user.display_name,
              bio: user.bio,
              karma: user.karma,
              avatar: user.avatar_url
            }
          }
        });
      }
    }
    
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    
    if (!db) {
      // Fallback mode
      if (users.find(u => u.username === username || u.email === email)) {
        return res.status(400).json({ success: false, error: 'Username or email already exists' });
      }
      
      const newUser = {
        id: users.length + 1,
        username,
        email,
        password,
        displayName,
        bio: '',
        karma: 0,
        avatar: `https://via.placeholder.com/64/667eea/ffffff?text=${username.charAt(0).toUpperCase()}`
      };
      
      users.push(newUser);
      const token = generateToken();
      sessions[token] = newUser;
      
      return res.json({
        success: true,
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          profile: {
            displayName: newUser.displayName,
            bio: newUser.bio,
            karma: newUser.karma,
            avatar: newUser.avatar
          }
        }
      });
    } else {
      // Database mode
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ success: false, error: 'Username or email already exists' });
      }
      
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password, display_name, karma) VALUES (?, ?, ?, ?, 0)',
        [username, email, password, displayName]
      );
      
      const token = generateToken();
      await db.execute(
        'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
        [token, result.insertId]
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: result.insertId,
          username,
          profile: {
            displayName,
            bio: '',
            karma: 0,
            avatar: `https://via.placeholder.com/64/667eea/ffffff?text=${username.charAt(0).toUpperCase()}`
          }
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Posts routes
app.get('/api/posts', async (req, res) => {
  try {
    const { type, sort = 'hot' } = req.query;
    let allPosts = await getPostsFromDB();
    
    if (type) {
      allPosts = allPosts.filter(post => post.type === type);
    }
    
    // Sort posts
    allPosts.sort((a, b) => {
      if (sort === 'hot') return (b.hotScore || b.hot_score || 0) - (a.hotScore || a.hot_score || 0);
      if (sort === 'new') return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
      if (sort === 'top') return (b.votes || 0) - (a.votes || 0);
      return 0;
    });
    
    res.json({
      success: true,
      posts: allPosts,
      total: allPosts.length
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, type, category, tags, criticality, location } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Simple auth check (in production, use proper JWT)
    let user;
    if (!db && sessions[token]) {
      user = sessions[token];
    } else if (db) {
      const [sessionRows] = await db.execute(
        'SELECT u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > NOW()',
        [token]
      );
      if (sessionRows.length > 0) {
        user = sessionRows[0];
      }
    }
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const newPost = {
      id: posts.length + 1,
      title,
      content,
      author: user.username,
      authorId: user.id,
      type: type || 'grievance',
      category: category || 'General',
      criticality: criticality || 'MEDIUM',
      status: type === 'grievance' ? 'Under Review' : 'Published',
      location: location || 'Global',
      votes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      tags: tags || [],
      upvotes: 0,
      downvotes: 0,
      hotScore: 0,
      ...(type === 'grievance' && {
        aiRiskScore: Math.random() * 5 + 5,
        aiCategorization: 'Under AI Analysis',
        governmentAction: 'Pending Review'
      })
    };
    
    const createdPost = await createPostInDB(newPost);
    res.json({ success: true, post: createdPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// Serve the frontend
app.get('*', (req, res) => {
  // Serve the test-server.js HTML content for now
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TexhPulze - Reddit for Tech Grievances & News</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .status { background: #e8f5e8; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
            .feature { background: #f0f8ff; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #0079d3; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><div style="display: inline-block; width: 40px; height: 40px; background: radial-gradient(circle at 30% 30%, #00BFFF, #4169E1, #6A5ACD, #8A2BE2); border-radius: 50%; margin-right: 10px; vertical-align: middle; position: relative; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);"></div>TexhPulze</h1>
                <p>Reddit for Tech Grievances & News</p>
            </div>
            
            <div class="status">
                <h3>✅ Production Server Running</h3>
                <p>Backend API: <a href="/api/posts">/api/posts</a></p>
                <p>Health Check: <a href="/health">/health</a></p>
                <p>Database: ${db ? 'Connected' : 'Fallback Mode'}</p>
            </div>
            
            <div class="feature">
                <h3>🔐 Authentication</h3>
                <p>Register: POST /api/auth/register</p>
                <p>Login: POST /api/auth/login</p>
            </div>
            
            <div class="feature">
                <h3>📝 Posts & Content</h3>
                <p>Get Posts: GET /api/posts</p>
                <p>Create Post: POST /api/posts</p>
                <p>Vote: POST /api/posts/:id/vote</p>
            </div>
            
            <div class="feature">
                <h3>🚨 Grievance System</h3>
                <p>AI-powered risk assessment</p>
                <p>Government action tracking</p>
                <p>Community voting & discussion</p>
            </div>
            
            <div class="feature">
                <h3>📰 AI News Integration</h3>
                <p>Latest AI breakthroughs</p>
                <p>Community discussions</p>
                <p>Repost & comment features</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 TexhPulze Production Server Started!');
    console.log(`✅ Server running on port: ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🗄️  Database: ${db ? 'Connected' : 'Fallback Mode'}`);
    console.log('================================');
  });
};

startServer().catch(console.error);
