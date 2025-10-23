# TexhPulze Backend Deployment Guide

**Date:** October 23, 2025
**Status:** ⚠️ Backend Not Deployed - Action Required

---

## 🚨 Critical Issues Identified

### ❌ Backend Service Not Running
- **URL:** https://texhpulze.onrender.com
- **Status:** Not responding (HTTP 000)
- **Impact:** All frontend API calls are failing
- **Root Cause:** Backend has not been deployed to Render

### ✅ CORS Configuration Fixed
- Added production domains: `https://www.texhpulze.com` and `https://texhpulze.com`
- Added error logging and 404 handler
- Changes committed to GitHub (commit: 434c995)

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ GitHub account with TechPulse repository access
2. ✅ Render account (sign up at https://render.com)
3. ✅ Backend code pushed to GitHub (✅ DONE)

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `texhpulze-db`
   - **Database:** `texhpulze`
   - **User:** (auto-generated)
   - **Region:** Choose closest to your users (e.g., Oregon USA)
   - **Plan:** Free (or paid for better performance)
4. Click **"Create Database"**
5. Wait for provisioning (~2 minutes)
6. **COPY** the **"Internal Database URL"** (starts with `postgres://`)
   - Example: `postgres://user:password@dpg-xxxxx.oregon-postgres.render.com/texhpulze`

---

### Step 2: Deploy Backend Service on Render

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** (if not already connected)
3. Select your repository: **`TechPulse`** (or `iam-dglory/TechPulse`)
4. Configure the service:

   **Basic Settings:**
   - **Name:** `texhpulze-backend`
   - **Region:** Same as your database (e.g., Oregon)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`

   **Build & Deploy:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - (This runs `node src/server.render.js` from package.json)

   **Plan:**
   - Select **Free** (or paid for better uptime)

5. Click **"Advanced"** and add **Environment Variables**:

   | Variable Name | Value | Description |
   |---------------|-------|-------------|
   | `DATABASE_URL` | `postgres://user:password@dpg-xxxxx...` | Paste the Internal Database URL from Step 1 |
   | `NODE_ENV` | `production` | Sets environment to production |
   | `PORT` | (leave blank) | Render auto-provides this |

6. Click **"Create Web Service"**

7. **Wait for deployment** (~5 minutes)
   - You'll see build logs in real-time
   - Look for: ✅ "Your service is live 🎉"

---

### Step 3: Verify Backend Deployment

1. Once deployed, Render will provide a URL like:
   - `https://texhpulze-backend.onrender.com`

2. **Test the health endpoint:**
   - Open browser: `https://texhpulze-backend.onrender.com/health`
   - Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-23T...",
     "service": "TexhPulze API",
     "version": "1.0.0",
     "database": "PostgreSQL Connected",
     "environment": "production"
   }
   ```

3. **Check the logs:**
   - In Render dashboard → Your service → "Logs" tab
   - Look for:
   ```
   🚀 TexhPulze Render Server Started!
   ✅ Server running on port: 10000
   ✅ PostgreSQL Database Connected
   ✅ Database tables initialized successfully
   ```

---

### Step 4: Update Frontend Environment Variable

Now that the backend is deployed, connect the frontend to it:

1. **Get your backend URL** from Render (e.g., `https://texhpulze-backend.onrender.com`)

2. **Update Vercel environment variable:**
   ```bash
   # In your terminal/command prompt
   cd C:\Users\GOPIKA ARAVIND\TechPulse

   # Add/update the production API URL
   echo "https://texhpulze-backend.onrender.com/api" | vercel env add VITE_API_URL production
   ```

3. **Redeploy frontend:**
   ```bash
   vercel --prod
   ```

4. Wait for deployment (~2 minutes)

---

### Step 5: Test End-to-End Functionality

1. **Visit:** https://www.texhpulze.com

2. **Test registration:**
   - Click "Sign Up"
   - Create account
   - Check if API call succeeds (no CORS errors in browser console)

3. **Check browser console (F12):**
   - Should see successful API calls to `https://texhpulze-backend.onrender.com/api`
   - No CORS errors
   - No 404 errors

4. **Test API endpoints:**
   - GET Posts: `https://texhpulze-backend.onrender.com/api/posts`
   - Should return posts array (may be empty if no data)

---

## 📊 Backend API Endpoints Reference

### System Endpoints
- `GET /` - Root endpoint with branding HTML
- `GET /health` - Health check (public)

### Authentication (`/api/auth/*`)
- `POST /api/auth/register` - User registration (public)
  - Body: `{ email, password, username, fullName }`
- `POST /api/auth/login` - User login (public)
  - Body: `{ email, password }`
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/preferences` - Update preferences (protected)

### Posts/Grievances (`/api/posts/*`)
- `GET /api/posts` - List all posts (public)
  - Query params: `?sort=hot|top&limit=20`
- `GET /api/posts/:id` - Get single post (public)
- `POST /api/posts` - Create new post (protected)
  - Body: `{ title, content, type, category, criticality, ai_risk_score, location, tags }`
- `POST /api/posts/:id/vote` - Vote on post (protected)
  - Body: `{ vote_type: "up"|"down" }`

**Protected routes** require `Authorization: Bearer <token>` header.

---

## 🔧 Troubleshooting

### Backend Returns 000 Error
**Cause:** Service not deployed or not running
**Fix:** Follow Step 2 to deploy backend

### CORS Errors in Browser Console
**Cause:** Backend doesn't allow frontend domain
**Fix:** Already fixed in latest code (commit 434c995). Redeploy backend.

### Database Connection Failed
**Cause:** Missing or invalid `DATABASE_URL`
**Fix:**
1. Check Render logs for exact error
2. Verify `DATABASE_URL` in environment variables
3. Ensure database is running (check Render PostgreSQL dashboard)

### 404 Errors for API Routes
**Cause:** Frontend pointing to wrong backend URL
**Fix:** Update `VITE_API_URL` in Vercel (Step 4)

### Backend Logs Show "Fallback Mode"
**Cause:** Database not connected, using in-memory storage
**Impact:** Data will be lost on restart
**Fix:** Add correct `DATABASE_URL` environment variable

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed to Render
- [ ] PostgreSQL database created and connected
- [ ] Health endpoint returns 200 OK
- [ ] Backend logs show "PostgreSQL Database Connected"
- [ ] Frontend environment variable updated with backend URL
- [ ] Frontend redeployed
- [ ] CORS working (no errors in browser console)
- [ ] User registration working
- [ ] User login working
- [ ] Posts API returning data

---

## 📝 Important Files

### Backend Configuration
- `backend/package.json` - Dependencies and scripts
- `backend/src/server.render.js` - Main server file (uses this for Render)
- `backend/src/config/database.render.js` - PostgreSQL configuration
- `backend/env.example` - Example environment variables

### Deployment Files
- `.github/workflows/` - CI/CD (if exists)
- `backend/Dockerfile.production` - Docker config (optional)

---

## 🔐 Security Considerations

### Environment Variables
**NEVER** commit these to GitHub:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - For token signing (if using JWT)
- `NEWS_API_KEY` - For news aggregation
- `GUARDIAN_API_KEY` - For Guardian API

**Always** store them in:
- Render: Dashboard → Service → Environment Variables
- Local: `backend/.env` (gitignored)

### Database Access
- Use **Internal Database URL** for backend connection (faster, more secure)
- Use **External Database URL** only for admin tools (pgAdmin, DBeaver)

### CORS
- Currently allows multiple origins for flexibility
- In production, consider restricting to only production domains

---

## 📞 Support & Monitoring

### Render Dashboard
- **Backend Service:** https://dashboard.render.com/web/YOUR_SERVICE_ID
- **Database:** https://dashboard.render.com/postgres/YOUR_DB_ID
- **Logs:** Service → Logs tab (real-time)
- **Metrics:** Service → Metrics tab (CPU, memory, requests)

### Monitoring Recommendations
1. Set up Render email alerts for service failures
2. Monitor database storage usage (free tier: 1GB limit)
3. Check logs regularly for errors
4. Set up uptime monitoring (e.g., UptimeRobot, Pingdom)

### Free Tier Limitations
- **Render Web Service (Free):**
  - Spins down after 15 minutes of inactivity
  - First request after spin-down may take 30-60 seconds
  - 750 hours/month runtime
- **Render PostgreSQL (Free):**
  - 1GB storage
  - Expires after 90 days
  - Shared CPU/RAM

**Recommendation:** Upgrade to paid plans for production use.

---

## 🚀 Next Steps After Deployment

1. **Test all features** on production
2. **Monitor logs** for errors
3. **Set up database backups** (Render provides automatic backups on paid plans)
4. **Configure custom domain** for backend (optional)
   - E.g., `api.texhpulze.com` → `https://texhpulze-backend.onrender.com`
5. **Enable HTTPS** for all API calls (Render provides this automatically)
6. **Add rate limiting** to prevent abuse
7. **Set up monitoring/alerting** (Sentry, Logtail, etc.)

---

## 📚 Additional Resources

- **Render Docs:** https://render.com/docs
- **Render PostgreSQL Guide:** https://render.com/docs/databases
- **Node.js Deployment:** https://render.com/docs/deploy-node-express-app
- **Environment Variables:** https://render.com/docs/environment-variables
- **Troubleshooting:** https://render.com/docs/troubleshooting-deploys

---

**Generated:** October 23, 2025
**Status:** ✅ CORS Fixed, ⚠️ Deployment Pending
**Last Updated:** Commit 434c995
