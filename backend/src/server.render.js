const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { pool, testConnection, initializeDatabase, updateHotScore } = require('./config/database.render');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// CORS configuration for Render deployment
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://texhpulze.onrender.com',
    'https://texhpulze-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory data storage for fallback
let users = [];
let posts = [];
let comments = [];
let sessions = [];
let nextId = 1;

// Helper functions for in-memory data
const generateId = () => nextId++;
const findUserByEmail = (email) => users.find(u => u.email === email);
const findUserById = (id) => users.find(u => u.id === id);
const findPostById = (id) => posts.find(p => p.id === parseInt(id));
const findSessionByToken = (token) => sessions.find(s => s.token === token);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Check database first
  if (pool) {
    pool.query('SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()', [token])
      .then(result => {
        if (result.rows.length > 0) {
          req.user = result.rows[0];
          next();
        } else {
          res.status(401).json({ error: 'Invalid or expired token' });
        }
      })
      .catch(() => {
        // Fallback to in-memory
        const session = findSessionByToken(token);
        if (session && session.expires_at > Date.now()) {
          req.user = findUserById(session.user_id);
          next();
        } else {
          res.status(401).json({ error: 'Invalid or expired token' });
        }
      });
  } else {
    // Fallback to in-memory
    const session = findSessionByToken(token);
    if (session && session.expires_at > Date.now()) {
      req.user = findUserById(session.user_id);
      next();
    } else {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
};

// Root endpoint with logo
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TexhPulze - Technology Grievance Platform</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container {
                text-align: center;
                max-width: 600px;
                padding: 40px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            .logo {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: radial-gradient(circle at 30% 30%, #00BFFF, #4169E1, #6A5ACD, #8A2BE2);
                border-radius: 50%;
                position: relative;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            }
            .logo::before {
                content: '';
                position: absolute;
                top: 20%;
                left: 25%;
                width: 16px;
                height: 16px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
            }
            .logo::after {
                content: '';
                position: absolute;
                top: 30%;
                left: 60%;
                width: 8px;
                height: 8px;
                background: rgba(135, 206, 235, 0.8);
                border-radius: 50%;
            }
            h1 { font-size: 2.5rem; margin-bottom: 10px; }
            .subtitle { font-size: 1.2rem; opacity: 0.9; margin-bottom: 30px; }
            .status { 
                background: rgba(0, 255, 0, 0.2); 
                padding: 15px; 
                border-radius: 10px; 
                margin: 20px 0;
                border: 1px solid rgba(0, 255, 0, 0.3);
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .feature {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .api-link {
                display: inline-block;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 25px;
                margin: 10px;
                transition: all 0.3s ease;
            }
            .api-link:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo"></div>
            <h1>TexhPulze</h1>
            <p class="subtitle">World's First Technology Grievance & Discussion Platform</p>
            
            <div class="status">
                <h3>🚀 Render Deployment Active</h3>
                <p>Server is running successfully on Render!</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <h4>📢 Report Grievances</h4>
                    <p>Report technology issues with AI-powered risk assessment</p>
                </div>
                <div class="feature">
                    <h4>🤖 AI News</h4>
                    <p>Share and discuss latest AI breakthroughs</p>
                </div>
                <div class="feature">
                    <h4>🗳️ Community Voting</h4>
                    <p>Vote on issues to determine criticality</p>
                </div>
                <div class="feature">
                    <h4>🏛️ Government Integration</h4>
                    <p>Track government responses to technology issues</p>
                </div>
            </div>
            
            <div>
                <a href="/health" class="api-link">Health Check</a>
                <a href="/api/posts" class="api-link">API Posts</a>
                <a href="/api/auth/register" class="api-link">Register</a>
            </div>
        </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TexhPulze API',
    version: '1.0.0',
    database: pool ? 'PostgreSQL Connected' : 'Fallback Mode',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes
app.get('/api/auth/register', (req, res) => {
  res.json({
    message: "Registration endpoint",
    method: "Use POST to register a new user",
    example: {
      method: "POST",
      url: "/api/auth/register",
      body: {
        email: "user@example.com",
        password: "password123",
        username: "username",
        fullName: "Full Name"
      }
    }
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    if (pool) {
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user in database
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, username, full_name) VALUES ($1, $2, $3, $4) RETURNING id, email, username, full_name',
        [email, password, username, fullName]
      );

      const user = result.rows[0];
      const token = `token_${Date.now()}_${user.id}`;
      
      // Create session
      await pool.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, new Date(Date.now() + 24 * 60 * 60 * 1000)]
      );

      res.json({ user, token });
    } else {
      // Fallback to in-memory
      if (findUserByEmail(email)) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const user = {
        id: generateId(),
        email,
        password, // In production, hash this
        username,
        full_name: fullName,
        created_at: new Date()
      };

      users.push(user);

      const token = `token_${Date.now()}_${user.id}`;
      const session = {
        id: generateId(),
        user_id: user.id,
        token,
        expires_at: Date.now() + 24 * 60 * 60 * 1000
      };

      sessions.push(session);

      res.json({ user, token });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (pool) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      // In production, compare hashed passwords
      if (user.password_hash !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = `token_${Date.now()}_${user.id}`;
      await pool.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, new Date(Date.now() + 24 * 60 * 60 * 1000)]
      );

      res.json({ user, token });
    } else {
      // Fallback to in-memory
      const user = findUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = `token_${Date.now()}_${user.id}`;
      const session = {
        id: generateId(),
        user_id: user.id,
        token,
        expires_at: Date.now() + 24 * 60 * 60 * 1000
      };

      sessions.push(session);

      res.json({ user, token });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Posts routes
app.get('/api/posts', async (req, res) => {
  try {
    const { sort = 'hot', limit = 20 } = req.query;

    if (pool) {
      let query = 'SELECT * FROM posts';
      let orderBy = 'ORDER BY created_at DESC';
      
      if (sort === 'hot') {
        orderBy = 'ORDER BY hot_score DESC';
      } else if (sort === 'top') {
        orderBy = 'ORDER BY (votes_up - votes_down) DESC';
      }

      const result = await pool.query(`${query} ${orderBy} LIMIT $1`, [parseInt(limit)]);
      
      // If no posts in database, return sample data
      if (result.rows.length === 0) {
        const samplePosts = [
          {
            id: 1,
            title: "AI Bias in Hiring Systems",
            content: "Multiple companies report AI systems showing bias against certain demographics in hiring processes.",
            type: "grievance",
            category: "AI Ethics",
            criticality: "high",
            ai_risk_score: 8,
            government_action: "pending",
            location: "Global",
            tags: ["AI", "Bias", "Hiring", "Discrimination"],
            votes_up: 15,
            votes_down: 2,
            hot_score: 13.5,
            created_at: new Date()
          },
          {
            id: 2,
            title: "ChatGPT-5 Released with Advanced Reasoning",
            content: "OpenAI announces ChatGPT-5 with significantly improved reasoning capabilities and multimodal understanding.",
            type: "ai_news",
            category: "AI Development",
            criticality: "medium",
            ai_risk_score: 5,
            government_action: null,
            location: "Global",
            tags: ["ChatGPT", "OpenAI", "AI", "Reasoning"],
            votes_up: 23,
            votes_down: 1,
            hot_score: 22.8,
            created_at: new Date()
          }
        ];
        return res.json(samplePosts);
      }
      
      res.json(result.rows);
    } else {
      // Fallback to in-memory
      let sortedPosts = [...posts];
      
      if (sort === 'hot') {
        sortedPosts.sort((a, b) => b.hot_score - a.hot_score);
      } else if (sort === 'top') {
        sortedPosts.sort((a, b) => (b.votes_up - b.votes_down) - (a.votes_up - a.votes_down));
      } else {
        sortedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      res.json(sortedPosts.slice(0, parseInt(limit)));
    }
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
});

// Get single post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (pool) {
      const result = await pool.query(
        'SELECT * FROM posts WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(result.rows[0]);
    } else {
      // Fallback to in-memory
      const post = findPostById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(post);
    }
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, type, category, criticality, ai_risk_score, government_action, location, tags } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ error: 'Title, content, and type are required' });
    }

    if (pool) {
      const result = await pool.query(
        `INSERT INTO posts (title, content, type, category, criticality, ai_risk_score, government_action, location, tags, user_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [title, content, type, category, criticality, ai_risk_score, government_action, location, tags, req.user.user_id]
      );

      res.json({ success: true, post: result.rows[0] });
    } else {
      // Fallback to in-memory
      const post = {
        id: generateId(),
        title,
        content,
        type,
        category,
        criticality: criticality || 'medium',
        ai_risk_score,
        government_action,
        location,
        tags,
        user_id: req.user.id,
        votes_up: 0,
        votes_down: 0,
        hot_score: 0,
        created_at: new Date()
      };

      posts.push(post);
      res.json({ success: true, post: post });
    }
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.post('/api/posts/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type, vote } = req.body; // Accept both 'vote_type' and 'vote'
    
    // Support both field names for compatibility
    const voteType = vote_type || vote;

    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type. Must be "up" or "down"' });
    }

    if (pool) {
      // Check if user already voted
      const existingVote = await pool.query(
        'SELECT * FROM votes WHERE user_id = $1 AND post_id = $2',
        [req.user.user_id, id]
      );

      if (existingVote.rows.length > 0) {
        return res.status(400).json({ error: 'Already voted on this post' });
      }

      // Insert vote
      await pool.query(
        'INSERT INTO votes (user_id, post_id, vote_type) VALUES ($1, $2, $3)',
        [req.user.user_id, id, voteType]
      );

      // Update post vote counts
      const voteChange = voteType === 'up' ? 1 : -1;
      await pool.query(
        'UPDATE posts SET votes_up = votes_up + $1, votes_down = votes_down + $2 WHERE id = $3',
        [voteType === 'up' ? 1 : 0, voteType === 'down' ? 1 : 0, id]
      );

      // Update hot score
      await updateHotScore(id);

      // Get updated post with vote counts
      const updatedPost = await pool.query('SELECT votes_up, votes_down FROM posts WHERE id = $1', [id]);
      
      res.json({ 
        success: true, 
        votes_up: updatedPost.rows[0].votes_up,
        votes_down: updatedPost.rows[0].votes_down
      });
    } else {
      // Fallback to in-memory
      const post = findPostById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (voteType === 'up') {
        post.votes_up++;
      } else {
        post.votes_down++;
      }

      // Update hot score
      const timeDiff = (Date.now() - new Date(post.created_at)) / (1000 * 60 * 60); // hours
      post.hot_score = (post.votes_up - post.votes_down) / Math.max(timeDiff, 1);

      res.json({ 
        success: true, 
        votes_up: post.votes_up,
        votes_down: post.votes_down
      });
    }
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting TexhPulze Render Server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL ? 'Present' : 'Not found'}`);
    
    // Test database connection
    let dbConnected = false;
    try {
      dbConnected = await testConnection();
      
      if (dbConnected) {
        console.log('✅ PostgreSQL Database Connected');
        await initializeDatabase();
        console.log('✅ Database tables initialized successfully');
      }
    } catch (dbError) {
      console.error('❌ Database initialization failed:', dbError.message);
      dbConnected = false;
    }
    
    if (!dbConnected) {
      console.log('🔄 Running in fallback mode with in-memory data');
      console.log('📝 Note: Data will not persist between restarts');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 TexhPulze Render Server Started!');
      console.log(`✅ Server running on port: ${PORT}`);
      console.log(`🌐 Frontend: https://texhpulze.onrender.com`);
      console.log(`📊 Health check: https://texhpulze.onrender.com/health`);
      console.log(`🗄️  Database: ${dbConnected ? 'PostgreSQL Connected' : 'Fallback Mode'}`);
      console.log(`🔒 SSL: ${process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'}`);
      console.log('================================');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
};

startServer();
