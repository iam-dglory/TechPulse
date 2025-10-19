# TechPulze Scoring System Documentation

## Overview

The TechPulze scoring system is a comprehensive, community-driven approach to evaluating tech companies across multiple dimensions. It combines community votes, expert reviews, and promise tracking to calculate accurate, trustworthy scores.

## Score Dimensions

Companies are scored across **5 key dimensions** (0-10 scale):

### 1. **Ethics Score** (30% weight in overall)
Evaluates:
- Data privacy practices
- AI transparency and responsibility
- Labor practices and worker treatment
- Environmental commitments
- Social impact

### 2. **Credibility Score** (25% weight)
Evaluates:
- Public trust and reputation
- Leadership transparency
- Communication honesty
- Media relations
- Community perception

### 3. **Delivery Score** (20% weight)
Evaluates:
- Promise fulfillment rate
- Product delivery timeliness
- Feature completeness
- Update consistency
- Roadmap adherence

### 4. **Security Score** (15% weight)
Evaluates:
- Data protection measures
- Breach history and response
- Security certifications
- Bug bounty programs
- Vulnerability disclosure

### 5. **Innovation Score** (10% weight)
Evaluates:
- R&D investments
- Patent portfolio
- Product uniqueness
- Market disruption
- Technology adoption

### **Overall Score**
Weighted average of all five dimensions:
```
Overall = (Ethics × 0.30) + (Credibility × 0.25) + (Delivery × 0.20) + (Security × 0.15) + (Innovation × 0.10)
```

## Voting System

### Community Votes

**Who can vote:**
- Any authenticated user
- One vote per user per dimension per company
- Users can update their votes anytime

**Vote weight calculation:**
```sql
Base weight: 1.0
+0.1 if reputation >= 100
+0.2 if reputation >= 500  (total: 1.3)
+0.5 if reputation >= 1000 (total: 1.5)
×2.0 if user is verified expert (base: 2.0)
```

**Voting features:**
- Score: 1-10 for each dimension
- Optional comment explaining the vote
- Evidence URLs to support the vote
- Automatic weight assignment based on user reputation

### Expert Reviews

**Requirements:**
- User must have `is_expert = true` flag
- Reviews must be verified by moderators
- Higher weight (2.0) than regular votes

**Expert review includes:**
- Detailed review text
- Individual scores for each dimension
- Citations and references
- Expertise areas declaration

**Verification process:**
1. Expert submits review
2. Moderator reviews submission
3. If approved, `verified = true` and weight = 2.0
4. Expert reviews contribute to score calculation

## Promise Tracking

### Promise System

Companies can be held accountable for their public promises:

**Promise attributes:**
- `promise_text`: What was promised
- `category`: product, ethics, sustainability, privacy, security, other
- `promised_date`: When the promise was made
- `deadline_date`: When it should be fulfilled
- `status`: pending, kept, broken, delayed, cancelled
- `community_verdict`: Community voting on fulfillment
- `impact_score`: 0-5 scale of promise importance

### Promise Voting

Community members can vote on whether promises were kept:
- **Verdict options**: kept, broken, partial
- One vote per user per promise
- Influences company's delivery score

### Promise Impact on Scores

Promise fulfillment ratio is calculated:
```
Promises Kept Ratio = (Kept Promises) / (Total Non-Pending Promises)
```

This ratio adjusts the **Delivery Score**:
```
Adjusted Delivery Score = (Vote-based Score × 0.6) + (Promise Ratio × 10 × 0.4)
```

**Example:**
- Community voted Delivery Score: 7.5
- Promise Kept Ratio: 0.8 (80% kept)
- Final Delivery Score: (7.5 × 0.6) + (8.0 × 0.4) = 4.5 + 3.2 = **7.7**

## Score Calculation

### Weighted Average Algorithm

For each score dimension:

1. **Collect all votes** for that dimension
2. **Apply user weights** (1.0 - 2.0 based on reputation/expert status)
3. **Calculate weighted sum**:
   ```
   Weighted Sum = Σ(score × weight)
   Total Weight = Σ(weight)
   ```
4. **Calculate weighted average**:
   ```
   Score = Weighted Sum / Total Weight
   ```
5. **Round to 1 decimal place**

### Confidence Level

Based on vote count and expert participation:

| Votes | Expert Reviews | Confidence Level |
|-------|---------------|------------------|
| 50+   | 3+            | Very High        |
| 30+   | 2+            | High             |
| 15+   | 1+            | Medium           |
| <15   | 0             | Low              |

**Displayed to users** to indicate score reliability.

### Real-time Recalculation

Scores are automatically recalculated when:
- New vote is submitted (INSERT)
- Vote is updated (UPDATE)
- Vote is deleted (DELETE)
- Expert review is added/modified (INSERT/UPDATE)
- Expert review verification status changes
- Promise status is updated

**Trigger functions:**
```sql
-- After any vote change
CREATE TRIGGER after_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_score_recalculation();

-- After expert review change
CREATE TRIGGER after_expert_review_change
    AFTER INSERT OR UPDATE OR DELETE ON expert_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_score_recalculation();
```

## Database Schema

### New Tables

#### `votes`
```sql
- id (UUID)
- user_id (references user_profiles)
- company_id (references companies)
- vote_type (ethics, credibility, delivery, security, innovation)
- score (1-10)
- weight (auto-calculated based on user reputation)
- comment (optional)
- evidence_urls (array)
- voted_at, updated_at
UNIQUE(user_id, company_id, vote_type)
```

#### `promises`
```sql
- id (UUID)
- company_id (references companies)
- promise_text
- category
- promised_date
- deadline_date
- status (pending, kept, broken, delayed, cancelled)
- community_verdict (kept, broken, partial, unknown)
- verdict_votes_count
- source_url, evidence_url
- impact_score (0-5)
- created_by (user who added it)
```

#### `expert_reviews`
```sql
- id (UUID)
- user_id (references user_profiles, must be expert)
- company_id (references companies)
- review_text
- ethics_score, credibility_score, delivery_score, security_score, innovation_score
- verified (boolean)
- verified_by, verified_at
- expertise_areas (array)
- citations (array)
- weight (2.0 for verified experts)
```

#### `company_scores`
```sql
- company_id (unique)
- overall_score
- ethics_score, credibility_score, delivery_score, security_score, innovation_score
- confidence_level (low, medium, high, very_high)
- total_votes
- expert_reviews_count
- promises_kept_ratio
- calculation_metadata (JSONB)
- last_calculated
```

#### `score_history`
```sql
- company_id
- score_type (overall, ethics, credibility, delivery, security, innovation)
- score_value
- change_amount (delta from previous)
- confidence_level
- total_votes
- recorded_at
```

#### `promise_votes`
```sql
- promise_id
- user_id
- verdict (kept, broken, partial)
- comment (optional)
- voted_at
UNIQUE(promise_id, user_id)
```

### Updated Companies Table

New columns added:
```sql
- credibility_score DECIMAL(3,1)
- delivery_score DECIMAL(3,1)
- security_score DECIMAL(3,1)
- overall_score DECIMAL(3,1)
- total_community_votes INTEGER
- score_confidence TEXT (low, medium, high, very_high)
- promises_kept_count INTEGER
- promises_broken_count INTEGER
```

**Backward compatibility:** Existing columns remain unchanged.

## Key Functions

### `get_user_vote_weight(user_id)`
Returns appropriate weight (1.0-2.0) based on user's reputation and expert status.

### `calculate_weighted_vote_score(company_id, vote_type)`
Calculates weighted average score for a specific dimension:
- Includes community votes
- Includes expert reviews (higher weight)
- Returns decimal score (0.0-10.0)

### `calculate_promise_score(company_id)`
Returns promise fulfillment ratio (0.0-1.0):
- Counts kept vs. total non-pending promises
- Considers both status and community_verdict

### `determine_confidence_level(total_votes, expert_count)`
Returns confidence level based on participation:
- Very High: 50+ votes, 3+ experts
- High: 30+ votes, 2+ experts
- Medium: 15+ votes or 1+ expert
- Low: Otherwise

### `recalculate_company_score(company_id)`
**Main scoring function** that:
1. Calculates each dimension score using weighted votes
2. Adjusts delivery score with promise ratio
3. Calculates overall weighted average
4. Determines confidence level
5. Updates `company_scores` table
6. Updates `companies` table
7. Records significant changes in `score_history`

## Notifications

### Follower Notifications

When a company's overall score changes by **≥ 0.5 points**:
- Notifications sent to all followers with `notify_on_updates = true`
- Notification includes:
  - Old score → New score
  - Change amount (positive/negative)
  - Link to company profile
  - JSONB data with full context

**Trigger:**
```sql
CREATE TRIGGER notify_on_significant_score_change
    AFTER UPDATE ON company_scores
    FOR EACH ROW
    WHEN (OLD.overall_score IS DISTINCT FROM NEW.overall_score)
    EXECUTE FUNCTION notify_followers_on_score_change();
```

## Score History & Metrics

### Automatic History Tracking

**When recorded:**
- Overall score changes by ≥ 0.1 points
- Stored in `score_history` table
- Includes change delta for trending

**Daily snapshot:**
```sql
-- Run this function daily (cron/scheduler)
SELECT update_score_history();
```

### Integration with Metrics

**Synced automatically:**
When `company_scores` is updated, trigger syncs to `company_metrics_history`:
- `ethics_score` → metrics history
- `overall_score` → `impact_score` in metrics
- `innovation_score` → metrics history
- Engagement score calculated from vote participation

This enables historical charts showing score evolution over time.

## API Usage Examples

### Submit a Vote

```typescript
import { supabaseAdmin } from '@/lib/supabase'

async function submitVote(
  userId: string,
  companyId: string,
  voteType: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation',
  score: number,
  comment?: string
) {
  const { data, error } = await supabaseAdmin
    .from('votes')
    .upsert({
      user_id: userId,
      company_id: companyId,
      vote_type: voteType,
      score: score,
      comment: comment,
    }, {
      onConflict: 'user_id,company_id,vote_type'
    })

  // Score automatically recalculated by trigger
  return { data, error }
}
```

### Get Company Scores

```typescript
async function getCompanyScores(companyId: string) {
  const { data, error } = await supabase
    .from('company_scores')
    .select('*')
    .eq('company_id', companyId)
    .single()

  return data // Includes all dimension scores + confidence
}
```

### Track Promise

```typescript
async function addPromise(
  companyId: string,
  promiseText: string,
  promisedDate: string,
  deadlineDate: string,
  category: string,
  sourceUrl: string,
  createdBy: string
) {
  const { data, error } = await supabaseAdmin
    .from('promises')
    .insert({
      company_id: companyId,
      promise_text: promiseText,
      promised_date: promisedDate,
      deadline_date: deadlineDate,
      category: category,
      source_url: sourceUrl,
      created_by: createdBy,
    })

  return { data, error }
}
```

### Vote on Promise Fulfillment

```typescript
async function voteOnPromise(
  promiseId: string,
  userId: string,
  verdict: 'kept' | 'broken' | 'partial',
  comment?: string
) {
  const { data, error } = await supabaseAdmin
    .from('promise_votes')
    .upsert({
      promise_id: promiseId,
      user_id: userId,
      verdict: verdict,
      comment: comment,
    }, {
      onConflict: 'promise_id,user_id'
    })

  return { data, error }
}
```

### Get Score History for Charts

```typescript
async function getScoreHistory(
  companyId: string,
  scoreType: 'overall' | 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation',
  days: number = 30
) {
  const { data, error } = await supabase
    .from('score_history')
    .select('*')
    .eq('company_id', companyId)
    .eq('score_type', scoreType)
    .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: true })

  return data // Use with MetricsChart component
}
```

## Row Level Security (RLS)

### Votes
- **SELECT**: Public read access
- **INSERT**: Authenticated users, must match `auth.uid() = user_id`
- **UPDATE**: Users can update their own votes
- **DELETE**: Users can delete their own votes

### Promises
- **SELECT**: Public read access
- **INSERT**: Authenticated users, must match `auth.uid() = created_by`

### Expert Reviews
- **SELECT**: Public read for `verified = true` only
- **INSERT**: Only users with `is_expert = true` can submit

### Company Scores & History
- **SELECT**: Public read access (read-only table, managed by functions)

### Promise Votes
- **SELECT**: Public read access
- **INSERT**: Authenticated users, must match `auth.uid() = user_id`

## Performance Considerations

### Indexes
All critical columns are indexed:
- `votes(company_id, user_id, vote_type, voted_at)`
- `promises(company_id, status, deadline_date)`
- `expert_reviews(company_id, user_id, verified)`
- `score_history(company_id, score_type, recorded_at)`

### Caching Recommendations
- Cache `company_scores` for 5-10 minutes
- Cache score history for 1 hour
- Invalidate on score updates

### Scaling
- Trigger functions are optimized for single-row operations
- Bulk recalculation available via direct function call:
  ```sql
  SELECT recalculate_company_score('company-uuid');
  ```

## Migration Guide

### Running the Migration

```bash
# Connect to Supabase SQL Editor
# Copy contents of: supabase/migrations/20250120_scoring_system.sql
# Execute in SQL Editor
```

### Verification

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('votes', 'promises', 'expert_reviews', 'company_scores', 'score_history', 'promise_votes');

-- Check companies table columns added
SELECT column_name FROM information_schema.columns
WHERE table_name = 'companies'
AND column_name IN ('credibility_score', 'delivery_score', 'security_score', 'overall_score');

-- Verify triggers
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table IN ('votes', 'expert_reviews', 'company_scores');
```

## Future Enhancements

- Machine learning for score prediction
- Automated promise extraction from news
- Expert badge progression system
- Company response to votes/reviews
- Score comparison across industries
- Predictive trending algorithms
