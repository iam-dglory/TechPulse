# 🎯 AI Analysis - Next Steps Guide

## ✅ What's Done

✔️ **OpenAI API Key** - Configured in `.env` file
✔️ **Backend Code** - Complete AI analysis system implemented
✔️ **Database Schema** - Migration file ready (`supabase/migrations/20250122_ai_analyses.sql`)
✔️ **API Endpoints** - 2 endpoints created (trigger + retrieve)
✔️ **Frontend Components** - React components ready to use
✔️ **Documentation** - 4 comprehensive guides created
✔️ **Git Commits** - All code committed and pushed to GitHub

---

## 🚀 What You Need To Do Now

### **1. Run Database Migration (5 minutes)**

**EASIEST METHOD:**

1. Open: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/sql
2. Click "+ New Query"
3. Open file: `C:\Users\GOPIKA ARAVIND\TechPulse\supabase\migrations\20250122_ai_analyses.sql`
4. Copy ALL content and paste
5. Click "Run"

**Verify it worked:**
```sql
SELECT COUNT(*) FROM ai_analyses;  -- Should return 0 (empty table)
SELECT COUNT(*) FROM ai_insights;  -- Should return 0 (empty table)
SELECT COUNT(*) FROM ai_call_logs; -- Should return 0 (empty table)
```

📖 **Detailed instructions**: See `MIGRATION_INSTRUCTIONS.md`

---

### **2. Start Development Server**

```bash
cd "C:\Users\GOPIKA ARAVIND\TechPulse"
npm run dev
```

Your app should start at `http://localhost:5173` or similar.

---

### **3. Create Admin User (2 minutes)**

You need admin access to trigger AI analysis:

1. Go to: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/auth/users
2. Click "Add User"
3. Enter email: `admin@techpulse.com` (or your email)
4. Enter password: Choose a strong password
5. Click "Create User"

**Set admin role:**

1. Go to: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/editor/profiles
2. Find your new user
3. Click to edit
4. Change `role` field to: `admin`
5. Save

---

### **4. Test the AI System**

#### **Option A: Quick Test via API**

Get a company UUID from your database:

```sql
-- In Supabase SQL Editor
SELECT id, name, slug FROM companies LIMIT 1;
```

Then test the retrieval endpoint (no auth needed):

```bash
# Replace YOUR_COMPANY_UUID with actual UUID
curl http://localhost:3000/api/ai/company/YOUR_COMPANY_UUID/analysis
```

Expected response: `{"success": true, "data": {...}}` or message saying no analysis yet.

#### **Option B: Create Test Page**

Create file: `src/app/test-ai/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import AIAnalysisSummary from '@/components/ai/AIAnalysisSummary';

export default function TestAI() {
  const [companyId, setCompanyId] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Analysis Test</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Company UUID:
        </label>
        <input
          type="text"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Paste company UUID here"
          className="w-full px-4 py-2 border rounded"
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

### **5. Trigger Your First AI Analysis**

**Method 1: Using curl**

First, login as admin in your app, then get the auth token:

1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Find `sb-uypdmcgybpltogihldhu-auth-token`
4. Copy the `access_token` value

Then run:

```bash
curl -X POST http://localhost:3000/api/ai/analyze-company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "company_id": "YOUR_COMPANY_UUID",
    "analysis_types": ["transparency", "ethics", "risk"]
  }'
```

**Expected cost**: ~$0.30 per company analysis

**Method 2: Create Admin Panel (future enhancement)**

You can build a simple admin interface later to trigger analyses with a button click.

---

## 💡 Understanding the AI System

### **How It Works:**

1. **Admin triggers analysis** → API call to OpenAI GPT-4
2. **AI analyzes company** → Generates scores and insights
3. **Results stored in database** → Cached for 24 hours
4. **Users view analysis** → Frontend fetches from cache
5. **Costs tracked** → Every API call logged in `ai_call_logs`

### **What Gets Analyzed:**

- **Transparency** (Score 0-10):
  - Public communications quality
  - Privacy policy clarity
  - Data practices transparency
  - Corporate governance openness

- **Ethics** (Score 0-10):
  - Labor practices
  - Environmental impact
  - Social responsibility
  - Recent controversies

- **Risk** (Score 0-10):
  - Regulatory risks
  - Reputational risks
  - Operational risks
  - Financial risks
  - Technology risks
  - Competitive risks
  - Leadership risks

### **Cost Breakdown:**

- Transparency analysis: ~$0.05-0.10
- Ethics analysis: ~$0.08-0.15
- Risk analysis: ~$0.10-0.20
- **Total per company**: ~$0.23-0.45

With caching (24h), you won't re-analyze unless data is stale.

---

## 📊 Monitoring AI Costs

Check spending in Supabase SQL Editor:

```sql
-- Total cost last 30 days
SELECT
  ROUND(SUM(cost)::NUMERIC, 2) as total_usd,
  COUNT(*) as total_analyses
FROM ai_call_logs
WHERE created_at > NOW() - INTERVAL '30 days';

-- Cost by analysis type
SELECT
  analysis_type,
  COUNT(*) as count,
  ROUND(AVG(cost)::NUMERIC, 4) as avg_cost,
  ROUND(SUM(cost)::NUMERIC, 2) as total_cost
FROM ai_call_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY analysis_type;

-- Success rate
SELECT
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed,
  ROUND(
    (COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*)) * 100,
    1
  ) as success_rate_pct
FROM ai_call_logs;
```

---

## 🔧 Configuration Options

Your `.env` file has these AI settings:

```bash
OPENAI_API_KEY=sk-proj-... (your key)
AI_MODEL=gpt-4-turbo-preview
AI_CACHE_EXPIRY_HOURS=24
AI_RATE_LIMIT_PER_HOUR=10
```

**Adjust settings:**

- **Reduce costs**: Use `gpt-3.5-turbo` (cheaper, less accurate)
- **Longer cache**: Set `AI_CACHE_EXPIRY_HOURS=72` (3 days)
- **More analyses**: Set `AI_RATE_LIMIT_PER_HOUR=20`

Remember to restart dev server after changing `.env`.

---

## 📱 Frontend Integration

To add AI analysis to your company profile pages:

**Find your company profile component** (likely in `src/app/companies/[slug]/` or similar):

```typescript
import AIAnalysisSummary from '@/components/ai/AIAnalysisSummary';

export default function CompanyProfile({ company }) {
  return (
    <div>
      {/* Your existing company info */}
      <h1>{company.name}</h1>
      <p>{company.description}</p>

      {/* Add AI Analysis Section */}
      <section className="mt-8">
        <AIAnalysisSummary
          companyId={company.id}
          companyName={company.name}
        />
      </section>
    </div>
  );
}
```

That's it! The component handles:
- Loading states
- Error handling
- Data fetching
- Refresh button
- Staleness warnings

---

## 🚀 Production Deployment

When you're ready to deploy:

1. **Add API key to production**:
   - Vercel: Project Settings > Environment Variables
   - Add `OPENAI_API_KEY` with your key
   - DO NOT add `VITE_` prefix

2. **Run migration on production database**:
   - Same process as local (Supabase Dashboard)
   - Just make sure you're on production project

3. **Test thoroughly**:
   - Trigger a few test analyses
   - Monitor costs
   - Check error logs

4. **Set up cost alerts**:
   - OpenAI Dashboard: https://platform.openai.com/account/billing/limits
   - Set monthly budget limit

---

## 📚 Documentation Files

- `AI_QUICK_START.md` - 3-step quick setup
- `MIGRATION_INSTRUCTIONS.md` - Database migration guide
- `docs/SETUP_AI_COMPLETE_GUIDE.md` - 500+ line detailed guide
- `docs/AI_SETUP.md` - Technical API documentation
- `NEXT_STEPS.md` - This file

---

## 🎓 Learning More

### **About the Code:**

- **AI Service Layer**: `src/lib/ai/` - All OpenAI logic
- **API Endpoints**: `src/app/api/ai/` - Backend routes
- **React Components**: `src/components/ai/` - UI components
- **Hooks**: `src/hooks/useAIAnalysis.ts` - Data fetching
- **Database Schema**: `supabase/migrations/20250122_ai_analyses.sql`

### **About OpenAI API:**

- API Docs: https://platform.openai.com/docs
- Pricing: https://openai.com/pricing
- Usage Dashboard: https://platform.openai.com/usage

### **About Supabase:**

- Database Dashboard: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu
- SQL Editor: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/sql
- Table Editor: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/editor

---

## ✅ Success Checklist

Track your progress:

- [ ] Database migration completed
- [ ] Tables verified (ai_analyses, ai_insights, ai_call_logs)
- [ ] Dev server running
- [ ] Admin user created
- [ ] First AI analysis triggered successfully
- [ ] Results visible in database
- [ ] Test page created and working
- [ ] Cost monitoring queries tested
- [ ] Frontend component integrated
- [ ] Ready for production deployment

---

## 🎉 You're All Set!

Once you complete the steps above, your AI analysis system will be fully operational!

**Estimated time to complete**: 15-20 minutes

**What you'll have:**
- Fully automated AI company analysis
- Real-time insights on company profiles
- Cost tracking and monitoring
- Scalable production-ready system

---

**Need help?** Check the documentation files or run the verification SQL queries to debug.

**Ready to start?** Begin with Step 1 (Database Migration) above! 🚀
