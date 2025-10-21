# 🚀 AI Analysis Quick Start Guide

## ✅ Current Status

- ✅ OpenAI API key configured in `.env`
- ✅ All AI code committed to Git
- ⏳ **NEXT STEP**: Run database migration

---

## 📋 Quick Setup (3 Steps)

### **Step 1: Run Database Migration**

Choose ONE of these methods:

#### **Option A: Supabase Dashboard (EASIEST - RECOMMENDED)**

1. Go to: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/sql
2. Click "+ New Query"
3. Open file: `supabase/migrations/20250122_ai_analyses.sql`
4. Copy ALL content and paste into SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. Wait for success message ✅

#### **Option B: Install Supabase CLI**

```bash
# Install via npm
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref uypdmcgybpltogihldhu

# Run migration
supabase db push
```

### **Step 2: Verify Migration**

Run this in Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_analyses', 'ai_insights', 'ai_call_logs');
```

✅ Should return 3 rows

### **Step 3: Start Dev Server**

```bash
cd "C:\Users\GOPIKA ARAVIND\TechPulse"
npm run dev
```

---

## 🧪 Test AI Analysis

### **Method 1: Create Test Page**

Create `src/app/test-ai/page.tsx`:

```typescript
'use client';

import AIAnalysisSummary from '@/components/ai/AIAnalysisSummary';

export default function TestAI() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">AI Analysis Test</h1>
      <AIAnalysisSummary
        companyId="YOUR_COMPANY_UUID_HERE"
        companyName="Test Company"
      />
    </div>
  );
}
```

Visit: `http://localhost:5173/test-ai`

### **Method 2: Test API Directly**

Get a company UUID from your database, then:

```bash
curl http://localhost:3000/api/ai/company/YOUR_COMPANY_UUID/analysis
```

---

## 🔑 Create Admin User (for triggering analysis)

1. Go to: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/auth/users
2. Click "Add User"
3. Enter email and password
4. Go to: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/editor/profiles
5. Find your user and set `role = 'admin'`

---

## 📊 Trigger First Analysis

Login as admin, then use this curl command:

```bash
# Replace YOUR_ACCESS_TOKEN and YOUR_COMPANY_UUID
curl -X POST http://localhost:3000/api/ai/analyze-company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "company_id": "YOUR_COMPANY_UUID",
    "analysis_types": ["transparency", "ethics", "risk"]
  }'
```

Expected cost: ~$0.30 per company

---

## 📁 Important Files

- **Setup Guide**: `docs/SETUP_AI_COMPLETE_GUIDE.md` (detailed)
- **Technical Docs**: `docs/AI_SETUP.md`
- **Migration File**: `supabase/migrations/20250122_ai_analyses.sql`
- **Environment**: `.env` (contains API key)

---

## 💰 Cost Monitoring

Check costs in Supabase SQL Editor:

```sql
-- Total cost last 30 days
SELECT ROUND(SUM(cost)::NUMERIC, 2) as total_usd
FROM ai_call_logs
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "OpenAI API key not configured" | Restart dev server (`Ctrl+C` then `npm run dev`) |
| "Table ai_analyses does not exist" | Run migration (Step 1) |
| "Insufficient quota" | Add payment method at https://platform.openai.com/account/billing |
| "Unauthorized" when triggering | Create admin user (see above) |

---

## ✨ What's Included

- ✅ **Transparency Analysis**: Scores 0-10, strengths, concerns
- ✅ **Ethics Evaluation**: Red flags, positive actions
- ✅ **Risk Assessment**: 7 risk categories with severity
- ✅ **AI Insights**: Auto-generated actionable insights
- ✅ **Cost Tracking**: Monitor OpenAI API spending
- ✅ **Rate Limiting**: 10 analyses/hour per admin
- ✅ **Caching**: 24-hour expiration to save costs
- ✅ **Frontend Components**: Ready-to-use React components

---

## 📞 Need Help?

See `docs/SETUP_AI_COMPLETE_GUIDE.md` for:
- Detailed troubleshooting
- Advanced configuration
- Production deployment
- Cost optimization tips

---

**Ready to analyze companies with AI! 🎉**
