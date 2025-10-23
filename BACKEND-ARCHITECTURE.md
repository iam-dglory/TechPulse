# TexhPulze Backend Architecture

**Date:** October 23, 2025
**Status:** Production-Ready Architecture
**Database:** MongoDB Atlas
**Deployment:** Render / Railway / Vercel

---

## 🏗️ Architecture Overview

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # MongoDB connection
│   │   ├── cors.js       # CORS configuration
│   │   └── environment.js # Environment variables
│   │
│   ├── models/           # MongoDB Schemas
│   │   ├── User.js       # User model with auth
│   │   ├── Company.js    # Company profiles
│   │   ├── Review.js     # User reviews
│   │   ├── News.js       # Tech news articles
│   │   └── Badge.js      # Achievement badges
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT authentication
│   │   ├── validation.js # Request validation
│   │   ├── errorHandler.js # Global error handler
│   │   └── rateLimiter.js # Rate limiting
│   │
│   ├── routes/           # API routes
│   │   ├── companies.js  # Company endpoints
│   │   ├── auth.js       # Authentication
│   │   ├── reviews.js    # Review system
│   │   ├── news.js       # News feed
│   │   ├── dashboard.js  # User dashboard
│   │   └── search.js     # Universal search
│   │
│   ├── controllers/      # Business logic
│   │   ├── companyController.js
│   │   ├── authController.js
│   │   ├── reviewController.js
│   │   ├── newsController.js
│   │   └── dashboardController.js
│   │
│   └── utils/            # Helper functions
│       ├── jwt.js        # JWT utilities
│       ├── email.js      # Email service
│       ├── helpers.js    # General helpers
│       └── validators.js # Custom validators
│
├── server.js             # Express app entry point
├── .env.example          # Environment template
└── package.json          # Dependencies

```

---

## 📊 Database Schema (MongoDB)

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  username: String (unique),
  fullName: String,
  avatar: String (URL),
  role: ['user', 'admin', 'moderator'],
  emailVerified: Boolean,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  oauthProvider: ['google', 'github', 'linkedin'],
  oauthId: String,
  followers: [ObjectId ref User],
  following: [ObjectId ref Company],
  badges: [ObjectId ref Badge],
  reputation: Number (default: 0),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Company Model
```javascript
{
  name: String (required, unique),
  slug: String (unique, indexed),
  description: String,
  website: String (URL),
  logo: String (URL),
  category: String (enum: ['AI Research', 'Social Media', 'E-commerce'...]),
  founded: Date,
  headquarters: String,
  size: String (enum: ['1-10', '11-50', '51-200'...]),

  // Scoring
  accountabilityScore: Number (0-100, default: 50),
  transparencyScore: Number (0-100),
  ethicsScore: Number (0-100),
  safetyScore: Number (0-100),
  innovationScore: Number (0-100),

  // Statistics
  totalReviews: Number (default: 0),
  positiveReviews: Number (default: 0),
  negativeReviews: Number (default: 0),
  averageRating: Number (1-5),

  // History tracking
  scoreHistory: [{
    date: Date,
    score: Number,
    reviewsCount: Number
  }],

  // Social
  followers: [ObjectId ref User],
  verifiedBadge: Boolean (default: false),

  // Meta
  tags: [String],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model
```javascript
{
  company: ObjectId (ref Company, required),
  user: ObjectId (ref User, required),
  rating: Number (1-5, required),
  title: String,
  content: String (required),
  category: String (enum: ['transparency', 'ethics', 'safety', 'innovation']),

  // Moderation
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  moderationNotes: String,
  moderatedBy: ObjectId (ref User),
  moderatedAt: Date,

  // Engagement
  helpfulCount: Number (default: 0),
  helpfulVotes: [ObjectId ref User],
  reportCount: Number (default: 0),

  // Verification
  verified: Boolean (default: false),
  verificationProof: String,

  // Meta
  isEdited: Boolean (default: false),
  editedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### News Model
```javascript
{
  title: String (required),
  summary: String,
  content: Text,
  url: String (external URL),
  source: String (required),
  author: String,
  category: String (enum: ['AI', 'Policy', 'Ethics', 'Innovation'...]),
  tags: [String],
  imageUrl: String,

  // Relevance
  companies: [ObjectId ref Company],
  relevanceScore: Number (0-100),

  // Engagement
  views: Number (default: 0),
  shares: Number (default: 0),

  // Publishing
  publishedAt: Date (required),
  featured: Boolean (default: false),
  isActive: Boolean (default: true),

  createdAt: Date,
  updatedAt: Date
}
```

### Badge Model
```javascript
{
  name: String (required, unique),
  description: String,
  icon: String (URL or emoji),
  category: String (enum: ['reviewer', 'contributor', 'leader'...]),
  criteria: {
    type: String (enum: ['review_count', 'helpful_votes', 'reputation'...]),
    threshold: Number
  },
  rarity: String (enum: ['common', 'rare', 'epic', 'legendary']),
  createdAt: Date
}
```

---

## 🛡️ API Endpoints

### Base URL: `/api/v1`

### 1. Companies API

#### `GET /companies`
**Description:** List all companies with pagination and filters
**Query Params:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (search by name or description)
- `category` (filter by category)
- `sort` (default: 'score', options: 'score', 'reviews', 'name')

**Response:**
```json
{
  "success": true,
  "data": {
    "companies": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### `GET /companies/:id`
**Description:** Get full company details
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "OpenAI",
    "description": "...",
    "accountabilityScore": 85,
    "scoreBreakdown": {
      "transparency": 80,
      "ethics": 85,
      "safety": 90,
      "innovation": 85
    },
    "totalReviews": 150,
    "averageRating": 4.2
  }
}
```

#### `GET /companies/:id/score`
**Description:** Get detailed scoring information

#### `GET /companies/:id/history`
**Description:** Get historical score data
**Query Params:** `period` (7d, 30d, 90d, 1y)

#### `GET /companies/:id/reviews`
**Description:** Get paginated reviews for a company
**Query Params:** `page`, `limit`, `sort` (recent, helpful, rating)

---

### 2. Reviews API

#### `POST /reviews`
**Auth:** Required
**Description:** Submit a new review
**Body:**
```json
{
  "companyId": "...",
  "rating": 4,
  "title": "Great transparency",
  "content": "...",
  "category": "transparency"
}
```

#### `GET /reviews/:id`
**Description:** Get single review details

#### `PUT /reviews/:id`
**Auth:** Required (owner only)
**Description:** Edit your review

#### `DELETE /reviews/:id`
**Auth:** Required (owner or admin)
**Description:** Delete review

#### `POST /reviews/:id/helpful`
**Auth:** Required
**Description:** Mark review as helpful

---

### 3. Authentication API

#### `POST /auth/signup`
**Description:** Register new user
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "fullName": "John Doe"
}
```

#### `POST /auth/login`
**Description:** Login with email/password
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### `POST /auth/refresh`
**Description:** Refresh access token
**Body:** `{ "refreshToken": "..." }`

#### `POST /auth/logout`
**Auth:** Required
**Description:** Logout user (invalidate tokens)

#### `POST /auth/forgot-password`
**Description:** Request password reset email

#### `POST /auth/reset-password`
**Description:** Reset password with token

#### `GET /auth/verify-email/:token`
**Description:** Verify email address

#### `POST /auth/oauth/google`
**Description:** OAuth login with Google

#### `POST /auth/oauth/github`
**Description:** OAuth login with GitHub

---

### 4. News API

#### `GET /news`
**Description:** Get curated tech news
**Query Params:**
- `page`, `limit`
- `category`
- `company` (filter by related company)
- `featured` (boolean)

---

### 5. Search API

#### `GET /search`
**Description:** Universal search across companies and news
**Query Params:**
- `q` (search query, required)
- `type` (all, companies, news)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "AI",
    "companies": [...],
    "news": [...],
    "total": 45
  }
}
```

---

### 6. Dashboard API

#### `GET /dashboard/stats`
**Auth:** Required
**Description:** Get user dashboard statistics
**Response:**
```json
{
  "success": true,
  "data": {
    "reviewsCount": 12,
    "followingCount": 5,
    "reputation": 145,
    "badges": [...],
    "recentActivity": [...]
  }
}
```

#### `POST /dashboard/follow/:companyId`
**Auth:** Required
**Description:** Follow/unfollow a company

#### `GET /dashboard/following`
**Auth:** Required
**Description:** Get list of followed companies

---

### 7. Health Check

#### `GET /health`
**Description:** API health check
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-23T...",
  "version": "1.0.0",
  "database": "connected",
  "uptime": 123456
}
```

---

## 🔐 Security Features

### 1. JWT Authentication
- Access tokens (24h expiry)
- Refresh tokens (7d expiry)
- Token rotation on refresh
- Blacklist for logout

### 2. Rate Limiting
- 100 requests per 15 minutes per IP
- Stricter limits for auth endpoints (5 login attempts/15min)
- Redis-based distributed rate limiting

### 3. Input Validation
- Joi schemas for all endpoints
- SQL/NoSQL injection prevention
- XSS protection
- CSRF tokens for state-changing operations

### 4. Password Security
- BCrypt hashing (12 rounds)
- Password strength requirements
- Prevent password reuse
- Account lockout after 5 failed attempts

### 5. CORS
- Whitelist for allowed origins
- Credentials support
- Proper preflight handling

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.10.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "rate-limit-redis": "^3.0.2",
    "redis": "^4.6.8",
    "morgan": "^1.10.0",
    "winston": "^3.10.0",
    "nodemailer": "^6.9.4",
    "@sendgrid/mail": "^7.7.0",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-github2": "^0.1.12",
    "axios": "^1.5.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "supertest": "^6.3.3"
  }
}
```

---

## 🚀 Deployment

### MongoDB Atlas Setup
1. Create account: https://mongodb.com/cloud/atlas
2. Create free cluster (M0 tier)
3. Add database user
4. Whitelist IP (0.0.0.0/0 for production)
5. Get connection string: `mongodb+srv://...`

### Environment Variables (Production)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<generate-secure-random-string>
FRONTEND_URL=https://www.texhpulze.com
NODE_ENV=production
```

### Render Deployment
1. Connect GitHub repository
2. Set environment variables
3. Build command: `npm install`
4. Start command: `node server.js`

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "details": "Technical details (dev only)"
  }
}
```

---

## 🧪 Testing

### Run Tests
```bash
npm test                # All tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage report
```

### Test Categories
- Unit tests: Models, utilities
- Integration tests: API endpoints
- E2E tests: Complete user flows

---

**Next Steps:**
1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Install dependencies: `npm install`
4. Run development: `npm run dev`
5. Deploy to Render/Railway

**Questions?** Review this architecture document and let me know what you'd like me to implement first!
