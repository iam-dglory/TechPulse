const express = require('express');
const cors = require('cors');
const { testConnection, initializeDatabase } = require('./config/database');
const cronService = require('./services/cronService');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configuration for Replit and Expo apps
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:19006', // Expo web
    'http://localhost:8081',  // Expo Metro
    'exp://192.168.*.*:*',    // Expo development
    /^https:\/\/.*\.replit\.dev$/, // Replit domains
    /^https:\/\/.*\.repl\.co$/,    // Replit domains
    process.env.REPLIT_URL,   // Current Replit URL
    process.env.REPL_ID ? `https://${process.env.REPL_ID}.${process.env.REPL_OWNER}.repl.co` : null
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    replit: {
      replId: process.env.REPL_ID || null,
      replOwner: process.env.REPL_OWNER || null,
      replSlug: process.env.REPL_SLUG || null
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/favorites', favoriteRoutes);

// Test routes (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testRoutes);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Start cron jobs
    cronService.start();

    // Start listening
    app.listen(PORT, () => {
      console.log(`✅ TechPulse backend running on PORT: ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
      
      // Replit-specific information
      if (process.env.REPL_ID) {
        console.log(`🔗 Replit URL: https://${process.env.REPL_ID}.${process.env.REPL_OWNER}.repl.co`);
        console.log(`📱 Mobile app can connect to: https://${process.env.REPL_ID}.${process.env.REPL_OWNER}.repl.co/api`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  cronService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  cronService.stop();
  process.exit(0);
});

startServer();
