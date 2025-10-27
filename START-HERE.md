# 🚀 START HERE - TechPulze MVP

## ⚡ Quick Start (5 Steps)

### Step 1: Install Dependencies (5 min)

Open PowerShell or Command Prompt:

```bash
cd "C:\Users\GOPIKA ARAVIND\TechPulze"
npm install
```

Wait for all packages to install (~2-3 minutes).

---

### Step 2: Set Up Supabase Database (10 min)

1. **Create Supabase Account**
   - Go to: https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub/Google

2. **Create New Project**
   - Click "New Project"
   - Name: `techpulze`
   - Database Password: (choose a strong password)
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for provisioning

3. **Run Database Schema**
   - In Supabase dashboard, click "SQL Editor" (left sidebar)
   - Click "New Query"
   - Open `supabase-schema.sql` from this directory
   - Copy ALL contents
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Should see: "Success. No rows returned"

4. **Get API Credentials**
   - Click "Settings" (left sidebar)
   - Click "API"
   - Copy these 2 values:
     - `Project URL` (starts with https://)
     - `anon public` key (starts with eyJhbGc...)
     - `service_role` key (starts with eyJhbGc... - **KEEP SECRET!**)

---

### Step 3: Configure Environment Variables (5 min)

1. **Copy Template**
```bash
copy .env.local.example .env.local
```

2. **Edit .env.local**

Open `.env.local` in Notepad and fill in:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_role_key_here

# Redis (OPTIONAL - Leave commented out for now)
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=

# OpenAI (OPTIONAL - Leave commented out for now)
# OPENAI_API_KEY=

# App URL (Local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Replace the `xxx` values with your actual Supabase credentials from Step 2.

Save the file.

---

### Step 4: Run Development Server (2 min)

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 15.0.3
  - Local:        http://localhost:3000
  - Ready in 2.1s
```

---

### Step 5: Test the Application (5 min)

Open your browser and visit these pages:

**1. Landing Page**
```
http://localhost:3000
```
✅ Should see: Hero, stats, top companies

**2. Company Directory**
```
http://localhost:3000/companies
```
✅ Should see: 5 sample companies (OpenAI, Google, Meta, Microsoft, Amazon)

**3. Company Profile**
```
http://localhost:3000/companies/openai
```
✅ Should see: OpenAI profile with scores

**4. Create Account**
```
http://localhost:3000/signup
```
✅ Fill in: username, email, password
✅ Click "Create account"
✅ Should redirect to login

**5. Login**
```
http://localhost:3000/login
```
✅ Enter your credentials
✅ Should redirect to dashboard

**6. Dashboard**
```
http://localhost:3000/dashboard
```
✅ Should see: Your stats, empty reviews, empty following

**7. Write a Review**
- Go to Companies
- Click on any company
- Click "Write Review" button
- Fill in ratings and review
- Submit
- Check dashboard - should see your review as "pending"

---

## 🎉 Success! You're Running TechPulze!

### What Works Now

✅ Browse companies
✅ View company profiles
✅ Create account
✅ Login/Logout
✅ Write reviews
✅ Follow companies
✅ Earn points
✅ View dashboard

### What's Optional

**Redis Caching** (For better performance)
- Sign up: https://upstash.com
- Create Redis database
- Copy REST URL and Token to `.env.local`

**OpenAI AI Scoring** (For AI-powered ethics analysis)
- Sign up: https://platform.openai.com
- Create API key
- Add to `.env.local` as `OPENAI_API_KEY`
- Go to `/companies/openai` (any company)
- You can manually trigger AI scoring via API

---

## 🔧 Troubleshooting

### Error: "Cannot find module"
```bash
# Solution: Install dependencies again
npm install
```

### Error: "Invalid Supabase credentials"
```bash
# Solution: Double-check .env.local
# Make sure you copied the ENTIRE key (it's very long)
# No spaces before/after the =
```

### Error: "Database connection failed"
```bash
# Solution: Check Supabase project is running
# Go to dashboard.supabase.com
# Make sure project shows as "Active"
```

### Error: Port 3000 already in use
```bash
# Solution: Kill the process or use different port
npm run dev -- -p 3001
# Then visit http://localhost:3001
```

### Reviews not showing
```bash
# Solution: Reviews are "pending" by default
# You need to approve them in Supabase:
# 1. Go to Supabase dashboard
# 2. Click "Table Editor"
# 3. Click "reviews" table
# 4. Find your review
# 5. Change "status" from "pending" to "approved"
# 6. Refresh the company page
```

---

## 📚 Documentation

**Full Documentation:**
- `README.md` - Complete feature guide
- `QUICK-START.md` - Detailed setup guide
- `MVP-COMPLETION-SUMMARY.md` - What was built
- `BUILD-STATUS.md` - Development progress

**Database:**
- `supabase-schema.sql` - Database schema with seed data

---

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Then add environment variables in Vercel dashboard.

### Option 2: GitHub + Vercel

1. Create GitHub repository
2. Push code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/techpulze.git
git push -u origin main
```
3. Go to vercel.com → Import project
4. Add environment variables
5. Deploy!

---

## 💡 Pro Tips

1. **Test with Real Data**
   - Create multiple user accounts
   - Write reviews for different companies
   - Test the follow/unfollow feature

2. **Check Database**
   - Supabase dashboard → Table Editor
   - See all your data in real-time
   - Manually approve reviews

3. **Monitor Performance**
   - Open browser DevTools (F12)
   - Check Network tab for API calls
   - Look for errors in Console

4. **Customize**
   - Edit colors in `tailwind.config.ts`
   - Modify text in pages
   - Add more seed companies in SQL

---

## 🎯 Next Actions

### Essential
- [ ] Install dependencies
- [ ] Set up Supabase
- [ ] Configure .env.local
- [ ] Test locally

### Optional
- [ ] Set up Redis (performance boost)
- [ ] Add OpenAI key (AI scoring)
- [ ] Customize branding
- [ ] Add more companies

### When Ready
- [ ] Deploy to Vercel
- [ ] Set up custom domain
- [ ] Configure OAuth providers
- [ ] Share with users!

---

## ❓ Need Help?

**Common Issues:**
- Database not connecting? → Check Supabase project is active
- TypeScript errors? → Run `npm install` again
- Build failing? → Check all environment variables are set
- Reviews not showing? → Approve them in Supabase Table Editor

**Documentation:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs

---

## 🎊 You Did It!

Your TechPulze MVP is ready to go!

**What you have:**
✅ Full-stack web application
✅ AI-powered ethics ratings
✅ User authentication
✅ Database with RLS
✅ Beautiful UI
✅ Gamification system
✅ Production-ready code

**Time to:**
🚀 Launch
📈 Get users
💡 Iterate
🌟 Succeed!

---

**Questions? Issues? Suggestions?**

Check the other markdown files in this directory for detailed information.

**Happy coding! 🎉**
