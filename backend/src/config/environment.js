require('dotenv').config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  mongoUri: process.env.MONGODB_URI,
  redisUrl: process.env.REDIS_URL,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Email
  email: {
    service: process.env.EMAIL_SERVICE || 'sendgrid',
    from: process.env.EMAIL_FROM || 'noreply@texhpulze.com',
    fromName: process.env.EMAIL_FROM_NAME || 'TexhPulze',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
  },

  // OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    },
  },

  // News APIs
  news: {
    newsApiKey: process.env.NEWS_API_KEY,
    guardianApiKey: process.env.GUARDIAN_API_KEY,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@texhpulze.com',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@texhpulze.com',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // Feature Flags
  features: {
    emailVerification: process.env.FEATURE_EMAIL_VERIFICATION !== 'false',
    oauth: process.env.FEATURE_OAUTH !== 'false',
    reviewModeration: process.env.FEATURE_REVIEW_MODERATION !== 'false',
  },
};

// Validate critical configuration
const validateConfig = () => {
  const required = ['mongoUri', 'jwt.secret'];
  const missing = [];

  required.forEach((key) => {
    const keys = key.split('.');
    let value = config;
    keys.forEach((k) => {
      value = value?.[k];
    });
    if (!value) missing.push(key);
  });

  if (missing.length > 0) {
    console.error(`❌ Missing required configuration: ${missing.join(', ')}`);
    if (config.env === 'production') {
      process.exit(1);
    }
  }
};

validateConfig();

module.exports = config;
