## Deployment Verification Checklist - TexhPulze

Complete checklist and procedures for deploying and verifying the TexhPulze platform.

---

## 📋 Pre-Deployment Checklist

### ✅ Environment Variables

Verify all environment variables are set in Vercel Dashboard:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://uypdmcgybpltogihldhu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Alternative naming (fallback)
VITE_SUPABASE_URL=https://uypdmcgybpltogihldhu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URL
NEXT_PUBLIC_APP_URL=https://texhpulze.com

# Environment
NODE_ENV=production
```

**Verification:**
```bash
# Check Vercel env vars
vercel env ls

# Or check in dashboard:
# Vercel → Project → Settings → Environment Variables
```

---

### ✅ Database Migrations

Execute these SQL files in Supabase SQL Editor (in order):

1. **SUPABASE-SETUP.md** - Core tables (profiles, articles, companies)
2. **NEWS-API-SCHEMA.sql** - News tables and indexes
3. **COMPANIES-API-SCHEMA.sql** - Companies, scores, promises, votes
4. **PROMISES-API-SCHEMA.sql** - Promise votes table
5. **USER-DASHBOARD-SCHEMA.sql** - User follows, notifications, preferences
6. **supabase/migrations/20250121_backend_functions.sql** - Advanced functions

**Verification:**
```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Should return 15+ tables including:
-- companies, company_scores, news, promises, promise_votes,
-- votes, user_follows, notifications, profiles, etc.
```

---

### ✅ Domain Configuration

**DNS Records (set in your DNS provider):**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | Auto |
| CNAME | www | cname.vercel-dns.com | Auto |

**Vercel Domain Setup:**
1. Vercel Dashboard → Domains
2. Add: `texhpulze.com`
3. Add: `www.texhpulze.com`
4. Wait for SSL certificate (automatic)

**Verification:**
```bash
# Check DNS propagation
dig texhpulze.com
dig www.texhpulze.com

# Check SSL
curl -I https://texhpulze.com | head -1
# Expected: HTTP/2 200
```

---

## 🚀 Deployment Steps

### 1. Deploy to Production

**Via Git Push (recommended):**
```bash
git push origin main
# Vercel auto-deploys from main branch
```

**Via Vercel CLI:**
```bash
vercel --prod
```

**Via Vercel Dashboard:**
- Go to Deployments → Deploy → Production

---

### 2. Verify Deployment

```bash
# Check deployment URL
curl -I https://texhpulze.com

# Expected response:
# HTTP/2 200
# content-type: text/html
```

---

## 🧪 Testing Procedures

### Test 1: API Endpoints

Run automated test script:

```bash
# From project root
BASE_URL=https://texhpulze.com npx ts-node scripts/test-api.ts
```

**Expected output:**
```
✅ GET    /api/companies?limit=5                   200 (150ms)
✅ GET    /api/news?limit=5                        200 (120ms)
✅ GET    /api/companies/openai                    200 (80ms)
❌ POST   /api/votes (without auth)                401 (50ms) ← Expected
❌ POST   /api/auth/login (invalid)                401 (60ms) ← Expected
```

**Manual tests:**

```bash
# Test companies endpoint
curl https://texhpulze.com/api/companies?limit=2 | jq .

# Test news endpoint
curl https://texhpulze.com/api/news?limit=2 | jq .

# Test company detail
curl https://texhpulze.com/api/companies/openai | jq .

# Test authentication (should fail)
curl -X POST https://texhpulze.com/api/votes \
  -H "Content-Type: application/json" \
  -d '{"company_id":"uuid","vote_type":"ethics","score":8}'
# Expected: 401 Unauthorized
```

---

### Test 2: Database Connection

```bash
# Verify database returns data
curl https://texhpulze.com/api/companies?limit=1

# Expected: JSON response with companies array
```

---

### Test 3: Authentication Flow

**Signup:**
```bash
curl -X POST https://texhpulze.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "verify@test.com",
    "password": "TestPass123",
    "username": "verifyuser",
    "userType": "citizen"
  }' | jq .
```

**Login:**
```bash
curl -X POST https://texhpulze.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "verify@test.com",
    "password": "TestPass123"
  }' | jq .
```

---

### Test 4: Voting System

**Submit vote (requires auth token from login):**
```bash
# Extract token from login response
TOKEN="your_access_token_here"

curl -X POST https://texhpulze.com/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "company_id": "company_uuid_here",
    "vote_type": "ethics",
    "score": 8,
    "comment": "Test vote from deployment verification"
  }' | jq .
```

---

### Test 5: Real-Time Score Updates

1. Submit a vote (Test 4)
2. Check company score updated:
```bash
curl https://texhpulze.com/api/companies/[slug] | jq '.data.company_scores'
```

3. Verify score changed in database:
```sql
SELECT overall_score, ethics_score, updated_at
FROM company_scores
WHERE company_id = 'company_uuid';
```

---

### Test 6: Rate Limiting

```bash
# Send 65 requests rapidly
for i in {1..65}; do
  echo "Request $i"
  curl -I https://texhpulze.com/api/companies 2>&1 | head -1
done

# After request 60, should see:
# HTTP/2 429
```

**Check headers:**
```bash
curl -I https://texhpulze.com/api/companies

# Expected headers:
# X-RateLimit-Limit: 60
# X-RateLimit-Remaining: 59
# X-RateLimit-Reset: 2025-01-21T...
```

---

### Test 7: User Dashboard

```bash
# Requires authentication
curl https://texhpulze.com/api/user/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq .

# Expected: Profile, followed companies, recent votes, stats, notifications
```

---

### Test 8: Console Errors

1. Open https://texhpulze.com in browser
2. Open DevTools (F12) → Console
3. Navigate through pages
4. **Verify:** No errors in console

---

### Test 9: Mobile Responsiveness

Test on these viewports:
- iPhone SE (375×667)
- iPhone 12 Pro (390×844)
- iPad (768×1024)
- Desktop (1920×1080)

**Chrome DevTools:**
1. F12 → Toggle device toolbar
2. Select device
3. Test navigation, forms, buttons

---

## 📊 Verification Checklist

### Core Functionality

- [ ] Homepage loads without errors
- [ ] Company listing displays correctly
- [ ] Company detail page works
- [ ] News listing loads
- [ ] Search functionality works
- [ ] Filters work (industry, score, etc.)
- [ ] Pagination works

### Authentication

- [ ] Signup creates new user
- [ ] Login authenticates existing user
- [ ] Logout clears session
- [ ] Protected routes require auth
- [ ] Auth errors show proper messages

### Voting System

- [ ] Voting requires authentication (401 without)
- [ ] Vote submission works
- [ ] Duplicate votes update existing
- [ ] Company scores recalculate
- [ ] Vote history displays

### Database

- [ ] All migrations applied
- [ ] Tables created correctly
- [ ] Indexes exist
- [ ] RLS policies work
- [ ] Triggers fire correctly
- [ ] Functions execute

### Performance

- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Lighthouse score > 90

### Security

- [ ] HTTPS enforced
- [ ] HTTP-only cookies
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] SQL injection protected
- [ ] XSS protected
- [ ] Auth tokens secure

### Mobile

- [ ] Responsive layout
- [ ] Touch interactions work
- [ ] Forms usable
- [ ] No horizontal scroll
- [ ] Images load

---

## 🔍 Troubleshooting

### Database Connection Failed

**Symptoms:**
- API returns 500 errors
- "Failed to connect to database" in logs

**Solutions:**
1. Check Vercel environment variables
2. Verify Supabase URL correct
3. Test connection: `curl $NEXT_PUBLIC_SUPABASE_URL`
4. Check Supabase project status

### API Routes Return 404

**Symptoms:**
- /api/* routes return 404
- "Route not found"

**Solutions:**
1. Verify route files exist in `src/app/api/`
2. Check file naming (route.ts not index.ts)
3. Clear Vercel build cache
4. Redeploy: `vercel --prod --force`

### Authentication Not Working

**Symptoms:**
- Login fails with "Session not found"
- Cookies not being set

**Solutions:**
1. Check Supabase Auth enabled
2. Verify cookie settings in `createServerClient`
3. Test with Supabase dashboard
4. Check RLS policies

### Slow Response Times

**Symptoms:**
- API responses > 1 second
- Page load slow

**Solutions:**
1. Check database indexes exist
2. Use `EXPLAIN ANALYZE` on slow queries
3. Enable Supabase connection pooling
4. Add caching headers

---

## 📝 Post-Deployment Tasks

### Day 1
- [ ] Monitor error logs hourly
- [ ] Test all major features
- [ ] Verify email notifications work
- [ ] Check database backups enabled

### Week 1
- [ ] Review Vercel analytics
- [ ] Monitor Supabase usage
- [ ] Check rate limit effectiveness
- [ ] Optimize slow queries

### Ongoing
- [ ] Weekly database backups
- [ ] Monthly security audits
- [ ] Performance monitoring
- [ ] User feedback collection

---

## 🔐 Production URLs

- **Main Site:** https://texhpulze.com
- **API Base:** https://texhpulze.com/api
- **Supabase Dashboard:** https://app.supabase.com
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 📚 Resources

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- GitHub Repo: https://github.com/iam-dglory/TechPulse

---

**Last Updated:** 2025-01-21
