import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { AppDataSource } from '../ormconfig';
import { cronService } from './services/cronService';
import { rateLimiter } from './middleware/rateLimiting';

// Import routes
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import storyRoutes from './routes/stories';
import userImpactRoutes from './routes/userImpact';
import adminRoutes from './routes/admin';
import graveyardRoutes from './routes/graveyard';
import eli5SuggestionsRoutes from './routes/eli5Suggestions';
import briefsRoutes from './routes/briefs';
import flagsRoutes from './routes/flags';
import legalRoutes from './routes/legal';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimiter.rateLimit.bind(rateLimiter));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TexhPulze 2.0 API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/users', userImpactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/graveyard', graveyardRoutes);
app.use('/api/eli5-suggestions', eli5SuggestionsRoutes);
app.use('/api/briefs', briefsRoutes);
app.use('/api/flags', flagsRoutes);
app.use('/api/legal', legalRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to TexhPulze 2.0 API',
    description: 'Building the World\'s First Courtroom for Technology',
    endpoints: {
      auth: '/api/auth',
      companies: '/api/companies',
      stories: '/api/stories',
      health: '/health',
      docs: '/api/docs' // Future API documentation
    },
    version: '2.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database connection...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');
    }

    // Run pending migrations in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Running migrations...');
      await AppDataSource.runMigrations();
      console.log('✅ Migrations completed');
    }

    // Initialize scheduled jobs
    cronService.initializeJobs();

    app.listen(PORT, () => {
      console.log(`🚀 TexhPulze 2.0 API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`⚰️ Graveyard endpoints: http://localhost:${PORT}/api/graveyard`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
  process.exit(0);
});

// Start the server
startServer();

export default app;
