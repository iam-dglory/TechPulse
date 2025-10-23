# TexhPulze Vercel Serverless Backend Setup

**Platform:** Vercel Serverless Functions + Supabase PostgreSQL
**Cost:** 100% FREE
**Status:** ✅ Code Ready, Database Setup Required

---

## 🎯 What We've Done

I've converted your Express backend to Vercel serverless functions. Both frontend and backend will now be hosted on Vercel for free!

### ✅ Created API Endpoints:
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/posts` - List all posts
- `POST /api/posts` - Create new post (protected)
- `GET /api/posts/[id]` - Get single post
- `POST /api/posts/[id]/vote` - Vote on post (protected)

---

## 🚀 Setup Instructions (10 minutes)

### Step 1: Create Database Tables in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/uypdmcgybpltogihldhu

2. Click **"SQL Editor"** in the left sidebar

3. Click **"New Query"**

4. Open the file `supabase-migration.sql` in this project

5. **Copy ALL the SQL** from that file

6. **Paste** into the Supabase SQL Editor

7. Click **"Run"** (or press Ctrl+Enter)

8. You should see: **"Success. No rows returned"**

This creates the `posts`, `comments`, and `votes` tables with proper indexes and security policies.

---

### Step 2: Update Vercel Environment Variables

We need to add the Supabase credentials to Vercel:

```bash
cd "C:\Users\GOPIKA ARAVIND\TechPulse"

# Add Supabase URL
echo "https://uypdmcgybpltogihldhu.supabase.co" | vercel env add VITE_SUPABASE_URL production

# Add Supabase Anon Key
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cGRtY2d5YnBsdG9naWhsZGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MjYxNDMsImV4cCI6MjA3NjQwMjE0M30.b-NUHk_ziPyVhafKZr654S2tOia1uSkppq172RXRYAw" | vercel env add VITE_SUPABASE_ANON_KEY production

# Remove old API URL (if exists)
vercel env rm VITE_API_URL production

# Add new API URL (relative path, same domain)
echo "/api" | vercel env add VITE_API_URL production
```

---

### Step 3: Deploy to Vercel

```bash
# Make sure all changes are committed
git add .
git commit -m "Add Vercel serverless backend with Supabase"
git push origin main

# Deploy to production
vercel --prod
```

Wait ~2 minutes for deployment to complete.

---

### Step 4: Verify Deployment

1. **Test Health Endpoint:**
   - Visit: https://www.texhpulze.com/api/health
   - Expected:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-23T...",
     "service": "TexhPulze API",
     "platform": "Vercel Serverless",
     "database": "Supabase PostgreSQL"
   }
   ```

2. **Test Posts API:**
   - Visit: https://www.texhpulze.com/api/posts
   - Should see sample posts array

3. **Check Browser Console:**
   - Visit: https://www.texhpulze.com
   - Open DevTools (F12)
   - Should see successful API calls
   - No CORS errors

---

## 📊 Architecture Overview

### Before (Not Working):
```
Frontend (Vercel) → Backend (Render - NOT DEPLOYED) → Database (???)
     ❌ Backend doesn't exist
```

### After (Working):
```
Frontend (Vercel) → Backend (Vercel Serverless) → Database (Supabase)
     ✅ Everything on free platforms
     ✅ Same domain (no CORS issues)
     ✅ Instant deployment
```

---

## 🔧 How It Works

### Serverless Functions
Each API file in `/api` folder becomes an endpoint:
- `api/health.js` → `/api/health`
- `api/posts/index.js` → `/api/posts`
- `api/posts/[id].js` → `/api/posts/123`
- `api/posts/[id]/vote.js` → `/api/posts/123/vote`

### Database Connection
- Uses Supabase client library
- Authenticates with Supabase Auth
- Row Level Security (RLS) protects data
- Users can only modify their own posts

### Authentication
- Managed by Supabase Auth (already working in your frontend)
- JWT tokens validated in serverless functions
- No session storage needed

---

## 💰 Cost Comparison

### Render (Original Plan)
- ❌ Backend: Requires payment
- ❌ Database: $7/month minimum
- **Total:** $7+/month

### Vercel + Supabase (New Setup)
- ✅ Frontend: FREE (100GB bandwidth)
- ✅ Backend: FREE (100GB-hours serverless)
- ✅ Database: FREE (500MB, 2GB bandwidth)
- **Total:** $0/month

---

## 🎯 API Endpoint Details

### Public Endpoints (No Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/posts` | GET | List posts (?sort=hot\|top&limit=20) |
| `/api/posts/[id]` | GET | Get single post |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |

### Protected Endpoints (Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/profile` | GET | Get user profile |
| `/api/posts` | POST | Create new post |
| `/api/posts/[id]/vote` | POST | Vote on post |

**Authentication:** Include `Authorization: Bearer <token>` header

---

## 🔍 Troubleshooting

### "Table does not exist" error
**Solution:** Run the SQL migration in Supabase SQL Editor (Step 1)

### "Missing Supabase credentials" error
**Solution:** Add environment variables in Vercel (Step 2)

### API returns 404
**Solution:** Ensure `vercel.json` includes API rewrites (already done)

### CORS errors
**Solution:** API is on same domain, no CORS issues! (already handled)

### "Unauthorized" errors
**Solution:** Check that Supabase Auth is working in frontend

---

## 📝 Files Created

### API Routes
- `api/health.js` - Health check
- `api/_lib/supabase.js` - Supabase client utility
- `api/auth/register.js` - Registration endpoint
- `api/auth/login.js` - Login endpoint
- `api/auth/profile.js` - Profile endpoint
- `api/posts/index.js` - List/create posts
- `api/posts/[id].js` - Get single post
- `api/posts/[id]/vote.js` - Vote on post

### Configuration
- `vercel.json` - Updated with API rewrites
- `supabase-migration.sql` - Database schema
- `.env` - Updated API URL to `/api`

---

## 🚨 Important Notes

1. **Don't delete the `/backend` folder yet** - Keep it as backup
2. **API URL is now relative (`/api`)** - Same domain as frontend
3. **No CORS configuration needed** - Same-origin requests
4. **Supabase handles authentication** - No custom auth needed
5. **Row Level Security enabled** - Users can only modify their own data

---

## 🎓 Next Steps After Deployment

1. ✅ Test user registration
2. ✅ Test user login
3. ✅ Test creating a post
4. ✅ Test voting on posts
5. ✅ Monitor Vercel logs for errors
6. ✅ Check Supabase database for data

---

## 📞 Support

### Vercel Dashboard
- https://vercel.com/gopikaaravind2003-1188s-projects/texh-pulze
- View logs, deployments, environment variables

### Supabase Dashboard
- https://supabase.com/dashboard/project/uypdmcgybpltogihldhu
- View database, authentication, logs

### Quick Commands
```bash
# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

---

**Status:** ✅ Backend code ready, awaiting database setup
**Last Updated:** October 23, 2025
**Deployment Time:** ~10 minutes total
