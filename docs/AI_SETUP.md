# AI-Powered Analysis Setup Guide

## Overview

TechPulse now includes AI-powered company analysis using OpenAI's GPT-4. This feature provides:
- **Transparency Analysis**: Evaluates company transparency practices (score 0-10)
- **Ethics Evaluation**: Analyzes ethical practices and identifies red flags (score 0-10)
- **Risk Assessment**: Comprehensive risk analysis across 7 categories (score 0-10)
- **Automated Insights**: Generates actionable insights categorized by type and severity

## Prerequisites

1. **OpenAI API Account**
   - Sign up at [https://platform.openai.com](https://platform.openai.com)
   - Navigate to API Keys: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create a new API key

2. **Database Migration**
   - Ensure Supabase migrations are up to date
   - Required migration: `20250122_ai_analyses.sql`

## Environment Setup

### 1. Configure Environment Variables

Add the following to your `.env` file:

```bash
# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-proj-your-actual-api-key-here

# Optional: Model Configuration
AI_MODEL=gpt-4-turbo-preview

# Optional: Cache Configuration
AI_CACHE_EXPIRY_HOURS=24

# Optional: Rate Limiting
AI_RATE_LIMIT_PER_HOUR=10
```

**IMPORTANT NOTES:**
- Do NOT prefix `OPENAI_API_KEY` with `VITE_` (server-side only)
- Never commit your actual API key to version control
- Keep your `.env` file in `.gitignore`

### 2. Run Database Migration

Execute the AI analyses migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually apply the migration file
# Location: supabase/migrations/20250122_ai_analyses.sql
```

This creates three tables:
- `ai_analyses` - Stores analysis results
- `ai_insights` - Stores individual insights
- `ai_call_logs` - Tracks API usage and costs

### 3. Verify Installation

Check that the tables exist in your Supabase dashboard:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_analyses', 'ai_insights', 'ai_call_logs');
```

## API Endpoints

### 1. Trigger AI Analysis (Admin Only)

**Endpoint:** `POST /api/ai/analyze-company`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "company_id": "uuid-of-company",
  "analysis_types": ["transparency", "ethics", "risk"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analyses": {
      "transparency": {
        "score": 7.5,
        "strengths": [...],
        "concerns": [...],
        "summary": "..."
      },
      "ethics": { ... },
      "risk": { ... }
    },
    "insights": 15,
    "errors": {}
  }
}
```

**Rate Limits:**
- 10 company analyses per hour per admin user
- Automatic retry on transient failures (max 3 attempts)

### 2. Retrieve AI Analysis (Public)

**Endpoint:** `GET /api/ai/company/[companyId]/analysis`

**Response:**
```json
{
  "success": true,
  "data": {
    "company": {
      "id": "...",
      "name": "...",
      "slug": "..."
    },
    "analyses": {
      "transparency": { ... },
      "ethics": { ... },
      "risk": { ... }
    },
    "insights": {
      "strengths": [...],
      "concerns": [...],
      "red_flags": [...],
      "opportunities": [...],
      "risks": [...],
      "positive": [...]
    },
    "stats": {
      "total_analyses": 3,
      "total_insights": 15,
      "high_severity_count": 2,
      "avg_confidence": "0.82",
      "last_analyzed": "2025-01-22T10:30:00Z"
    },
    "is_stale": false
  }
}
```

## Frontend Integration

### Using React Hooks

```typescript
import { useAIAnalysis } from '@/hooks/useAIAnalysis';

function CompanyProfile({ companyId }) {
  const { data, loading, error, refetch, isStale } = useAIAnalysis(companyId);

  if (loading) return <div>Loading AI analysis...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No analysis available</div>;

  return (
    <div>
      <h2>AI Analysis</h2>
      {isStale && <div>Analysis is outdated (>7 days)</div>}

      {/* Display transparency score */}
      {data.analyses.transparency && (
        <div>Score: {data.analyses.transparency.score}/10</div>
      )}

      {/* Display insights */}
      {data.insights.red_flags.map(insight => (
        <div key={insight.id}>{insight.title}</div>
      ))}
    </div>
  );
}
```

### Using Components

```typescript
import AIAnalysisSummary from '@/components/ai/AIAnalysisSummary';

function CompanyPage({ company }) {
  return (
    <div>
      <h1>{company.name}</h1>

      {/* AI Analysis Section */}
      <AIAnalysisSummary
        companyId={company.id}
        companyName={company.name}
      />
    </div>
  );
}
```

## Cost Management

### Estimated Costs

Based on GPT-4 Turbo pricing (as of January 2025):
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens

**Average cost per company analysis:**
- Transparency: ~$0.05-0.10
- Ethics: ~$0.08-0.15
- Risk: ~$0.10-0.20
- **Total per company: ~$0.23-0.45**

### Monitoring Costs

Query the `ai_call_logs` table:

```sql
-- Total cost in last 30 days
SELECT SUM(cost) as total_cost
FROM ai_call_logs
WHERE created_at > NOW() - INTERVAL '30 days';

-- Cost breakdown by analysis type
SELECT
  analysis_type,
  COUNT(*) as calls,
  SUM(cost) as total_cost,
  AVG(cost) as avg_cost
FROM ai_call_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY analysis_type;

-- Success rate
SELECT
  analysis_type,
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed,
  ROUND(COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*) * 100, 2) as success_rate
FROM ai_call_logs
GROUP BY analysis_type;
```

### Cost Optimization

1. **Caching**: Analyses expire after 24 hours by default
2. **Rate Limiting**: 10 analyses per hour per admin user
3. **Selective Analysis**: Only run analyses when needed
4. **Batch Processing**: Analyze multiple companies during off-peak hours

## Testing

### 1. Test AI Analysis Trigger

```bash
# Using curl
curl -X POST http://localhost:3000/api/ai/analyze-company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "company_id": "your-company-uuid",
    "analysis_types": ["transparency", "ethics", "risk"]
  }'
```

### 2. Test Analysis Retrieval

```bash
# Public endpoint (no auth required)
curl http://localhost:3000/api/ai/company/your-company-uuid/analysis
```

### 3. Verify Database Records

```sql
-- Check analyses
SELECT company_id, analysis_type, score, analyzed_at, expires_at
FROM ai_analyses
ORDER BY created_at DESC
LIMIT 10;

-- Check insights
SELECT company_id, insight_type, severity, title
FROM ai_insights
ORDER BY created_at DESC
LIMIT 20;

-- Check API logs
SELECT analysis_type, success, cost, duration_ms, created_at
FROM ai_call_logs
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### Error: "OpenAI API key not configured"

**Solution:** Ensure `OPENAI_API_KEY` is set in your `.env` file without the `VITE_` prefix.

### Error: "Rate limit exceeded"

**Solution:** Wait for the rate limit window to reset (1 hour) or increase `AI_RATE_LIMIT_PER_HOUR`.

### Error: "Insufficient quota"

**Solution:**
1. Check OpenAI account billing: [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. Add payment method or increase usage limits
3. Verify API key is valid

### Analysis returns stale data

**Solution:**
1. Check `expires_at` in `ai_analyses` table
2. Manually trigger new analysis via POST endpoint
3. Run cleanup function: `SELECT cleanup_expired_ai_analyses();`

### High API costs

**Solution:**
1. Review `ai_call_logs` for unusual patterns
2. Increase cache expiry time: `AI_CACHE_EXPIRY_HOURS=72`
3. Reduce rate limits: `AI_RATE_LIMIT_PER_HOUR=5`
4. Use GPT-3.5-turbo for less critical analyses (cheaper)

## Database Functions

### Get Latest Analysis

```sql
SELECT * FROM get_latest_ai_analysis(
  'company-uuid',
  'transparency'
);
```

### Generate Insights Summary

```sql
SELECT * FROM generate_ai_insights_summary('company-uuid');
```

### Cleanup Expired Analyses

```sql
SELECT cleanup_expired_ai_analyses();
-- Returns: number of deleted records
```

### Get Analysis Stats (Admin)

```sql
SELECT * FROM get_ai_analysis_stats();
```

## Security Considerations

1. **API Key Protection**
   - Store in environment variables only
   - Never expose in client-side code
   - Rotate keys regularly

2. **Rate Limiting**
   - Prevents API abuse
   - Default: 10 analyses/hour per user
   - Adjust based on usage patterns

3. **Row Level Security**
   - Public read access for analyses
   - Admin-only write access
   - Audit trail via `ai_call_logs`

4. **Data Privacy**
   - AI analyses may contain sensitive information
   - Ensure compliance with privacy policies
   - Clear cache regularly for deleted companies

## Advanced Configuration

### Custom Prompts

Edit prompts in `src/lib/ai/prompts.ts`:

```typescript
export const TRANSPARENCY_ANALYSIS_PROMPT = `
  Your custom prompt here...
`;
```

### Model Selection

Change the model in `src/lib/ai/analyzer.ts`:

```typescript
const DEFAULT_MODEL = 'gpt-4-turbo-preview'; // or 'gpt-3.5-turbo'
const DEFAULT_TEMPERATURE = 0.3; // Lower = more factual
```

### Custom Analysis Types

1. Add new type to database enum in migration file
2. Create prompt in `prompts.ts`
3. Add analyzer function in `analyzer.ts`
4. Update API endpoint to handle new type

## Support

For issues or questions:
- Check logs in `ai_call_logs` table
- Review OpenAI API status: [https://status.openai.com](https://status.openai.com)
- Contact development team with error details

## Changelog

### v1.0.0 (January 2025)
- Initial AI analysis MVP release
- Transparency, ethics, and risk analysis
- Automated insight generation
- Cost tracking and monitoring
- React hooks and components
