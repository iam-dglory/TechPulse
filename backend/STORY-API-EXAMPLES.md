# TexhPulze 2.0 Story API Examples

This document provides curl examples for testing the story (news updates) endpoints.

## 🚀 Quick Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Run migrations:**

```bash
npm run typeorm:migrate
```

3. **Start server:**

```bash
npm run dev:ts
```

## 📡 Story API Endpoints

Base URL: `http://localhost:5000/api/stories`

---

## 📰 Story Endpoints

### 1. Get All Stories (with filtering and sorting)

**GET** `/api/stories`

```bash
# Basic request
curl -X GET "http://localhost:5000/api/stories"

# With filtering and sorting
curl -X GET "http://localhost:5000/api/stories?sectorTag=AI&sort=hot&page=1&limit=10"

# Search stories
curl -X GET "http://localhost:5000/api/stories?search=OpenAI&companyId=uuid-here"

# Date range filtering
curl -X GET "http://localhost:5000/api/stories?dateFrom=2025-01-01&dateTo=2025-01-15"
```

**Query Parameters:**

- `sectorTag` - Filter by sector tag
- `companyId` - Filter by company UUID
- `impactTag` - Filter by impact tag
- `sort` - Sort order: `hot`, `new`, `top`, `trending`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search in story titles and content
- `dateFrom` - Start date (ISO 8601)
- `dateTo` - End date (ISO 8601)

**Response:**

```json
{
  "success": true,
  "message": "Stories retrieved successfully",
  "data": {
    "stories": [
      {
        "id": "uuid-here",
        "title": "OpenAI Faces Criticism Over AI Training Data Transparency",
        "content": "Recent reports reveal concerns about OpenAI's data collection practices...",
        "sourceUrl": "https://example.com/openai-transparency-issues",
        "companyId": "company-uuid",
        "sectorTag": "AI Ethics",
        "hypeScore": 75.2,
        "ethicsScore": 45.8,
        "realityCheck": "Multiple sources confirm these concerns...",
        "impactTags": ["privacy", "transparency", "ethics", "breaking"],
        "createdBy": "tech-ethics-reporter",
        "publishedAt": "2025-01-15T10:00:00.000Z",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z",
        "company": {...},
        "votes": [...],
        "sentimentScore": 0.65,
        "voteCount": 15,
        "helpfulVotes": 12,
        "harmfulVotes": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    },
    "filters": {
      "sectorTag": "AI",
      "sort": "hot",
      "search": null
    }
  }
}
```

### 2. Get Story by ID

**GET** `/api/stories/:id`

```bash
curl -X GET "http://localhost:5000/api/stories/123e4567-e89b-12d3-a456-426614174000"
```

**Response:**

```json
{
  "success": true,
  "message": "Story retrieved successfully",
  "data": {
    "story": {
      "id": "uuid-here",
      "title": "OpenAI Faces Criticism Over AI Training Data Transparency",
      "content": "Recent reports reveal concerns about OpenAI's data collection practices...",
      "sourceUrl": "https://example.com/openai-transparency-issues",
      "companyId": "company-uuid",
      "sectorTag": "AI Ethics",
      "hypeScore": 75.2,
      "ethicsScore": 45.8,
      "realityCheck": "Multiple sources confirm these concerns...",
      "impactTags": ["privacy", "transparency", "ethics", "breaking"],
      "createdBy": "tech-ethics-reporter",
      "publishedAt": "2025-01-15T10:00:00.000Z",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "company": {...},
      "votes": [...],
      "sentimentScore": 0.65,
      "voteCount": 15,
      "helpfulVotes": 12,
      "harmfulVotes": 3
    }
  }
}
```

### 3. Create New Story

**POST** `/api/stories`

**Required Fields:**

- `title` - Story title (10-500 characters)
- `content` - Story content (50-10000 characters)
- `sectorTag` - Sector tag (1-100 characters)
- `impactTags` - Array of impact tags (minimum 1, max 50 characters each)

**Optional Fields:**

- `sourceUrl` - Source URL
- `companyId` - Company UUID
- `publishedAt` - Publication date (ISO 8601)

```bash
# Get JWT token first (from login)
TOKEN="your-jwt-token-from-login"

curl -X POST "http://localhost:5000/api/stories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New AI Model Raises Privacy Concerns",
    "content": "A new artificial intelligence model has been released that processes user data in ways that raise significant privacy concerns among experts. The model, developed by a major tech company, claims to improve user experience but critics argue it violates user privacy rights.",
    "sourceUrl": "https://example.com/ai-privacy-concerns",
    "companyId": "company-uuid-here",
    "sectorTag": "AI Ethics",
    "impactTags": ["privacy", "ethics", "concern", "breaking"]
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Story created successfully",
  "data": {
    "story": {
      "id": "new-story-uuid",
      "title": "New AI Model Raises Privacy Concerns",
      "content": "A new artificial intelligence model has been released...",
      "sourceUrl": "https://example.com/ai-privacy-concerns",
      "companyId": "company-uuid-here",
      "sectorTag": "AI Ethics",
      "hypeScore": 68.5,
      "ethicsScore": 32.1,
      "realityCheck": "High impact story - verify claims with multiple sources.",
      "impactTags": ["privacy", "ethics", "concern", "breaking"],
      "createdBy": "username",
      "publishedAt": "2025-01-15T11:00:00.000Z",
      "createdAt": "2025-01-15T11:00:00.000Z",
      "updatedAt": "2025-01-15T11:00:00.000Z",
      "company": {...}
    }
  }
}
```

### 4. Update Story

**PATCH** `/api/stories/:id`

```bash
curl -X PATCH "http://localhost:5000/api/stories/story-uuid-here" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: New AI Model Raises Privacy Concerns",
    "impactTags": ["privacy", "ethics", "concern", "breaking", "updated"],
    "realityCheck": "Updated with additional verification from multiple sources."
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Story updated successfully",
  "data": {
    "story": {
      "id": "story-uuid-here",
      "title": "Updated: New AI Model Raises Privacy Concerns",
      "impactTags": ["privacy", "ethics", "concern", "breaking", "updated"],
      "realityCheck": "Updated with additional verification from multiple sources.",
      "hypeScore": 72.1,
      "ethicsScore": 35.8,
      "updatedAt": "2025-01-15T11:05:00.000Z"
    }
  }
}
```

### 5. Get Story Discussions/Votes

**GET** `/api/stories/:id/discussions`

```bash
curl -X GET "http://localhost:5000/api/stories/story-uuid-here/discussions?page=1&limit=10"
```

**Response:**

```json
{
  "success": true,
  "message": "Story discussions retrieved successfully",
  "data": {
    "discussions": [
      {
        "id": "vote-uuid",
        "storyId": "story-uuid",
        "userId": "user-uuid",
        "industry": "Technology",
        "voteValue": "helpful",
        "comment": "This story highlights important privacy concerns that need attention.",
        "createdAt": "2025-01-15T11:10:00.000Z"
      }
    ],
    "sentimentBreakdown": {
      "helpful": 12,
      "harmful": 3,
      "neutral": 2
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 17,
      "pages": 2
    }
  }
}
```

### 6. Add Discussion/Vote

**POST** `/api/stories/:id/discussions`

**Required Fields:**

- `industry` - Voter's industry (1-100 characters)
- `voteValue` - Vote value: `helpful`, `harmful`, or `neutral`

**Optional Fields:**

- `comment` - Comment (max 1000 characters)

```bash
curl -X POST "http://localhost:5000/api/stories/story-uuid-here/discussions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Technology",
    "voteValue": "helpful",
    "comment": "This story brings attention to important privacy issues that need to be addressed by the tech industry."
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Discussion added successfully",
  "data": {
    "vote": {
      "id": "vote-uuid",
      "storyId": "story-uuid",
      "userId": "user-uuid",
      "industry": "Technology",
      "voteValue": "helpful",
      "comment": "This story brings attention to important privacy issues...",
      "createdAt": "2025-01-15T11:15:00.000Z"
    }
  }
}
```

### 7. Delete Story

**DELETE** `/api/stories/:id`

```bash
curl -X DELETE "http://localhost:5000/api/stories/story-uuid-here" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Story deleted successfully"
}
```

### 8. Get Trending Stories

**GET** `/api/stories/trending/now`

```bash
curl -X GET "http://localhost:5000/api/stories/trending/now"
```

**Response:**

```json
{
  "success": true,
  "message": "Stories retrieved successfully",
  "data": {
    "stories": [...],
    "pagination": {...}
  }
}
```

### 9. Get Story Search Suggestions

**GET** `/api/stories/search/suggestions`

```bash
curl -X GET "http://localhost:5000/api/stories/search/suggestions?q=AI"
```

**Response:**

```json
{
  "success": true,
  "message": "Stories retrieved successfully",
  "data": {
    "stories": [
      {
        "id": "uuid",
        "title": "AI Ethics in Focus",
        "sectorTag": "AI"
      }
    ],
    "pagination": {...}
  }
}
```

### 10. Get Story Statistics

**GET** `/api/stories/stats/overview`

```bash
curl -X GET "http://localhost:5000/api/stories/stats/overview"
```

**Response:**

```json
{
  "success": true,
  "message": "Story statistics retrieved successfully",
  "data": {
    "totalStories": 150,
    "publishedStories": 120,
    "avgHypeScore": 65.2,
    "avgEthicsScore": 58.7,
    "storiesLast24h": 15,
    "publicationRate": 80.0
  }
}
```

### 11. Get Sector Tags List

**GET** `/api/stories/sectors/list`

```bash
curl -X GET "http://localhost:5000/api/stories/sectors/list"
```

**Response:**

```json
{
  "success": true,
  "message": "Sector tags retrieved successfully",
  "data": {
    "sectors": ["AI", "AI Ethics", "Autonomous Vehicles", "Cybersecurity"],
    "count": 4
  }
}
```

### 12. Get Impact Tags List

**GET** `/api/stories/impact-tags/list`

```bash
curl -X GET "http://localhost:5000/api/stories/impact-tags/list"
```

**Response:**

```json
{
  "success": true,
  "message": "Impact tags retrieved successfully",
  "data": {
    "impactTags": ["breaking", "concern", "ethics", "positive", "privacy"],
    "count": 5
  }
}
```

### 13. Get Personalized Feed

**GET** `/api/stories/feed/personalized`

```bash
curl -X GET "http://localhost:5000/api/stories/feed/personalized" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Stories retrieved successfully",
  "data": {
    "stories": [...],
    "pagination": {...}
  }
}
```

---

## 🤖 AI Scoring System

The story API includes an intelligent scoring system that automatically calculates:

### Hype Score (0-100)

- **Positive keywords**: breakthrough, revolutionary, game-changing, innovative
- **Negative keywords**: failed, failure, problem, issue, concern
- **Impact tags**: High impact tags increase hype score
- **Company credibility**: Influenced by company's credibility score

### Ethics Score (0-100)

- **Ethics keywords**: privacy, security, transparency, accountability, fairness
- **Negative ethics keywords**: bias, discriminatory, unfair, unethical, harmful
- **Company ethics**: Influenced by company's ethics score

### Reality Check

- Automatically generated for high-impact stories
- Warns about low-credibility companies
- Suggests verification with multiple sources

---

## 🔐 Authentication & Permissions

### Required Authentication

Most endpoints require JWT authentication:

```bash
# Login to get token
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Permissions

- **Create Story**: Any authenticated user
- **Edit Story**: Creator or admin only
- **Delete Story**: Creator or admin only
- **Vote/Discuss**: Any authenticated user (one vote per story per user)

---

## 🛡️ Validation Rules

### Story Creation Validation

- **title**: Required, 10-500 characters
- **content**: Required, 50-10000 characters
- **sourceUrl**: Optional, must be valid URL
- **companyId**: Optional, must be valid UUID
- **sectorTag**: Required, 1-100 characters
- **impactTags**: Required, array with at least 1 tag, max 50 characters each
- **publishedAt**: Optional, must be valid ISO 8601 date

### Discussion Validation

- **industry**: Required, 1-100 characters
- **voteValue**: Required, must be one of: helpful, harmful, neutral
- **comment**: Optional, max 1000 characters

---

## 🚀 Complete Test Workflow

```bash
# 1. Register and login
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reporter@texhpulze.com",
    "username": "reporter",
    "password": "reporter123",
    "firstName": "Tech",
    "lastName": "Reporter"
  }'

# Get token from login response
TOKEN="your-jwt-token"

# 2. Create a story
curl -X POST "http://localhost:5000/api/stories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Company Implements New Privacy Measures",
    "content": "A major technology company has announced new privacy protection measures that will give users more control over their data. The changes include enhanced data encryption, user consent mechanisms, and transparent data usage policies.",
    "sectorTag": "Privacy",
    "impactTags": ["positive", "privacy", "transparency"]
  }'

# 3. Get all stories
curl -X GET "http://localhost:5000/api/stories"

# 4. Get stories by sector
curl -X GET "http://localhost:5000/api/stories?sectorTag=Privacy"

# 5. Get trending stories
curl -X GET "http://localhost:5000/api/stories/trending/now"

# 6. Add a vote/discussion
curl -X POST "http://localhost:5000/api/stories/story-uuid/discussions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Technology",
    "voteValue": "helpful",
    "comment": "Great to see companies taking privacy seriously!"
  }'

# 7. Get story discussions
curl -X GET "http://localhost:5000/api/stories/story-uuid/discussions"

# 8. Get story statistics
curl -X GET "http://localhost:5000/api/stories/stats/overview"
```

---

## 🐛 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // For validation errors
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created (story creation, discussion)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (story not found)
- `409`: Conflict (already voted)
- `500`: Internal Server Error


