# Vercel Deployment Fix Guide

## Changes Made

### 1. Enhanced Supabase Client Initialization
Added proper error handling to prevent runtime errors when environment variables are missing:

- **lib/supabase/client.ts** - Added validation for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **lib/supabase/server.ts** - Added the same validation for server-side client

### 2. Fixed Build-Time Errors
Added dynamic rendering configuration to pages that fetch data from Supabase during build:

- **app/page.tsx** - Homepage (added `export const dynamic = 'force-dynamic'`)
- **app/companies/page.tsx** - Companies listing (added `export const dynamic = 'force-dynamic'`)
- **app/dashboard/page.tsx** - User dashboard (added `export const dynamic = 'force-dynamic'`)
- **app/companies/[slug]/page.tsx** - Already had dynamic rendering configured

This prevents Next.js from trying to statically generate these pages during build time when environment variables might not be available.

### 3. Updated Environment Files
- **.env.local** - Already had correct Supabase credentials
- **.env.production** - Added Supabase credentials for production builds

## Vercel Environment Variables Setup

To ensure successful deployment, you **MUST** add these environment variables to your Vercel project:

### Step 1: Access Vercel Project Settings
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your TechPulze project
3. Click on **Settings** tab
4. Navigate to **Environment Variables** section

### Step 2: Add Required Variables
Add the following environment variables for **Production**, **Preview**, and **Development** environments:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uypdmcgybpltogihldhu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cGRtY2d5YnBsdG9naWhsZGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MjYxNDMsImV4cCI6MjA3NjQwMjE0M30.b-NUHk_ziPyVhafKZr654S2tOia1uSkppq172RXRYAw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cGRtY2d5YnBsdG9naWhsZGh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgyNjE0MywiZXhwIjoyMDc2NDAyMTQzfQ.DzOpkj5fl02iEE1hn1qN2sFJX6O1YRIuy4JOzH1IgZQ

# App Configuration
NEXT_PUBLIC_APP_URL=https://www.texhpulze.com
```

### Step 3: Optional Variables (if you plan to use these features)
```bash
# OpenAI (for AI scoring feature)
OPENAI_API_KEY=your_openai_api_key

# Redis (for caching)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

## Using Vercel CLI (Alternative Method)

You can also add environment variables using the Vercel CLI:

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
```

## Deployment Steps

### 1. Commit and Push Changes
```bash
cd TechPulze
git add .
git commit -m "Fix Supabase initialization and build-time errors"
git push origin main
```

### 2. Trigger Deployment
Vercel will automatically deploy when you push to your main branch. Alternatively:

```bash
# Deploy manually using Vercel CLI
vercel --prod
```

### 3. Verify Deployment
After deployment completes:
1. Visit your production URL
2. Check that the homepage loads correctly with company statistics
3. Navigate to `/companies` to verify the companies listing works
4. Test the dashboard by signing in

## Troubleshooting

### If deployment still fails:

1. **Check Environment Variables**
   - Ensure all required environment variables are set in Vercel
   - Verify there are no typos in variable names
   - Make sure variables are enabled for all environments (Production, Preview, Development)

2. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments → Select failed deployment
   - Read the build logs to identify the specific error
   - Look for "Missing environment variables" or similar messages

3. **Clear Vercel Build Cache**
   ```bash
   vercel --prod --force
   ```

4. **Redeploy from Vercel Dashboard**
   - Go to your deployment
   - Click the three dots menu
   - Select "Redeploy"

## What These Changes Fixed

1. **Error: "Missing Supabase environment variables"**
   - Fixed by adding validation in Supabase client initialization files

2. **Build Error: "Export encountered an error on /_not-found/page"**
   - Fixed by adding `export const dynamic = 'force-dynamic'` to pages that fetch data during build

3. **Static Generation Errors**
   - Pages now render dynamically at request time instead of being statically generated during build

## Next Steps After Successful Deployment

1. Test all major features:
   - Homepage with company statistics
   - Company search and filtering
   - Individual company pages
   - User authentication (login/signup)
   - Dashboard functionality

2. Monitor performance:
   - Check Vercel Analytics for page load times
   - Monitor error rates in Vercel dashboard

3. Optional optimizations:
   - Add Redis caching for frequently accessed data
   - Configure Incremental Static Regeneration (ISR) for some pages
   - Set up monitoring and alerts

## Support

If you encounter any issues during deployment:
1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Review the [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
3. Check TechPulze deployment logs in Vercel Dashboard
