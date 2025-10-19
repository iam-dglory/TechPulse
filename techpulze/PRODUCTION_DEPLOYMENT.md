# =€ TechPulze Production Deployment Guide
## Deploy to www.techpulze.com

This guide will help you deploy your TechPulze voting system to production with your custom domain.

---

## <¯ Recommended Deployment Platform: **Vercel**

**Why Vercel?**
-  Built by the creators of Next.js
-  Zero-config deployment for Next.js 15
-  Free SSL certificate for custom domains
-  Automatic builds from Git
-  Edge network (global CDN)
-  Free tier available
-  Built-in analytics
-  Perfect for React 19 + Next.js 15

---

## =Ë Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Supabase project is in production mode
- [ ] All environment variables are documented
- [ ] Database tables are created (votes, companies, user_profiles)
- [ ] RLS policies are configured in Supabase
- [ ] Custom domain DNS is accessible (techpulze.com)
- [ ] Code is pushed to GitHub/GitLab
- [ ] Production build works locally (`npm run build`)

---

## =€ Deployment Method 1: Vercel (Recommended)

### Step 1: Prepare Your Code

```bash
# 1. Initialize git (if not already)
cd C:\Users\GOPIKA ARAVIND\my-netfolio\techpulze
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "feat: add voting system for production deployment"

# 4. Create GitHub repository and push
git remote add origin https://github.com/yourusername/techpulze.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)

1. **Go to:** https://vercel.com/signup
2. **Sign up** with GitHub account
3. **Click:** "Import Project"
4. **Select:** Your TechPulze repository
5. **Framework Preset:** Next.js (auto-detected)
6. **Root Directory:** `./` (or `techpulze/` if in monorepo)
7. **Build Command:** `npm run build` (auto-filled)
8. **Output Directory:** `.next` (auto-filled)
9. **Install Command:** `npm install` (auto-filled)

#### Option B: Vercel CLI (Advanced)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project directory
cd C:\Users\GOPIKA ARAVIND\my-netfolio\techpulze
vercel

# 4. Follow prompts:
# - Link to existing project? No
# - Project name: techpulze
# - Directory: ./
# - Framework: Next.js (detected)

# 5. Deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables

In **Vercel Dashboard:**

1. Go to: **Project Settings** ’ **Environment Variables**
2. Add these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uypdmcgybpltogihldhu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

**Important:**
- Use **Production** environment for all variables
- Don't commit `.env.local` to Git!
- Get production keys from Supabase dashboard

### Step 4: Configure Custom Domain

1. **In Vercel Dashboard:**
   - Go to **Project Settings** ’ **Domains**
   - Click **"Add Domain"**
   - Enter: `techpulze.com` and `www.techpulze.com`
   - Click **"Add"**

2. **Configure DNS (at your domain registrar):**

Add these DNS records:

```dns
Type    Name    Value                           TTL
A       @       76.76.21.21                    3600
CNAME   www     cname.vercel-dns.com           3600
```

**Or use Vercel nameservers:**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

3. **Wait for DNS propagation** (5-30 minutes)

4. **Vercel will automatically:**
   - Issue SSL certificate (Let's Encrypt)
   - Enable HTTPS
   - Redirect HTTP ’ HTTPS
   - Redirect www ’ non-www (or vice versa)

### Step 5: Verify Deployment

1. Visit: **https://techpulze.com**
2. Test:
   - [ ] Homepage loads
   - [ ] Company pages work
   - [ ] Voting interface appears
   - [ ] Can submit votes (if logged in)
   - [ ] Supabase connection works
   - [ ] Dark mode toggle works
   - [ ] Mobile responsive

---

## =€ Deployment Method 2: Netlify

### Quick Deploy

1. **Go to:** https://app.netlify.com/
2. **Click:** "Add new site" ’ "Import an existing project"
3. **Connect:** GitHub repository
4. **Configure:**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

5. **Environment Variables:**
   - Add same variables as Vercel (see above)

6. **Custom Domain:**
   - Site settings ’ Domain management
   - Add custom domain: `techpulze.com`
   - Configure DNS (similar to Vercel)

---

## =€ Deployment Method 3: Self-Hosted (VPS)

For complete control, deploy to your own server.

### Requirements
- Ubuntu/Debian VPS (DigitalOcean, Linode, AWS EC2)
- Node.js 18+ installed
- Nginx for reverse proxy
- PM2 for process management

### Step 1: Prepare Server

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx
```

### Step 2: Deploy Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/techpulze.git
cd techpulze

# Install dependencies
npm install

# Create production env file
nano .env.production
# Add your environment variables

# Build application
npm run build

# Start with PM2
pm2 start npm --name "techpulze" -- start
pm2 save
pm2 startup
```

### Step 3: Configure Nginx

```bash
# Create Nginx config
nano /etc/nginx/sites-available/techpulze.com
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name techpulze.com www.techpulze.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/techpulze.com /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 4: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d techpulze.com -d www.techpulze.com

# Auto-renewal is configured automatically
```

### Step 5: Configure DNS

Point your domain to server IP:

```dns
Type    Name    Value               TTL
A       @       your-server-ip      3600
A       www     your-server-ip      3600
```

---

## =' Production Environment Setup

### Create `.env.production` file:

```bash
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://uypdmcgybpltogihldhu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx

# Sentry (Optional - Error Tracking)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**Important Security Notes:**
-  Never commit `.env.production` to Git
-  Use different Supabase keys for production
-  Enable RLS policies in Supabase
-  Use strong secrets
-  Enable 2FA on hosting accounts

---

## =Ê Post-Deployment Tasks

### 1. Verify Supabase Connection

Test in browser console:
```javascript
// On https://techpulze.com
const { data, error } = await window.supabase
  .from('companies')
  .select('*')
  .limit(1)

console.log('Supabase connection:', data ? ' Working' : 'L Failed')
```

### 2. Test Voting System

- [ ] Navigate to company page
- [ ] Sign in with Supabase Auth
- [ ] Submit test votes
- [ ] Verify votes saved to database
- [ ] Check score recalculation

### 3. Configure Monitoring

**Vercel Analytics:**
- Automatically enabled (free tier)
- View in Vercel Dashboard

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Google Analytics:**
- Add GA4 tracking ID to env vars
- Implement in `src/app/layout.tsx`

### 4. Set Up Database Backups

**Supabase:**
- Go to Database ’ Backups
- Enable automatic daily backups
- Configure retention period

### 5. Enable Edge Caching

**In `next.config.ts`:**
```typescript
export default {
  experimental: {
    turbo: {
      resolveAlias: {
        // Add aliases if needed
      }
    }
  },
  // Enable ISR for static pages
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
}
```

---

## = Security Checklist

Before going live:

- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure CSP headers
- [ ] Enable RLS in Supabase
- [ ] Use environment variables (not hardcoded)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Remove console.logs
- [ ] Enable Supabase Auth rate limits
- [ ] Set up monitoring/alerts
- [ ] Review API endpoint security

---

## =¦ Deployment Commands

### Build & Test Locally

```bash
# Build production bundle
npm run build

# Test production build locally
npm start

# Open browser: http://localhost:3000
# Test all features work
```

### Deploy to Vercel

```bash
# Quick deploy (after setup)
vercel --prod

# Or push to Git (auto-deploys)
git push origin main
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## =È Performance Optimization

### 1. Enable Next.js Image Optimization

Already configured in Next.js 15 (automatic)

### 2. Configure ISR (Incremental Static Regeneration)

For company pages:
```typescript
// src/app/companies/[id]/page.tsx
export const revalidate = 3600 // Revalidate every hour
```

### 3. Enable Compression

Vercel handles this automatically.

For self-hosted:
```nginx
# In nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 4. Optimize Bundle Size

```bash
# Analyze bundle
npm run build
# Check output for large dependencies
```

---

## = Troubleshooting Production Issues

### Issue: "Application Error" on Vercel

**Solution:**
1. Check build logs in Vercel Dashboard
2. Verify environment variables are set
3. Test build locally: `npm run build`

### Issue: Voting not working in production

**Solution:**
1. Check Supabase URL in env vars
2. Verify RLS policies allow inserts
3. Check browser console for errors
4. Test API endpoint: `/api/votes`

### Issue: Custom domain not working

**Solution:**
1. Wait 24-48 hours for DNS propagation
2. Check DNS records with: `nslookup techpulze.com`
3. Verify DNS config in domain registrar
4. Check Vercel domain settings

### Issue: SSL certificate errors

**Solution:**
- Vercel: Automatic, wait 5 minutes
- Self-hosted: Run `certbot renew`

---

## =Þ Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Production:** https://supabase.com/docs/guides/platform/going-into-prod
- **Domain Setup:** https://vercel.com/docs/concepts/projects/custom-domains

---

##  Launch Checklist

Final steps before announcing:

- [ ] Production deployment successful
- [ ] Custom domain working (techpulze.com)
- [ ] SSL/HTTPS enabled
- [ ] All features tested in production
- [ ] Voting system working
- [ ] Database connected
- [ ] Error monitoring set up
- [ ] Analytics configured
- [ ] Backups enabled
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Mobile tested
- [ ] Cross-browser tested
- [ ] SEO meta tags added

---

## <‰ You're Live!

Once deployed, your voting system will be available at:

**< https://techpulze.com**

Share it with the world! =€

---

## =Ê Recommended Next Steps

1. **Set up monitoring** (Sentry, LogRocket)
2. **Enable analytics** (Google Analytics, Mixpanel)
3. **Configure email** (SendGrid, Postmark)
4. **Add SEO meta tags**
5. **Create sitemap.xml**
6. **Submit to Google Search Console**
7. **Set up CI/CD** (GitHub Actions)
8. **Add tests** (Jest, Playwright)

---

**Need help?** Check the troubleshooting section or contact your hosting provider's support.

**Good luck with your launch!** <Š
