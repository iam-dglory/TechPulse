## Companies API - Complete Implementation

Comprehensive REST API for company management with search, filtering, scores, promises, and voting system.

### API Endpoints

#### GET /api/companies
Search and filter companies with pagination.

**Query Parameters:**
- `query` - Search text (name/description)
- `industry` - Filter by industry enum
- `score_min` - Min overall score (0-10)
- `score_max` - Max overall score (0-10)
- `verification_tier` - unverified/basic/verified/premium
- `sort` - score/trending/recent/name (default: score)
- `limit` - Items per page (1-100, default: 20)
- `offset` - Skip items (default: 0)

**Response:**
```typescript
{
  success: true,
  data: [{
    ...company,
    company_scores: {
      overall_score, ethics_score, credibility_score,
      delivery_score, security_score, innovation_score,
      growth_rate, verification_tier
    }
  }],
  pagination: { total, limit, offset, hasMore, page, totalPages }
}
```

#### POST /api/companies
Create company (authenticated users).

**Request:**
```json
{
  "name": "Company Name",
  "slug": "company-name",
  "industry": "technology",
  "description": "Company description...",
  "founded_year": 2020,
  "headquarters": "City, State",
  "employee_count": 100
}
```

#### GET /api/companies/[slug]
Get company with scores, promises (10), and votes (20).

**Response:**
```typescript
{
  success: true,
  data: {
    ...company,
    company_scores: {...},
    promises: [{...}],
    votes: [{ ..., profiles: { full_name, avatar_url } }]
  }
}
```

### Database Schema

**company_scores:**
- Scores for 5 categories (0-10 scale)
- Verification tier, growth rate
- Auto-updated from votes

**promises:**
- Promise tracking with deadlines
- Categories, impact levels, status
- Source URLs required

**votes:**
- User votes on 5 categories
- 1-10 scores with optional comments
- Unique per user/company/type

### Features

✅ Full-text search (name + description)
✅ Industry filtering
✅ Score range filtering
✅ Verification tier filtering
✅ Multiple sort options
✅ Pagination with metadata
✅ Auto-calculated scores from votes
✅ Slug uniqueness validation
✅ Default scores on creation
✅ Related data joins
✅ RLS policies
✅ TypeScript types

### Testing

```bash
# Search companies
curl "http://localhost:3000/api/companies?query=tech&industry=technology&sort=score&limit=10"

# Get company
curl "http://localhost:3000/api/companies/techcorp-inc"

# Create company
curl -X POST "http://localhost:3000/api/companies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Test Co","slug":"test-co","industry":"technology",...}'
```

**Last Updated:** 2025-01-20
