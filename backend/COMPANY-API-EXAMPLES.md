# TexhPulze 2.0 Company API Examples

This document provides curl examples for testing the company profile endpoints.

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

## 📡 Company API Endpoints

Base URL: `http://localhost:5000/api/companies`

---

## 🏢 Company Endpoints

### 1. Get All Companies (with filtering)

**GET** `/api/companies`

```bash
# Basic request
curl -X GET "http://localhost:5000/api/companies"

# With filtering
curl -X GET "http://localhost:5000/api/companies?sector=AI&ethicsScoreMin=70&verified=true&page=1&limit=10"

# Search companies
curl -X GET "http://localhost:5000/api/companies?search=OpenAI&fundingStage=private"
```

**Query Parameters:**

- `sector` - Filter by sector tag
- `ethicsScoreMin` - Minimum ethics score (0-100)
- `fundingStage` - Filter by funding stage
- `search` - Search in company names
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `verified` - Filter by verification status (true/false)

**Response:**

```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [
      {
        "id": "uuid-here",
        "name": "OpenAI",
        "slug": "openai",
        "logoUrl": "https://openai.com/logo.png",
        "website": "https://openai.com",
        "sectorTags": ["AI", "Machine Learning"],
        "fundingStage": "private",
        "investors": ["Microsoft", "Sequoia Capital"],
        "hqLocation": "San Francisco, CA",
        "ethicsStatementUrl": "https://openai.com/ethics",
        "privacyPolicyUrl": "https://openai.com/privacy",
        "credibilityScore": 85.5,
        "ethicsScore": 78.2,
        "hypeScore": 92.1,
        "verified": true,
        "verifiedAt": "2025-01-15T10:30:00.000Z",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 2. Get Company by ID or Slug

**GET** `/api/companies/:id`

```bash
# Get by UUID
curl -X GET "http://localhost:5000/api/companies/123e4567-e89b-12d3-a456-426614174000"

# Get by slug
curl -X GET "http://localhost:5000/api/companies/openai"
```

**Response:**

```json
{
  "success": true,
  "message": "Company retrieved successfully",
  "data": {
    "company": {
      "id": "uuid-here",
      "name": "OpenAI",
      "slug": "openai",
      "logoUrl": "https://openai.com/logo.png",
      "website": "https://openai.com",
      "sectorTags": ["AI", "Machine Learning"],
      "fundingStage": "private",
      "investors": ["Microsoft", "Sequoia Capital"],
      "hqLocation": "San Francisco, CA",
      "ethicsStatementUrl": "https://openai.com/ethics",
      "privacyPolicyUrl": "https://openai.com/privacy",
      "credibilityScore": 85.5,
      "ethicsScore": 78.2,
      "hypeScore": 92.1,
      "verified": true,
      "verifiedAt": "2025-01-15T10:30:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "products": [...],
      "stories": [...]
    }
  }
}
```

### 3. Claim Company Profile

**POST** `/api/companies/claim`

**Required Fields:**

- `name` - Company name (2-255 characters)
- `slug` - URL-friendly identifier (lowercase, numbers, hyphens only)
- `sectorTags` - Array of sector tags (minimum 1)
- `fundingStage` - One of: pre-seed, seed, series-a, series-b, series-c, series-d, series-e, ipo, acquired, private

**Optional Fields:**

- `website` - Company website URL
- `logoUrl` - Company logo URL
- `investors` - Array of investor names
- `hqLocation` - Headquarters location
- `ethicsStatementUrl` - Link to ethics statement
- `privacyPolicyUrl` - Link to privacy policy
- `registrationDocument` - Base64 encoded registration document

```bash
# Get JWT token first (from login)
TOKEN="your-jwt-token-from-login"

curl -X POST "http://localhost:5000/api/companies/claim" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechEthics Corp",
    "slug": "techethics-corp",
    "website": "https://techethics.com",
    "logoUrl": "https://techethics.com/logo.png",
    "sectorTags": ["AI Ethics", "Consulting", "Technology"],
    "fundingStage": "seed",
    "investors": ["Ethics Ventures", "Tech Angels"],
    "hqLocation": "San Francisco, CA",
    "ethicsStatementUrl": "https://techethics.com/ethics",
    "privacyPolicyUrl": "https://techethics.com/privacy"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Company claim submitted successfully. Awaiting verification.",
  "data": {
    "company": {
      "id": "uuid-here",
      "name": "TechEthics Corp",
      "slug": "techethics-corp",
      "website": "https://techethics.com",
      "logoUrl": "https://techethics.com/logo.png",
      "sectorTags": ["AI Ethics", "Consulting", "Technology"],
      "fundingStage": "seed",
      "investors": ["Ethics Ventures", "Tech Angels"],
      "hqLocation": "San Francisco, CA",
      "ethicsStatementUrl": "https://techethics.com/ethics",
      "privacyPolicyUrl": "https://techethics.com/privacy",
      "credibilityScore": 0,
      "ethicsScore": 0,
      "hypeScore": 0,
      "verified": false,
      "verifiedAt": null,
      "createdAt": "2025-01-15T11:00:00.000Z",
      "updatedAt": "2025-01-15T11:00:00.000Z"
    }
  }
}
```

### 4. Verify Company (Admin Only)

**POST** `/api/companies/:id/verify`

```bash
# Admin user required (email must contain 'admin')
ADMIN_TOKEN="admin-jwt-token"

curl -X POST "http://localhost:5000/api/companies/uuid-here/verify" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "success": true,
  "message": "Company verified successfully",
  "data": {
    "company": {
      "id": "uuid-here",
      "name": "TechEthics Corp",
      "verified": true,
      "verifiedAt": "2025-01-15T11:05:00.000Z",
      "updatedAt": "2025-01-15T11:05:00.000Z"
    }
  }
}
```

### 5. Update Company Profile

**PATCH** `/api/companies/:id`

```bash
curl -X PATCH "http://localhost:5000/api/companies/uuid-here" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechEthics Corporation",
    "website": "https://techethics.com",
    "sectorTags": ["AI Ethics", "Consulting", "Technology", "Research"],
    "hqLocation": "San Francisco, CA, USA"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "company": {
      "id": "uuid-here",
      "name": "TechEthics Corporation",
      "website": "https://techethics.com",
      "sectorTags": ["AI Ethics", "Consulting", "Technology", "Research"],
      "hqLocation": "San Francisco, CA, USA",
      "updatedAt": "2025-01-15T11:10:00.000Z"
    }
  }
}
```

### 6. Get Company Products

**GET** `/api/companies/:id/products`

```bash
curl -X GET "http://localhost:5000/api/companies/openai/products"
```

**Response:**

```json
{
  "success": true,
  "message": "Company products retrieved successfully",
  "data": {
    "products": [
      {
        "id": "product-uuid",
        "companyId": "company-uuid",
        "name": "ChatGPT",
        "description": "AI-powered conversational assistant",
        "priceTiers": [...],
        "features": {...},
        "targetUsers": ["Developers", "Content creators"],
        "demoUrl": "https://chat.openai.com",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 7. Get Company Stories

**GET** `/api/companies/:id/stories`

```bash
curl -X GET "http://localhost:5000/api/companies/openai/stories?page=1&limit=5"
```

**Response:**

```json
{
  "success": true,
  "message": "Company stories retrieved successfully",
  "data": {
    "stories": [
      {
        "id": "story-uuid",
        "title": "OpenAI Releases GPT-4",
        "content": "OpenAI has released GPT-4...",
        "sourceUrl": "https://openai.com/gpt-4",
        "companyId": "company-uuid",
        "sectorTag": "AI",
        "hypeScore": 95.0,
        "ethicsScore": 75.0,
        "impactTags": ["breakthrough", "positive"],
        "publishedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 12,
      "pages": 3
    }
  }
}
```

### 8. Delete Company (Admin Only)

**DELETE** `/api/companies/:id`

```bash
curl -X DELETE "http://localhost:5000/api/companies/uuid-here" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

### 9. Company Search Suggestions

**GET** `/api/companies/search/suggestions`

```bash
curl -X GET "http://localhost:5000/api/companies/search/suggestions?q=open"
```

**Response:**

```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [
      {
        "id": "uuid-here",
        "name": "OpenAI",
        "slug": "openai"
      }
    ],
    "pagination": {...}
  }
}
```

### 10. Company Statistics

**GET** `/api/companies/stats/overview`

```bash
curl -X GET "http://localhost:5000/api/companies/stats/overview"
```

**Response:**

```json
{
  "success": true,
  "message": "Company statistics retrieved successfully",
  "data": {
    "totalCompanies": 150,
    "verifiedCompanies": 120,
    "unverifiedCompanies": 30,
    "avgEthicsScore": 72.5,
    "avgCredibilityScore": 78.3,
    "verificationRate": 80.0
  }
}
```

---

## 🔐 Authentication & Permissions

### Required Authentication

Most endpoints require JWT authentication. Get a token by logging in:

```bash
# Login to get token
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Admin Access

For admin-only endpoints, create a user with 'admin' in the email or username:

```bash
# Register admin user
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@texhpulze.com",
    "username": "admin",
    "password": "adminpass123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Rate Limiting

- Company claims are limited to 3 per day per user
- Other endpoints have standard rate limiting

---

## 🛡️ Validation Rules

### Company Claim Validation

- **name**: Required, 2-255 characters
- **slug**: Required, 2-255 characters, lowercase letters/numbers/hyphens only
- **website**: Optional, must be valid URL
- **sectorTags**: Required, array with at least 1 non-empty string
- **fundingStage**: Required, must be valid enum value
- **investors**: Optional, must be array
- **hqLocation**: Optional, max 255 characters
- **ethicsStatementUrl**: Optional, must be valid URL
- **privacyPolicyUrl**: Optional, must be valid URL
- **logoUrl**: Optional, must be valid URL

### Query Parameter Validation

- **page**: Optional, positive integer
- **limit**: Optional, 1-100
- **ethicsScoreMin**: Optional, 0-100
- **fundingStage**: Optional, valid enum value
- **verified**: Optional, true/false
- **sector**: Optional, 1-100 characters
- **search**: Optional, 1-255 characters

---

## 🚀 Complete Test Workflow

```bash
# 1. Register and login
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@texhpulze.com",
    "username": "testuser",
    "password": "testpass123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Get token from login response
TOKEN="your-jwt-token"

# 2. Claim a company
curl -X POST "http://localhost:5000/api/companies/claim" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "slug": "test-company",
    "sectorTags": ["Technology"],
    "fundingStage": "seed"
  }'

# 3. Get all companies
curl -X GET "http://localhost:5000/api/companies"

# 4. Get company by slug
curl -X GET "http://localhost:5000/api/companies/test-company"

# 5. Update company (if you're owner/admin)
curl -X PATCH "http://localhost:5000/api/companies/company-uuid" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test Company"}'

# 6. Get company statistics
curl -X GET "http://localhost:5000/api/companies/stats/overview"
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
- `201`: Created (company claim)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (company not found)
- `409`: Conflict (company already exists)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error
