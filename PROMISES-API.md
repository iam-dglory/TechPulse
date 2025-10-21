## Promises API - Complete Implementation

REST API for company promise tracking with outcome voting and consensus-based status updates.

### API Endpoints

#### GET /api/promises
Get promises for company with optional status filtering.

**Query Parameters:**
- `company_id` - Company UUID (required)
- `status` - Filter by status: pending/in-progress/kept/broken/delayed (optional)

**Response:**
```typescript
{
  success: true,
  data: [{
    id: string,
    company_id: string,
    promise_text: string,
    category: 'product' | 'ethics' | 'sustainability' | 'privacy' | 'security',
    promised_date: string,
    deadline_date: string,
    source_url: string,
    impact_level: 1-5,
    status: 'pending' | 'in-progress' | 'kept' | 'broken' | 'delayed',
    created_at: string,
    promise_votes: [{ id, verdict, comment, created_at }],
    vote_counts: {
      kept: number,
      broken: number,
      partial: number,
      total: number
    }
  }],
  message: "Promises retrieved successfully"
}
```

**Features:**
- Chronological ordering (newest first)
- Status filtering
- Vote data with counts included
- Promise vote aggregation

#### POST /api/promises
Create new promise (authenticated users).

**Authentication:** Required

**Request:**
```json
{
  "company_id": "uuid",
  "promise_text": "Text of promise (20-500 chars)",
  "category": "product|ethics|sustainability|privacy|security",
  "promised_date": "2025-01-01",
  "deadline_date": "2025-12-31",
  "source_url": "https://example.com/announcement",
  "impact_level": 1-5,
  "status": "pending"
}
```

**Validation:**
- `deadline_date` must be >= `promised_date` (enforced at API and DB level)
- `promise_text` length: 20-500 characters
- `impact_level`: 1 (low) to 5 (critical)
- `source_url`: Valid URL required

**Response:**
```typescript
{
  success: true,
  data: { ...created promise },
  message: "Promise created successfully"
}
```

#### POST /api/promises/[id]/vote
Vote on promise outcome (authenticated users).

**Authentication:** Required

**Request:**
```json
{
  "verdict": "kept|broken|partial",
  "comment": "Optional explanation (max 500 chars)"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    promise_id: string,
    user_id: string,
    verdict: 'kept' | 'broken' | 'partial',
    comment: string | null,
    created_at: string,
    consensus_reached: boolean,
    new_status?: string  // Only if consensus reached
  },
  message: "Vote created successfully" | "Vote updated successfully"
}
```

**Logic:**
1. Check if user already voted on this promise
2. If exists: UPDATE with new verdict and comment
3. If not: INSERT new vote
4. Fetch all votes for promise
5. Check for consensus:
   - Requires: ≥100 total votes
   - Threshold: ≥70% agreement on verdict
6. If consensus reached:
   - kept votes majority → status = 'kept'
   - broken votes majority → status = 'broken'
   - partial votes majority → status = 'delayed'
7. Auto-update promise status if consensus reached

### Database Schema

#### promise_votes Table
```sql
CREATE TABLE promise_votes (
  id UUID PRIMARY KEY,
  promise_id UUID REFERENCES promises(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  verdict TEXT CHECK (verdict IN ('kept', 'broken', 'partial')),
  comment TEXT CHECK (LENGTH(comment) <= 500),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, promise_id)
);
```

**Unique Constraint:** Prevents duplicate votes per user/promise.

**Indexes:**
- `idx_promise_votes_promise_id` - Fast promise vote lookups
- `idx_promise_votes_user_id` - User vote history
- `idx_promise_votes_verdict` - Verdict filtering
- `idx_promise_votes_created` - Chronological ordering

**RLS Policies:**
- SELECT: Public (everyone can view)
- INSERT: Authenticated (must be vote owner)
- UPDATE: Authenticated (own votes only)
- DELETE: Authenticated (own votes only)

### Features

✅ Promise creation with authentication
✅ Company-specific promise filtering
✅ Status filtering (pending/kept/broken/etc)
✅ Vote outcome tracking (kept/broken/partial)
✅ Duplicate vote detection with auto-update
✅ Vote aggregation and counting
✅ Consensus detection (100+ votes, 70%+ agreement)
✅ Auto-update promise status on consensus
✅ Date validation (deadline >= promised)
✅ Source URL requirement for accountability
✅ Impact level tracking (1-5 scale)
✅ Full TypeScript type safety
✅ Comprehensive error handling
✅ Comment support on votes

### Consensus Algorithm

**Requirements:**
- Minimum 100 votes required
- 70% threshold for consensus

**Status Mapping:**
- Majority "kept" → Status: `kept`
- Majority "broken" → Status: `broken`
- Majority "partial" → Status: `delayed`

**Example:**
- Total votes: 150
- Kept: 110 (73.3%)
- Broken: 30 (20%)
- Partial: 10 (6.7%)
- Result: Consensus reached → Status updated to `kept`

### Testing

```bash
# Get promises for company
curl "http://localhost:3000/api/promises?company_id=uuid"

# Get only broken promises
curl "http://localhost:3000/api/promises?company_id=uuid&status=broken"

# Create promise (requires auth)
curl -X POST "http://localhost:3000/api/promises" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "company_id": "uuid",
    "promise_text": "We will achieve carbon neutrality by end of 2025",
    "category": "sustainability",
    "promised_date": "2024-01-01",
    "deadline_date": "2025-12-31",
    "source_url": "https://company.com/announcement",
    "impact_level": 5,
    "status": "pending"
  }'

# Vote on promise (requires auth)
curl -X POST "http://localhost:3000/api/promises/PROMISE_ID/vote" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "verdict": "kept",
    "comment": "Company met deadline ahead of schedule"
  }'
```

### Error Handling

- **400**: Validation errors (invalid dates, missing fields, deadline before promised_date)
- **401**: Unauthenticated (POST endpoints only)
- **404**: Promise not found (vote endpoint)
- **500**: Database errors

### Use Cases

1. **Promise Tracking**: Users track company commitments with deadlines
2. **Accountability**: Source URLs provide proof of promises
3. **Community Verification**: Users vote on whether promises were kept
4. **Auto-Status Updates**: Consensus voting automatically updates promise status
5. **Transparency**: Public visibility of all promises and votes

**Last Updated:** 2025-01-20
