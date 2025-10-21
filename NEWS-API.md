# TexhPulze - News API Documentation

## Overview

Complete REST API implementation for managing news articles with company relationships, validation, authentication, and comprehensive error handling.

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [API Endpoints](#2-api-endpoints)
3. [Authentication](#3-authentication)
4. [Request/Response Examples](#4-requestresponse-examples)
5. [Error Handling](#5-error-handling)
6. [Testing](#6-testing)

---

## 1. Database Schema

### Companies Table

Stores company information referenced by news articles.

```sql
CREATE TABLE public.companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT NOT NULL,
  website TEXT,
  description TEXT NOT NULL,
  founded_year INTEGER NOT NULL,
  headquarters TEXT NOT NULL,
  employee_count INTEGER,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Industries:**
- technology
- finance
- healthcare
- retail
- manufacturing
- energy
- transportation
- telecommunications
- education
- entertainment
- hospitality
- real-estate
- agriculture
- consulting
- other

### News Table

Stores news articles with optional company association.

```sql
CREATE TABLE public.news (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  ethics_impact INTEGER (1-10),
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Constraints:**
- `title`: 10-200 characters
- `content`: 100-10,000 characters
- `ethics_impact`: Optional integer 1-10
- `source_url`: Valid URL required
- `company_id`: Optional FK to companies table

---

## 2. API Endpoints

### GET /api/news

Fetch paginated list of news articles with optional filters.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 20 | Items per page (1-100) |
| `offset` | integer | No | 0 | Number of items to skip |
| `industry` | string | No | - | Filter by company industry |
| `impact` | integer | No | - | Min ethics impact (1-10) |
| `company_id` | UUID | No | - | Filter by company ID |
| `search` | string | No | - | Search in title/content |

**Response:**

```typescript
{
  success: true,
  data: Array<{
    id: string,
    title: string,
    content: string,
    company_id: string | null,
    ethics_impact: number | null,
    source_url: string,
    published_at: string,
    created_at: string,
    updated_at: string,
    companies: {
      id: string,
      name: string,
      slug: string,
      industry: string,
      logo_url: string | null
    } | null
  }>,
  pagination: {
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean,
    page: number,
    totalPages: number
  }
}
```

**Example Request:**

```bash
GET /api/news?limit=10&industry=technology&impact=7
```

---

### POST /api/news

Create a new news article. **Requires admin authentication.**

**Request Body:**

```typescript
{
  title: string,           // 10-200 characters
  content: string,         // 100-10,000 characters
  company_id?: string,     // UUID, optional
  ethics_impact?: number,  // 1-10, optional
  source_url: string,      // Valid URL, required
  published_at: string     // YYYY-MM-DD format
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    content: string,
    company_id: string | null,
    ethics_impact: number | null,
    source_url: string,
    published_at: string,
    created_at: string,
    updated_at: string,
    companies: CompanyData | null
  },
  message: "News article created successfully"
}
```

**Example Request:**

```bash
POST /api/news
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Company Achieves Major Sustainability Milestone",
  "content": "In a groundbreaking achievement...",
  "company_id": "123e4567-e89b-12d3-a456-426614174000",
  "ethics_impact": 8,
  "source_url": "https://example.com/article",
  "published_at": "2025-01-15"
}
```

---

### GET /api/news/[id]

Fetch a single news article by ID with company data.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | News article ID |

**Response:**

```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    content: string,
    company_id: string | null,
    ethics_impact: number | null,
    source_url: string,
    published_at: string,
    created_at: string,
    updated_at: string,
    companies: {
      id: string,
      name: string,
      slug: string,
      industry: string,
      website: string | null,
      description: string,
      founded_year: number,
      headquarters: string,
      employee_count: number | null,
      logo_url: string | null,
      created_at: string,
      updated_at: string
    } | null
  },
  message: "News article retrieved successfully"
}
```

**Example Request:**

```bash
GET /api/news/123e4567-e89b-12d3-a456-426614174000
```

---

## 3. Authentication

### Admin Access Required

The POST `/api/news` endpoint requires admin authentication:

1. **Authentication**: User must be signed in with valid Supabase session
2. **Authorization**: User's profile role must be `'admin'`

**Implementation:**

```typescript
import { requireAdmin } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  // Throws AuthenticationError if not signed in
  // Throws AuthorizationError if not admin
  const profile = await requireAdmin();

  // ... proceed with creating news
}
```

### Authentication Middleware

Located in `src/lib/auth/middleware.ts`:

**Available Functions:**

```typescript
// Require authentication (any user)
const user = await requireAuth();

// Require profile (with database data)
const profile = await requireProfile();

// Require admin role
const admin = await requireAdmin();

// Require specific role
const researcher = await requireRole('researcher');

// Require one of multiple roles
const profile = await requireAnyRole(['admin', 'policymaker']);

// Optional authentication
const user = await getOptionalAuth(); // null if not auth

// Check ownership
const profile = await requireOwnership(resourceUserId);
```

---

## 4. Request/Response Examples

### Example 1: List News with Filters

**Request:**
```bash
GET /api/news?limit=5&industry=technology&impact=7&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "TechCorp Launches AI Ethics Initiative",
      "content": "TechCorp has announced a new comprehensive AI ethics...",
      "company_id": "c1d2e3f4-g5h6-7890-ijkl-mn1234567890",
      "ethics_impact": 9,
      "source_url": "https://example.com/techcorp-ethics",
      "published_at": "2025-01-15T00:00:00Z",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "companies": {
        "id": "c1d2e3f4-g5h6-7890-ijkl-mn1234567890",
        "name": "TechCorp Inc.",
        "slug": "techcorp-inc",
        "industry": "technology",
        "logo_url": "https://example.com/logo.png"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 5,
    "offset": 0,
    "hasMore": true,
    "page": 1,
    "totalPages": 5
  }
}
```

### Example 2: Create News Article (Admin)

**Request:**
```bash
POST /api/news
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "GreenEnergy Achieves Carbon Neutrality",
  "content": "GreenEnergy Solutions has announced a major achievement in their sustainability journey, reaching 100% carbon neutral operations across all facilities. This milestone comes two years ahead of schedule and demonstrates the company's commitment to environmental responsibility. The achievement includes investments in renewable energy infrastructure, comprehensive recycling programs, and transitioning to electric vehicle fleets.",
  "company_id": "b2c3d4e5-f6g7-8901-hijk-lm2345678901",
  "ethics_impact": 9,
  "source_url": "https://greenenergy.example.com/carbon-neutral-2025",
  "published_at": "2025-01-20"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "d3e4f5g6-h7i8-9012-jklm-no3456789012",
    "title": "GreenEnergy Achieves Carbon Neutrality",
    "content": "GreenEnergy Solutions has announced...",
    "company_id": "b2c3d4e5-f6g7-8901-hijk-lm2345678901",
    "ethics_impact": 9,
    "source_url": "https://greenenergy.example.com/carbon-neutral-2025",
    "published_at": "2025-01-20T00:00:00Z",
    "created_at": "2025-01-20T14:22:35Z",
    "updated_at": "2025-01-20T14:22:35Z",
    "companies": {
      "id": "b2c3d4e5-f6g7-8901-hijk-lm2345678901",
      "name": "GreenEnergy Solutions",
      "slug": "greenenergy-solutions",
      "industry": "energy",
      "logo_url": null
    }
  },
  "message": "News article created successfully"
}
```

### Example 3: Get Single News Article

**Request:**
```bash
GET /api/news/d3e4f5g6-h7i8-9012-jklm-no3456789012
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "d3e4f5g6-h7i8-9012-jklm-no3456789012",
    "title": "GreenEnergy Achieves Carbon Neutrality",
    "content": "GreenEnergy Solutions has announced...",
    "company_id": "b2c3d4e5-f6g7-8901-hijk-lm2345678901",
    "ethics_impact": 9,
    "source_url": "https://greenenergy.example.com/carbon-neutral-2025",
    "published_at": "2025-01-20T00:00:00Z",
    "created_at": "2025-01-20T14:22:35Z",
    "updated_at": "2025-01-20T14:22:35Z",
    "companies": {
      "id": "b2c3d4e5-f6g7-8901-hijk-lm2345678901",
      "name": "GreenEnergy Solutions",
      "slug": "greenenergy-solutions",
      "industry": "energy",
      "website": "https://greenenergy.example.com",
      "description": "Renewable energy company focused on solar and wind power...",
      "founded_year": 2015,
      "headquarters": "Austin, TX",
      "employee_count": 250,
      "logo_url": null,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  },
  "message": "News article retrieved successfully"
}
```

---

## 5. Error Handling

### Validation Errors (400)

**Example Request:**
```bash
POST /api/news
{
  "title": "Short",  // Too short (min 10 chars)
  "content": "Also short"  // Too short (min 100 chars)
}
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "timestamp": "2025-01-20T15:30:00.000Z",
    "details": {
      "errors": {
        "title": ["Title must be at least 10 characters"],
        "content": ["Content must be at least 100 characters"],
        "source_url": ["Required"],
        "published_at": ["Required"]
      },
      "fields": ["title", "content", "source_url", "published_at"]
    }
  }
}
```

### Authentication Errors (401)

**Example:**
```bash
POST /api/news
# No authentication token
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHENTICATED",
    "statusCode": 401,
    "timestamp": "2025-01-20T15:30:00.000Z"
  }
}
```

### Authorization Errors (403)

**Example:**
```bash
POST /api/news
# Authenticated but not admin
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Admin access required",
    "code": "INSUFFICIENT_PERMISSIONS",
    "statusCode": 403,
    "timestamp": "2025-01-20T15:30:00.000Z",
    "details": {
      "requiredPermission": "admin"
    }
  }
}
```

### Not Found Errors (404)

**Example:**
```bash
GET /api/news/invalid-uuid-here
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "News article not found",
    "code": "RESOURCE_NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2025-01-20T15:30:00.000Z",
    "details": {
      "resourceType": "Article",
      "resourceId": "invalid-uuid-here"
    }
  }
}
```

---

## 6. Testing

### Setup

1. **Run SQL Schema:**
   ```bash
   # Copy NEWS-API-SCHEMA.sql contents
   # Paste in Supabase SQL Editor
   # Execute
   ```

2. **Verify Tables:**
   ```sql
   SELECT COUNT(*) FROM companies;
   SELECT COUNT(*) FROM news;
   ```

### Manual Testing with cURL

**List News:**
```bash
curl "http://localhost:3000/api/news?limit=5"
```

**Get Single News:**
```bash
curl "http://localhost:3000/api/news/YOUR-NEWS-ID"
```

**Create News (with auth):**
```bash
curl -X POST "http://localhost:3000/api/news" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-TOKEN" \
  -d '{
    "title": "Test News Article for API",
    "content": "This is a test news article with sufficient content to meet the minimum character requirement. It includes details about the news topic and provides enough information to be useful.",
    "ethics_impact": 7,
    "source_url": "https://example.com/test-article",
    "published_at": "2025-01-20"
  }'
```

### Testing Filters

**By Industry:**
```bash
curl "http://localhost:3000/api/news?industry=technology&limit=10"
```

**By Ethics Impact:**
```bash
curl "http://localhost:3000/api/news?impact=8&limit=10"
```

**Search:**
```bash
curl "http://localhost:3000/api/news?search=sustainability&limit=10"
```

**Combined Filters:**
```bash
curl "http://localhost:3000/api/news?industry=energy&impact=7&search=carbon&limit=5"
```

### Pagination Testing

**Page 1:**
```bash
curl "http://localhost:3000/api/news?limit=10&offset=0"
```

**Page 2:**
```bash
curl "http://localhost:3000/api/news?limit=10&offset=10"
```

---

## Implementation Checklist

- [x] Database schema (companies + news tables)
- [x] Row Level Security policies
- [x] Indexes for performance
- [x] Validation schemas with Zod
- [x] GET /api/news endpoint with filters
- [x] POST /api/news endpoint (admin only)
- [x] GET /api/news/[id] endpoint
- [x] Authentication middleware
- [x] Error handling utilities
- [x] TypeScript types
- [x] Sample data for testing
- [x] API documentation

---

## Summary

✅ **Complete News API** with pagination, filtering, and search
✅ **Admin-only creation** with authentication middleware
✅ **Company relationships** with full data joining
✅ **Comprehensive validation** using Zod schemas
✅ **Error handling** with custom error classes
✅ **Type safety** with TypeScript
✅ **RLS policies** for security
✅ **Sample data** for testing
✅ **Full documentation** with examples

**Next Steps:**
- Run SQL schema in Supabase
- Test endpoints with sample data
- Integrate with frontend
- Add UPDATE and DELETE endpoints (admin only)
- Implement full-text search
- Add analytics tracking

---

**Last Updated:** 2025-01-20
**Version:** 1.0.0
