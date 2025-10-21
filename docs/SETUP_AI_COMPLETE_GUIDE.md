# Complete AI Setup Guide for TechPulse

## 🎯 Overview

This guide will walk you through setting up the AI-powered analysis feature for TechPulse, from installing dependencies to testing the complete system.

---

## ✅ Step 1: Verify Environment Configuration

Your OpenAI API key should be added to `.env`:

```bash
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
AI_MODEL=gpt-4-turbo-preview
AI_CACHE_EXPIRY_HOURS=24
AI_RATE_LIMIT_PER_HOUR=10
```

**Note**: Your actual API key has been configured in your local `.env` file.

✅ **Status**: Environment variables configured!

---

## 🗄️ Step 2: Database Migration Setup

You have **THREE OPTIONS** to run the database migration:

### **Option 1: Supabase CLI (Recommended)**

#### Install Supabase CLI:

**Windows (via npm):**
```bash
npm install -g supabase
```

**Windows (via Scoop):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verify installation:**
```bash
supabase --version
```

#### Login to Supabase:
```bash
supabase login
```

#### Link your project:
```bash
cd "C:\Users\GOPIKA ARAVIND\TechPulse"
supabase link --project-ref uypdmcgybpltogihldhu
```

#### Run migration:
```bash
supabase db push
```

This will apply all migrations in `supabase/migrations/` including `20250122_ai_analyses.sql`.

---

### **Option 2: Supabase Dashboard (Manual - EASIEST)**

If you don't want to install CLI, you can run the migration manually:

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu
   - Login with your credentials

2. **Navigate to SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Copy the migration SQL**:
   - Open file: `C:\Users\GOPIKA ARAVIND\TechPulse\supabase\migrations\20250122_ai_analyses.sql`
   - Copy ALL content (420+ lines)

4. **Paste and Run**:
   - Paste the SQL into the SQL Editor
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for success message

5. **Verify tables created**:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('ai_analyses', 'ai_insights', 'ai_call_logs');
   ```
   - Should return 3 rows

---

### **Option 3: Direct SQL Execution via Node.js**

Create a migration runner script:

**Create file: `scripts/run-migration.js`**

```javascript
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uypdmcgybpltogihldhu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cGRtY2d5YnBsdG9naWhsZGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MjYxNDMsImV4cCI6MjA3NjQwMjE0M30.b-NUHk_ziPyVhafKZr654S2tOia1uSkppq172RXRYAw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const sql = fs.readFileSync('supabase/migrations/20250122_ai_analyses.sql', 'utf8');

    console.log('Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('Created tables: ai_analyses, ai_insights, ai_call_logs');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

runMigration();
```

**Run it:**
```bash
node scripts/run-migration.js
```

**Note**: This option requires service role key with elevated permissions. The anon key may not have sufficient permissions. Use Option 2 (Dashboard) if this fails.

---

## 🔍 Step 3: Verify Database Setup

After running the migration, verify everything is set up correctly:

### **Check Tables Exist:**

Run this SQL in Supabase Dashboard > SQL Editor:

```sql
-- Check if tables exist
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_analyses', 'ai_insights', 'ai_call_logs');
```

Expected output:
```
table_name      | column_count
----------------|-------------
ai_analyses     | 9
ai_insights     | 9
ai_call_logs    | 9
```

### **Check Functions Exist:**

```sql
-- Check if functions are created
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_latest_ai_analysis',
  'generate_ai_insights_summary',
  'cleanup_expired_ai_analyses',
  'get_ai_analysis_stats'
);
```

Expected: 4 rows

### **Check Policies Exist:**

```sql
-- Check Row Level Security policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('ai_analyses', 'ai_insights', 'ai_call_logs');
```

Expected: Multiple policies for each table

---

## 🚀 Step 4: Start Development Server

```bash
cd "C:\Users\GOPIKA ARAVIND\TechPulse"

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Your app should start at `http://localhost:5173` (or another port shown in terminal).

---

## 🧪 Step 5: Test AI Analysis API

### **Test 1: Check API Endpoint Exists**

Open your browser and navigate to:
```
http://localhost:3000/api/ai/company/test-id/analysis
```

You should get a response (even if it's an error about company not found - that means the endpoint works).

### **Test 2: Trigger AI Analysis (Admin Only)**

First, you need to be logged in as an admin user. If you don't have an admin account:

**Create Admin User in Supabase:**

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Enter email and password
4. After creating, go to Table Editor > profiles
5. Find your user and set `role = 'admin'`

**Then test the API:**

```bash
# Get your auth token from browser DevTools:
# 1. Login to TechPulse
# 2. Open DevTools (F12) > Application > Local Storage
# 3. Find 'sb-uypdmcgybpltogihldhu-auth-token'
# 4. Copy the access_token value

curl -X POST http://localhost:3000/api/ai/analyze-company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "company_id": "YOUR_COMPANY_UUID",
    "analysis_types": ["transparency", "ethics", "risk"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "analyses": {
      "transparency": {
        "score": 7.5,
        "strengths": ["..."],
        "concerns": ["..."],
        "summary": "..."
      },
      "ethics": { ... },
      "risk": { ... }
    },
    "insights": 12,
    "errors": {}
  },
  "message": "AI analysis completed successfully"
}
```

### **Test 3: Verify Data in Database**

Run in Supabase SQL Editor:

```sql
-- Check analyses
SELECT
  company_id,
  analysis_type,
  score,
  analyzed_at
FROM ai_analyses
ORDER BY created_at DESC
LIMIT 5;

-- Check insights
SELECT
  insight_type,
  severity,
  title,
  created_at
FROM ai_insights
ORDER BY created_at DESC
LIMIT 10;

-- Check API logs
SELECT
  analysis_type,
  success,
  cost,
  duration_ms,
  created_at
FROM ai_call_logs
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🎨 Step 6: Integrate AI Components into UI

Now that the backend is working, let's add AI analysis to company profile pages.

### **Option A: Find Your Company Profile Page**

Look for a file like:
- `src/app/companies/[slug]/page.tsx` or
- `src/pages/companies/[slug].tsx` or
- `src/components/CompanyProfile.tsx`

### **Option B: Create a Test Page**

Create a new test page: `src/app/test-ai/page.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import AIAnalysisSummary from '@/components/ai/AIAnalysisSummary';

export default function TestAIPage() {
  const [companyId, setCompanyId] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Analysis Test</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Company ID (UUID):
        </label>
        <input
          type="text"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Enter company UUID"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {companyId && (
        <AIAnalysisSummary
          companyId={companyId}
          companyName="Test Company"
        />
      )}
    </div>
  );
}
```

Visit: `http://localhost:5173/test-ai`

---

## 📊 Step 7: Monitor AI Costs

### **Check Total Costs:**

```sql
-- Total cost in last 30 days
SELECT
  ROUND(SUM(cost)::NUMERIC, 4) as total_cost_usd,
  COUNT(*) as total_calls,
  ROUND(AVG(cost)::NUMERIC, 4) as avg_cost_per_call
FROM ai_call_logs
WHERE created_at > NOW() - INTERVAL '30 days';
```

### **Cost by Analysis Type:**

```sql
SELECT
  analysis_type,
  COUNT(*) as calls,
  ROUND(SUM(cost)::NUMERIC, 4) as total_cost,
  ROUND(AVG(cost)::NUMERIC, 4) as avg_cost
FROM ai_call_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY analysis_type
ORDER BY total_cost DESC;
```

### **Success Rate:**

```sql
SELECT
  analysis_type,
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed,
  ROUND(
    (COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*)) * 100,
    2
  ) as success_rate_pct
FROM ai_call_logs
GROUP BY analysis_type;
```

---

## 🐛 Troubleshooting

### **Issue 1: "OpenAI API key not configured"**

**Solution:**
1. Check `.env` file has `OPENAI_API_KEY` (without `VITE_` prefix)
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Verify key is valid: Visit https://platform.openai.com/api-keys

### **Issue 2: "Table 'ai_analyses' does not exist"**

**Solution:**
1. Migration not run - use Option 2 (Supabase Dashboard) from Step 2
2. Check table exists: Run verification SQL from Step 3

### **Issue 3: "Rate limit exceeded"**

**Solution:**
1. Wait 1 hour for rate limit to reset
2. Or increase limit in `.env`: `AI_RATE_LIMIT_PER_HOUR=20`
3. Restart server

### **Issue 4: "Insufficient quota" from OpenAI**

**Solution:**
1. Check OpenAI billing: https://platform.openai.com/account/billing
2. Add payment method if not already added
3. Check usage limits: https://platform.openai.com/account/limits

### **Issue 5: AI Analysis not showing on frontend**

**Solution:**
1. Check browser console for errors (F12 > Console)
2. Verify company has been analyzed: Check `ai_analyses` table
3. Check API endpoint returns data: Visit `/api/ai/company/[id]/analysis`

### **Issue 6: "Unauthorized" when triggering analysis**

**Solution:**
1. Ensure you're logged in as admin user
2. Check `profiles` table: `role = 'admin'`
3. Get fresh auth token from localStorage

---

## 📝 Next Steps After Setup

1. **Analyze Your First Company**:
   - Login as admin
   - Use curl or Postman to trigger analysis
   - View results in database and frontend

2. **Integrate into Company Profile**:
   - Add `<AIAnalysisSummary />` to company pages
   - Test with real company data

3. **Set Up Background Jobs** (Optional):
   - Create cron job to analyze companies automatically
   - Use Vercel Cron or similar service

4. **Configure Rate Limits**:
   - Adjust based on your usage patterns
   - Monitor costs in `ai_call_logs`

5. **Deploy to Production**:
   - Add `OPENAI_API_KEY` to production environment variables
   - Run migration on production database
   - Test thoroughly before public release

---

## 📚 Additional Resources

- **OpenAI Documentation**: https://platform.openai.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **AI Setup Guide**: `docs/AI_SETUP.md` (detailed technical docs)
- **API Reference**: See inline comments in API route files

---

## ✅ Setup Checklist

- [ ] OpenAI API key added to `.env`
- [ ] Database migration run successfully
- [ ] Tables verified (ai_analyses, ai_insights, ai_call_logs)
- [ ] Functions verified (4 PostgreSQL functions)
- [ ] Dev server started
- [ ] Admin user created
- [ ] First AI analysis triggered successfully
- [ ] Results visible in database
- [ ] Frontend component displaying analysis
- [ ] Cost monitoring set up

---

## 🎉 Success!

If you've completed all steps, your AI analysis system is ready! You can now:
- Analyze tech companies for transparency, ethics, and risk
- View AI-generated insights on company profiles
- Monitor API costs and usage
- Track analysis history in database

For questions or issues, refer to `docs/AI_SETUP.md` for detailed troubleshooting.
