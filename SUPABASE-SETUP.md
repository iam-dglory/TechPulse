# TexhPulze Supabase Setup Guide

Complete guide to setting up Supabase for TexhPulze alongside your existing Render backend.

## 📋 Overview

**Architecture:**
- **Render Backend:** Handles news aggregation, API endpoints
- **Supabase:** Provides database, authentication, real-time features

This hybrid approach gives you the best of both worlds!

---

## 🚀 Step 1: Create Supabase Project

### 1.1 Sign Up / Sign In

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign in with GitHub (recommended) or email

### 1.2 Create New Project

1. Click **"New Project"**
2. Select your organization (or create one)
3. Fill in project details:
   - **Project Name:** `TexhPulze`
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., `US East`)
   - **Pricing Plan:** Free tier is fine to start
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

---

## 🔑 Step 2: Get API Credentials

### 2.1 Access Project Settings

1. In your Supabase dashboard
2. Click **Settings** (⚙️ icon in sidebar)
3. Click **"API"** in the left menu

### 2.2 Copy Credentials

You'll see two important values:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```

**anon/public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT:**
- ✅ **anon key** is safe for client-side (public)
- ❌ **service_role key** must NEVER be exposed (server-only)

---

## 📝 Step 3: Update Environment Variables

### 3.1 Local Development

1. Open your `.env` file
2. Replace the placeholder values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Vercel Production

1. Go to https://vercel.com/dashboard
2. Select your **TexhPulze project**
3. Click **Settings** → **Environment Variables**
4. Add these variables:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` | ✅ All |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` | ✅ All |

5. Click **"Save"**
6. **Redeploy** your application

---

## 🗄️ Step 4: Create Database Schema

### 4.1 Access SQL Editor

1. In Supabase dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **"New query"**

### 4.2 Create Tables

Copy and paste this SQL schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('citizen', 'researcher', 'policymaker', 'government', 'admin')) DEFAULT 'citizen',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create articles table (synced from Render backend)
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create grievances table
CREATE TABLE IF NOT EXISTS public.grievances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_grievances_user_id ON public.grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON public.grievances(status);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON public.discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Articles policies (public read)
CREATE POLICY "Articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (true);

-- Grievances policies
CREATE POLICY "Grievances viewable by everyone"
  ON public.grievances FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create grievances"
  ON public.grievances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grievances"
  ON public.grievances FOR UPDATE
  USING (auth.uid() = user_id);

-- Discussions policies
CREATE POLICY "Discussions viewable by everyone"
  ON public.discussions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussions"
  ON public.discussions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discussions"
  ON public.discussions FOR UPDATE
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grievances_updated_at BEFORE UPDATE ON public.grievances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click **"Run"** (or press `Ctrl/Cmd + Enter`)
5. ✅ Should see "Success. No rows returned"

---

## 🔐 Step 5: Configure Authentication

### 5.1 Email Settings

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure:
   - ✅ Enable email provider
   - ✅ Confirm email (recommended)
   - Email templates (customize later)

### 5.2 OAuth Providers (Optional)

Enable social login:
- **Google:** Configure OAuth credentials
- **GitHub:** Configure OAuth app
- **Twitter/X:** Configure OAuth

---

## ✅ Step 6: Test Connection

### 6.1 Test in Your App

Create a test component:

```typescript
import { useEffect, useState } from 'react';
import { testSupabaseConnection } from './lib/supabase';

function SupabaseTest() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    async function test() {
      const result = await testSupabaseConnection();
      setStatus(result);
    }
    test();
  }, []);

  return (
    <div>
      <h2>Supabase Connection Test</h2>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
```

### 6.2 Expected Output

```json
{
  "success": true,
  "message": "Supabase connection successful",
  "data": {
    "connected": true,
    "authenticated": false,
    "url": "https://xxxxx.supabase.co",
    "timestamp": "2025-10-21T..."
  }
}
```

---

## 📚 Step 7: Usage Examples

### Query Data

```typescript
import { supabase } from './lib/supabase';

// Get articles
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('category', 'AI')
  .order('published_at', { ascending: false })
  .limit(10);
```

### Authentication

```typescript
import { supabase } from './lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign out
await supabase.auth.signOut();
```

### Real-time Subscriptions

```typescript
import { supabase } from './lib/supabase';

// Subscribe to new discussions
const channel = supabase
  .channel('discussions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'discussions',
    },
    (payload) => {
      console.log('New discussion:', payload);
    }
  )
  .subscribe();
```

---

## 🔍 Troubleshooting

### Error: "Missing environment variables"

**Fix:**
- Check `.env` file has correct values
- Restart development server: `npm run dev`
- Verify no typos in variable names

### Error: "Invalid API key"

**Fix:**
- Copy anon key again from Supabase dashboard
- Ensure you copied the full key (very long string)
- Check for extra spaces

### Error: "relation does not exist"

**Fix:**
- Run the SQL schema from Step 4.2
- Ensure tables were created successfully

### Connection timeout

**Fix:**
- Check internet connection
- Verify Supabase URL is correct
- Check Supabase project status

---

## 📊 Next Steps

- [ ] Set up authentication UI
- [ ] Create API hooks for data fetching
- [ ] Implement real-time features
- [ ] Add file storage (Supabase Storage)
- [ ] Configure email templates
- [ ] Set up database backups
- [ ] Monitor usage in Supabase dashboard

---

## 🔗 Resources

- **Supabase Docs:** https://supabase.com/docs
- **API Reference:** https://supabase.com/docs/reference/javascript
- **Dashboard:** https://app.supabase.com
- **Community:** https://github.com/supabase/supabase/discussions

---

**Status:** ✅ Supabase infrastructure ready!
**Next:** Start building features with database and auth!
