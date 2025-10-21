## Voting API - Complete Implementation

REST API for company voting with authentication, duplicate prevention, and auto-score calculation.

### API Endpoints

#### POST /api/votes
Create or update vote (authenticated users). Auto-detects duplicates and updates existing votes.

**Authentication:** Required

**Request:**
```json
{
  "company_id": "uuid",
  "vote_type": "ethics|credibility|delivery|security|innovation",
  "score": 1-10,
  "comment": "Optional feedback (max 500 chars)",
  "evidence_url": "https://example.com/proof"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    user_id: string,
    company_id: string,
    vote_type: string,
    score: number,
    comment: string | null,
    evidence_url: string | null,
    created_at: string,
    updated_at: string
  },
  message: "Vote created successfully" | "Vote updated successfully"
}
```

**Logic:**
1. Check if user already voted on this dimension for this company
2. If exists: UPDATE with new score, comment, evidence_url
3. If not: INSERT new vote
4. Call `calculate_company_scores()` to recalculate company scores
5. Gracefully handle score calculation failures (vote still succeeds)

#### GET /api/votes
Get votes for company with optional user/type filtering.

**Query Parameters:**
- `company_id` - Company UUID (required)
- `user_id` - Filter by user UUID (optional)
- `vote_type` - Filter by type (optional)

**Response:**
```typescript
{
  success: true,
  data: [{
    ...vote,
    profiles: {
      id, full_name, username, avatar_url
    }
  }],
  message: "Votes retrieved successfully"
}
```

### Features

✅ Authentication required for voting
✅ Duplicate vote detection per user/company/dimension
✅ Auto-update existing votes vs create new
✅ Auto-recalculate company scores via database trigger
✅ Manual score recalculation fallback via RPC
✅ User profile joins for vote display
✅ Vote type filtering
✅ User-specific vote filtering
✅ Chronological ordering (newest first)
✅ Evidence URL support
✅ Comment support (max 500 chars)
✅ Full validation with Zod
✅ TypeScript type safety
✅ Graceful error handling

### Database Integration

**Automatic Score Calculation:**
- Database trigger `recalculate_scores_on_vote` fires on INSERT/UPDATE/DELETE
- Calls `calculate_company_scores(company_id)` function
- Averages all votes per dimension, updates company_scores table
- Overall score = average of 5 dimension scores

**Unique Constraint:**
```sql
UNIQUE(user_id, company_id, vote_type)
```
Prevents duplicate votes per user/company/dimension at database level.

### Testing

```bash
# Create/update vote (requires auth token)
curl -X POST "http://localhost:3000/api/votes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "company_id": "uuid",
    "vote_type": "ethics",
    "score": 8,
    "comment": "Great ethical practices",
    "evidence_url": "https://example.com/proof"
  }'

# Get all votes for company
curl "http://localhost:3000/api/votes?company_id=uuid"

# Get specific user's votes for company
curl "http://localhost:3000/api/votes?company_id=uuid&user_id=uuid"

# Get all ethics votes for company
curl "http://localhost:3000/api/votes?company_id=uuid&vote_type=ethics"
```

### Error Handling

- **400**: Validation errors (invalid vote_type, score out of range, invalid UUIDs)
- **401**: Unauthenticated (POST only)
- **404**: Company not found (foreign key constraint)
- **500**: Database errors

**Last Updated:** 2025-01-20
