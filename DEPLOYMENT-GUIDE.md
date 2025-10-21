# TexhPulze Complete Deployment Guide

This guide will help you deploy TexhPulze to www.texhpulze.com without 404 errors.

## 📋 Prerequisites

- [x] Backend deployed on Render at https://texhpulze.onrender.com
- [ ] GitHub repository with latest code
- [ ] Vercel account (free tier works)
- [ ] Domain access (texhpulze.com)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare the Repository

1. **Ensure all changes are committed:**
   ```bash
   cd "C:\Users\GOPIKA ARAVIND\TechPulse"
   git status
   git add .
   git commit -m "Configure TexhPulze for Vercel deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign in with your account
   - Click **"Add New Project"**

2. **Import Repository:**
   - Click **"Import Git Repository"**
   - Select your TexhPulze repository
   - Click **"Import"**

3. **Configure Project:**

   **Framework Preset:** `Vite`

   **Root Directory:** `./` (leave as default)

   **Build Command:**
   ```
   npm run build
   ```

   **Output Directory:**
   ```
   dist
   ```

   **Install Command:**
   ```
   npm install
   ```

4. **Add Environment Variables:**
   Click **"Environment Variables"** and add:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://texhpulze.onrender.com/api` |
   | `VITE_APP_NAME` | `TexhPulze` |
   | `VITE_APP_VERSION` | `1.0.0` |

   - Check all environments: **Production**, **Preview**, **Development**

5. **Deploy:**
   - Click **"Deploy"**
   - Wait 2-3 minutes for build to complete
   - Note your deployment URL (e.g., `texhpulze.vercel.app`)

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd "C:\Users\GOPIKA ARAVIND\TechPulse"

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy to production

# Set environment variables
vercel env add VITE_API_URL production
# Enter: https://texhpulze.onrender.com/api

vercel env add VITE_APP_NAME production
# Enter: TexhPulze

vercel env add VITE_APP_VERSION production
# Enter: 1.0.0

# Redeploy with new env vars
vercel --prod
```

### Step 3: Update Backend CORS Settings

**CRITICAL:** Your backend must allow requests from your Vercel domain.

1. **Go to Render Dashboard:**
   - Visit https://render.com
   - Select your `texhpulze` backend service

2. **Update Environment Variable:**
   - Go to **Environment** tab
   - Find `FRONTEND_URL` variable
   - Update value to: `https://texhpulze.vercel.app` (or your custom domain)
   - Click **"Save Changes"**

3. **Wait for Backend to Restart:**
   - Render will automatically restart your service
   - Wait 1-2 minutes

### Step 4: Configure Custom Domain (www.texhpulze.com)

1. **Add Domain in Vercel:**
   - Go to your Vercel project
   - Click **Settings** → **Domains**
   - Click **"Add"**
   - Enter: `texhpulze.com`
   - Click **"Add"**
   - Also add: `www.texhpulze.com`
   - Click **"Add"**

2. **Configure DNS Records:**

   Vercel will show you the DNS records to add. Typically:

   **For root domain (texhpulze.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **For www subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Add DNS Records:**
   - Go to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare)
   - Navigate to DNS settings for texhpulze.com
   - Add the A record for root domain
   - Add the CNAME record for www
   - Save changes

4. **Wait for DNS Propagation:**
   - Can take 5 minutes to 48 hours
   - Usually propagates within 15-30 minutes
   - Check status at: https://dnschecker.org

5. **Update Backend CORS Again:**
   - Go back to Render dashboard
   - Update `FRONTEND_URL` to: `https://www.texhpulze.com`
   - Save and restart

### Step 5: Verify SSL Certificate

- Vercel automatically provisions SSL certificates
- Usually takes 1-2 minutes after DNS propagation
- Check that `https://www.texhpulze.com` shows a padlock icon

## ✅ Testing Checklist

After deployment, test these:

- [ ] **Homepage loads:** Visit https://www.texhpulze.com
- [ ] **No 404 errors:** All pages load correctly
- [ ] **No console errors:** Open browser DevTools (F12) → Console
- [ ] **API connection works:** Check Network tab for successful API calls
- [ ] **HTTPS works:** Padlock icon appears in browser
- [ ] **Mobile responsive:** Test on mobile device
- [ ] **Images load:** All assets display correctly
- [ ] **Favicon shows:** Tab icon displays

## 🔍 Troubleshooting

### Issue: 404 Error on All Pages

**Cause:** Vercel not configured for SPA routing

**Solution:**
1. Verify `vercel.json` exists in root directory
2. Check it contains rewrites configuration
3. Redeploy: `vercel --prod`

### Issue: Homepage works, but refresh on routes gives 404

**Cause:** Missing SPA rewrites

**Solution:**
1. Verify `vercel.json` has:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
2. Redeploy

### Issue: API calls fail with CORS error

**Cause:** Backend not allowing frontend domain

**Solution:**
1. Check Render backend `FRONTEND_URL` is correct
2. Ensure no trailing slashes
3. Restart Render backend
4. Clear browser cache

### Issue: Environment variables not working

**Cause:** Variables not set or incorrect prefix

**Solution:**
1. Ensure all variables start with `VITE_`
2. Check Vercel dashboard → Settings → Environment Variables
3. Redeploy after adding variables
4. Clear browser cache

### Issue: Build fails on Vercel

**Cause:** Missing dependencies or build errors

**Solution:**
1. Check build logs in Vercel dashboard
2. Test build locally: `npm run build`
3. Ensure all dependencies in `package.json`
4. Check for any ESLint or TypeScript errors

### Issue: Domain not connecting

**Cause:** DNS not propagated or incorrect records

**Solution:**
1. Wait 24 hours for DNS propagation
2. Verify DNS records at your registrar
3. Use https://dnschecker.org to check propagation
4. Ensure A and CNAME records match Vercel's requirements

## 📊 Monitoring Your Deployment

### Vercel Analytics

1. Go to your project on Vercel
2. Click **"Analytics"** tab
3. View real-time traffic, performance metrics

### Check Deployment Logs

1. Go to Vercel → **Deployments**
2. Click on latest deployment
3. View **"Build Logs"** for any errors
4. View **"Function Logs"** for runtime errors

### Monitor Backend

1. Go to Render dashboard
2. Check your backend service status
3. View logs for any errors
4. Monitor resource usage

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to main branch:

1. **Make changes** to your code
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Vercel auto-deploys** within 2-3 minutes
4. **Visit** https://www.texhpulze.com to see changes

## 📱 Preview Deployments

Every pull request gets a unique preview URL:

1. Create a new branch
2. Make changes
3. Create Pull Request on GitHub
4. Vercel creates preview deployment
5. Test changes on preview URL
6. Merge when ready

## 🎯 Next Steps

- [ ] Set up monitoring/alerting
- [ ] Configure analytics (Google Analytics, etc.)
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Enable Vercel Analytics
- [ ] Set up automated testing
- [ ] Configure staging environment
- [ ] Add performance monitoring

## 📞 Support

If you encounter issues:

1. Check **Troubleshooting** section above
2. Review **Vercel deployment logs**
3. Check **Render backend logs**
4. Verify **environment variables**
5. Test **backend directly** (https://texhpulze.onrender.com/api)

## 🔐 Security Checklist

- [ ] All API keys stored as environment variables
- [ ] `.env` file in `.gitignore`
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS properly configured
- [ ] No sensitive data in frontend code
- [ ] JWT secrets secured
- [ ] Database credentials encrypted

---

## Quick Reference

**Frontend URL:** https://www.texhpulze.com
**Backend URL:** https://texhpulze.onrender.com
**Vercel Dashboard:** https://vercel.com/dashboard
**Render Dashboard:** https://dashboard.render.com

**Key Commands:**
```bash
# Build locally
npm run build

# Preview build
npm run preview

# Deploy to Vercel
vercel --prod

# Check environment variables
vercel env ls
```

**Environment Variables:**
- `VITE_API_URL=https://texhpulze.onrender.com/api`
- `VITE_APP_NAME=TexhPulze`
- `VITE_APP_VERSION=1.0.0`

---

**Last Updated:** 2025-10-21
**Status:** Ready for Production ✅
