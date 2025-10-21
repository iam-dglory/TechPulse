## User Dashboard API - Complete Implementation

REST API endpoint and middleware for user dashboard with rate limiting.

---

## API Endpoint

### GET /api/user/dashboard
Get aggregated user dashboard data (authenticated users only).

**Authentication:** Required

**Response:**
```typescript
{
  success: true,
  data: {
    profile: {
      id: string,
      email: string,
      username: string | null,
      full_name: string | null,
      avatar_url: string | null,
      role: 'citizen' | 'researcher' | 'policymaker' | 'government' | 'admin',
      reputation: number,
      created_at: string,
      updated_at: string
    },
    followedCompanies: [{
      id: string,
      name: string,
      slug: string,
      industry: string,
      logo_url: string | null,
      company_scores?: {
        overall_score: number,
        verification_tier: string
      }
    }],  // Limit 12, newest first
    recentVotes: [{
      id: string,
      user_id: string,
      company_id: string,
      vote_type: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation',
      score: number,
      comment: string | null,
      evidence_url: string | null,
      created_at: string,
      companies: {
        id: string,
        name: string,
        slug: string,
        logo_url: string | null
      }
    }],  // Limit 20, newest first
    stats: {
      totalVotes: number,
      totalComments: number,
      followedCompaniesCount: number,
      reputationLevel: 'Beginner' | 'Contributor' | 'Intermediate' | 'Advanced' | 'Expert'
    },
    notifications: [{
      id: string,
      user_id: string,
      type: 'vote' | 'promise' | 'company_update' | 'system',
      title: string,
      message: string,
      link: string | null,
      read: boolean,
      created_at: string
    }]  // Limit 10, unread only, newest first
  },
  message: "Dashboard data retrieved successfully"
}
```

**Reputation Levels:**
- **Beginner**: 0-99 points
- **Contributor**: 100-249 points
- **Intermediate**: 250-499 points
- **Advanced**: 500-999 points
- **Expert**: 1000+ points

**Reputation Calculation:**
- 1 point per vote
- 3 points per vote with comment (1 base + 2 bonus)
- 3 points per promise outcome vote

**Features:**
✅ User profile with reputation
✅ Followed companies (12 most recent)
✅ Recent votes (20 most recent) with company data
✅ Aggregated statistics
✅ Unread notifications (10 most recent)
✅ Auto-calculated reputation from activity
✅ Graceful error handling for failed queries
✅ Authentication required

---

## Middleware

### Rate Limiting (`src/middleware.ts`)

**Configuration:**
- **Rate Limit**: 60 requests per minute per IP
- **Window**: 60 seconds (rolling)
- **Scope**: All `/api/*` routes
- **Identifier**: IP address (from `request.ip`, `x-forwarded-for`, or `x-real-ip`)
- **Fallback**: 'anonymous' if no IP found

**Response Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2025-01-20T12:34:56.789Z
```

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "error": {
    "message": "Too many requests. Please try again later.",
    "code": "RATE_LIMIT_EXCEEDED",
    "statusCode": 429,
    "timestamp": "2025-01-20T12:34:56.789Z"
  }
}
```

**Additional Headers on 429:**
```
Retry-After: 60
```

**Implementation:**
- In-memory Map storage (NOTE: Use Redis in production)
- Automatic cleanup of expired entries every 60 seconds
- Per-IP tracking with rolling window

### URL Redirects

**Old URLs → New URLs:**
- `/techpulse/*` → `/texhpulze/*` (301 Permanent Redirect)
- `/techpulze/*` → `/texhpulze/*` (301 Permanent Redirect)

**Case-insensitive** matching for domain name corrections.

**Matcher Configuration:**
```typescript
matcher: [
  '/((?!_next/static|_next/image|favicon.ico).*)',
]
```
Applies to all routes except Next.js static assets.

---

## Database Schema

### user_follows Table
```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, company_id)
);
```

**Indexes:**
- `idx_user_follows_user_id` - User's followed companies
- `idx_user_follows_company_id` - Company followers
- `idx_user_follows_created` - Chronological ordering

**RLS Policies:**
- SELECT: Users can view own follows, everyone can view counts
- INSERT: Authenticated users (must be owner)
- DELETE: Authenticated users (own follows only)

### notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('vote', 'promise', 'company_update', 'system')),
  title TEXT CHECK (LENGTH >= 5, LENGTH <= 200),
  message TEXT CHECK (LENGTH >= 10, LENGTH <= 500),
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_notifications_user_id` - User notifications
- `idx_notifications_read` - Read status
- `idx_notifications_type` - Notification type
- `idx_notifications_created` - Chronological
- `idx_notifications_user_unread` - Composite for unread queries

**RLS Policies:**
- SELECT: Users can view own notifications
- INSERT: System can create (authenticated)
- UPDATE: Users can update own
- DELETE: Users can delete own

### profiles Table Updates
```sql
ALTER TABLE profiles
  ADD COLUMN username TEXT UNIQUE,
  ADD COLUMN reputation INTEGER DEFAULT 0;
```

**Auto-Reputation Calculation:**
- Triggers on `votes` and `promise_votes` tables
- Calls `calculate_user_reputation()` function
- Updates `profiles.reputation` automatically

---

## Testing

```bash
# Get dashboard data (requires auth)
curl "http://localhost:3000/api/user/dashboard" \
  -H "Authorization: Bearer TOKEN"

# Test rate limiting (send 61+ requests rapidly)
for i in {1..65}; do
  curl "http://localhost:3000/api/companies" -I
done
# Should see 429 after 60 requests

# Test URL redirect
curl -I "http://localhost:3000/techpulse/companies"
# Should redirect to /texhpulze/companies with 301

# Check rate limit headers
curl -I "http://localhost:3000/api/companies"
# Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
```

---

## Error Handling

### Dashboard API Errors
- **401 Unauthorized**: Not authenticated or session expired
- **500 Internal Server Error**: Database or server errors

**Graceful Degradation:**
- If followed companies fail to load: returns empty array
- If votes fail to load: returns empty array
- If notifications fail to load: returns empty array
- Counts default to 0 on error
- Warnings logged to console, but API still returns success

### Rate Limiting Errors
- **429 Too Many Requests**: Rate limit exceeded
  - Includes `Retry-After: 60` header
  - Includes rate limit headers

---

## Production Notes

### Rate Limiting
**⚠️ IMPORTANT**: The in-memory Map implementation is suitable for development and single-server deployments only.

**For Production:**
1. Replace in-memory Map with Redis
2. Use distributed rate limiting across multiple servers
3. Consider per-user rate limits in addition to per-IP
4. Implement different limits for different API tiers

**Example Redis Implementation:**
```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function isRateLimited(identifier: string): Promise<boolean> {
  const key = `rate-limit:${identifier}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, 60); // 60 seconds
  }

  return current > 60;
}
```

### Reputation System
- Reputation updates automatically via database triggers
- No manual recalculation needed
- Consider caching reputation levels in application layer

### Notifications
- Implement background job to create notifications
- Consider real-time updates via WebSockets or SSE
- Archive old notifications periodically

---

## Use Cases

1. **User Profile Overview**: Display user stats, reputation, and activity
2. **Company Tracking**: Show followed companies with scores
3. **Activity Feed**: Recent votes and engagements
4. **Notification Center**: Alert users to important updates
5. **Gamification**: Reputation levels encourage participation
6. **Rate Limiting**: Protect API from abuse and ensure fair usage
7. **SEO**: URL redirects maintain search rankings during domain changes

**Last Updated:** 2025-01-20
