# 🚀 Database Migration Instructions

## ⚡ Quick Start - Run Migration in 3 Minutes

### **Step 1: Open Supabase SQL Editor**

Click this link to open SQL Editor:
👉 **https://supabase.com/dashboard/project/uypdmcgybpltogihldhu/sql**

### **Step 2: Create New Query**

1. Click the **"+ New Query"** button
2. You'll see an empty SQL editor

### **Step 3: Copy Migration SQL**

Open the file: `supabase/migrations/20250122_ai_analyses.sql`

**Or use this path:**
```
C:\Users\GOPIKA ARAVIND\TechPulse\supabase\migrations\20250122_ai_analyses.sql
```

Copy **ALL** content from that file (420 lines).

### **Step 4: Paste and Run**

1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** button (or press `Ctrl+Enter`)
3. Wait for the success message (should take 5-10 seconds)

---

## ✅ Verify Migration Success

After running the migration, verify it worked by running this SQL:

```sql
-- Check tables exist
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns
        WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_analyses', 'ai_insights', 'ai_call_logs')
ORDER BY table_name;
```

**Expected Result:**
```
table_name      | column_count
----------------|-------------
ai_analyses     | 9
ai_call_logs    | 9
ai_insights     | 9
```

If you see 3 rows with these names, ✅ **migration successful!**

---

## 📊 What Was Created

The migration creates:

### **3 Tables:**
1. **ai_analyses** - Stores AI analysis results (transparency, ethics, risk)
2. **ai_insights** - Stores individual insights (strengths, concerns, red flags)
3. **ai_call_logs** - Tracks API usage and costs

### **4 Functions:**
1. `get_latest_ai_analysis(company_id, analysis_type)` - Get latest analysis
2. `generate_ai_insights_summary(company_id)` - Summarize all insights
3. `cleanup_expired_ai_analyses()` - Remove old analyses
4. `get_ai_analysis_stats()` - Admin dashboard stats

### **Row Level Security (RLS):**
- Public can read analyses and insights
- Authenticated users can create analyses
- Admins can update/delete
- Call logs are admin-only

---

## 🔧 Alternative: Manual Table Creation

If the migration file doesn't work, you can create tables manually:

### **Create ai_analyses table:**

```sql
CREATE TABLE public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('transparency', 'ethics', 'risk', 'promise', 'news', 'comprehensive')),
  analysis_data JSONB NOT NULL,
  score DECIMAL(4,2),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_analyses_company_id ON public.ai_analyses(company_id);
CREATE INDEX idx_ai_analyses_type ON public.ai_analyses(analysis_type);
CREATE INDEX idx_ai_analyses_expires ON public.ai_analyses(expires_at);
```

### **Create ai_insights table:**

```sql
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('strength', 'concern', 'red_flag', 'opportunity', 'risk', 'positive')),
  title TEXT NOT NULL CHECK (LENGTH(title) >= 5 AND LENGTH(title) <= 200),
  description TEXT NOT NULL CHECK (LENGTH(description) >= 10 AND LENGTH(description) <= 1000),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_company_id ON public.ai_insights(company_id);
CREATE INDEX idx_ai_insights_type ON public.ai_insights(insight_type);
```

### **Create ai_call_logs table:**

```sql
CREATE TABLE public.ai_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_type TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  success BOOLEAN NOT NULL,
  cost DECIMAL(10,6),
  duration_ms INTEGER,
  error TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_call_logs_type ON public.ai_call_logs(analysis_type);
CREATE INDEX idx_ai_call_logs_created ON public.ai_call_logs(created_at DESC);
```

---

## 🐛 Troubleshooting

### **Error: "relation companies does not exist"**

**Solution:** Make sure you have the `companies` table created first. The AI tables reference it via foreign keys.

### **Error: "permission denied"**

**Solution:** Use the Supabase Dashboard SQL Editor (you're logged in as admin there). Don't use the anon key from code.

### **Error: "function uuid_generate_v4 does not exist"**

**Solution:** The migration file includes enabling the UUID extension. If it still fails, run:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Then re-run the migration.

---

## 📞 Next Steps After Migration

1. ✅ **Verify tables exist** (run verification SQL above)
2. 🚀 **Start your dev server**: `npm run dev`
3. 👤 **Create admin user** in Supabase Dashboard
4. 🧪 **Test AI analysis** using the test page or API
5. 💰 **Monitor costs** in `ai_call_logs` table

---

## 📚 Full Documentation

For detailed setup instructions, see:
- **Quick Start**: `AI_QUICK_START.md`
- **Complete Guide**: `docs/SETUP_AI_COMPLETE_GUIDE.md`
- **Technical Docs**: `docs/AI_SETUP.md`

---

**Ready to run the migration? 🎉**

Just open the Supabase SQL Editor and paste the migration file!
