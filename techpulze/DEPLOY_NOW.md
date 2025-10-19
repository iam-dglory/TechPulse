# =€ Deploy TechPulze to www.techpulze.com NOW!

## Quick 15-Minute Deployment Guide

This guide will get your voting system live at **www.techpulze.com** in 15 minutes.

---

## ¡ Option 1: Deploy via Vercel Dashboard (Easiest - No CLI)

### Step 1: Prepare Code (2 minutes)

```bash
# Open PowerShell in your techpulze folder
cd C:\Users\GOPIKA ARAVIND\my-netfolio\techpulze

# Test production build
npm run build

# If build succeeds, continue!
```

### Step 2: Push to GitHub (3 minutes)

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "feat: add 5-dimensional voting system for production"

# Create GitHub repo at: https://github.com/new
# Name it: techpulze

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/techpulze.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel (5 minutes)

1. **Go to:** https://vercel.com/signup
2. **Sign up** with your GitHub account
3. **Click:** "Add New..." ’ "Project"
4. **Import** your `techpulze` repository
5. **Configure:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. **Add Environment Variables:** (Click "Environment Variables")
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://uypdmcgybpltogihldhu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
   ```
7. **Click:** "Deploy"
8. **Wait** 2-3 minutes for deployment

### Step 4: Configure Custom Domain (5 minutes)

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" ’ "Domains"
   - Click "Add Domain"
   - Enter: `techpulze.com`
   - Click "Add"

2. **Vercel will show DNS instructions**

3. **Go to your domain registrar** (GoDaddy, Namecheap, etc.)
   - Add these DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

4. **Wait 5-30 minutes** for DNS propagation

5. **Done!** Your site will be live at https://techpulze.com

---

## ¡ Option 2: Deploy via CLI (Advanced - Faster)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# Navigate to project
cd C:\Users\GOPIKA ARAVIND\my-netfolio\techpulze

# Deploy to production
vercel --prod
```

### Step 4: Follow prompts:
- Link to existing project? **No**
- Project name: **techpulze**
- Directory: **./**
- Override settings? **No**

### Step 5: Add Environment Variables

```bash
# Add Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Add Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Add Service Role Key
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### Step 6: Redeploy with env vars

```bash
vercel --prod
```

### Step 7: Configure Domain (same as Option 1, Step 4)

---

## =Ë Pre-Deployment Checklist

Before deploying, make sure:

- [] Local build works: `npm run build`
- [] Supabase tables created (votes, companies, user_profiles)
- [] Environment variables documented
- [] Code is committed to Git
- [] No sensitive data in code
- [] `.env.local` is in `.gitignore`

---

## = Required Environment Variables

Set these in Vercel Dashboard ’ Settings ’ Environment Variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://uypdmcgybpltogihldhu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Get from Supabase dashboard
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...      # Get from Supabase dashboard

# Site URL (Optional but recommended)
NEXT_PUBLIC_SITE_URL=https://techpulze.com
```

**Where to get Supabase keys:**
1. Go to: https://app.supabase.com
2. Select your project
3. Click "Settings" ’ "API"
4. Copy "Project URL" and "anon public" key

---

## < DNS Configuration for techpulze.com

### Option A: Use Vercel's DNS (Recommended)

**At your domain registrar:**
1. Find "Nameservers" or "DNS" settings
2. Change nameservers to:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Save changes
4. Wait 24-48 hours for propagation

### Option B: Add A and CNAME Records

**At your domain registrar:**
```
Type    Name    Value                    TTL
A       @       76.76.21.21             3600
CNAME   www     cname.vercel-dns.com    3600
```

---

##  Verify Deployment

Once deployed, test these:

### 1. Homepage
```
https://techpulze.com
```
Should load without errors

### 2. Company Page
```
https://techpulze.com/companies/[any-company-id]
```
Should show voting interface

### 3. API Endpoint
```
https://techpulze.com/api/votes
```
Should return JSON (may be 400 error, that's OK)

### 4. Supabase Connection
**Open browser console (F12):**
```javascript
// Test if Supabase is connected
fetch('https://techpulze.com/api/votes?company_id=test')
  .then(r => r.json())
  .then(console.log)
```

### 5. Voting System
- Navigate to a company page
- Try voting (must be logged in)
- Check if votes save to Supabase

---

## = Common Deployment Issues

### Issue: Build fails with "Module not found"
**Fix:**
```bash
npm install
npm run build
```

### Issue: Environment variables not working
**Fix:**
- Check they're added to Vercel Dashboard
- Restart deployment: `vercel --prod`

### Issue: Custom domain not working
**Fix:**
- Wait 24-48 hours for DNS
- Check DNS with: `nslookup techpulze.com`
- Verify records in Vercel Dashboard

### Issue: "Application Error" in production
**Fix:**
- Check Vercel deployment logs
- Verify all env vars are set
- Check Supabase RLS policies

---

## =Ê Post-Deployment Tasks

After successful deployment:

### 1. Enable Vercel Analytics
- Go to: Vercel Dashboard ’ Analytics
- Click "Enable"
- View traffic stats

### 2. Set Up Error Monitoring
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### 3. Configure Supabase Production Settings
- Enable RLS policies
- Set up Row Level Security
- Configure email templates
- Enable database backups

### 4. Add to Search Engines
- Submit sitemap to Google Search Console
- Add site to Bing Webmaster Tools

### 5. Enable HTTPS (Automatic on Vercel)
- Vercel automatically provisions SSL
- Force HTTPS in `vercel.json` (already configured)

---

## <¯ Success Checklist

Your deployment is successful when:

- [] https://techpulze.com loads
- [] Company pages display correctly
- [] Voting interface is visible
- [] Can submit votes (when logged in)
- [] SSL certificate is active (= in browser)
- [] Mobile responsive works
- [] Dark mode toggle works
- [] No console errors (F12)
- [] Supabase connection works

---

## =€ Automated Deployment Script

For future deployments, just run:

```powershell
# Right-click and "Run with PowerShell"
.\deploy-to-vercel.ps1
```

This script will:
1.  Check prerequisites
2.  Build production bundle
3.  Run tests
4.  Deploy to Vercel
5.  Show deployment URL

---

## =Þ Need Help?

### Vercel Support
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### DNS Help
- DNS Checker: https://dnschecker.org
- Propagation: Usually takes 5-30 minutes
- Max wait: 48 hours

### Supabase Issues
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs
- Support: https://supabase.com/support

---

## <Š You're Ready!

Choose your deployment method:

**< EASY WAY (Recommended):**
1. Push code to GitHub
2. Connect GitHub to Vercel
3. Add environment variables
4. Configure domain
5. **DONE!**

**¡ FAST WAY (Advanced):**
1. Run: `npm install -g vercel`
2. Run: `vercel --prod`
3. Add environment variables
4. Configure domain
5. **DONE!**

**> AUTOMATED WAY:**
1. Run: `.\deploy-to-vercel.ps1`
2. Follow prompts
3. **DONE!**

---

## <‰ Go Live!

Your TechPulze voting system will be live at:

### **< https://techpulze.com**

Share it with the world! =€

---

**Deployment time:** 15 minutes
**Estimated cost:** $0 (Free tier)
**SSL:** Automatic
**CDN:** Global edge network
**Scaling:** Automatic

**Let's deploy!** =ª
