# TexhPulze Troubleshooting Guide

Common issues and solutions for TexhPulze deployment.

## 🔴 Critical Issues

### Issue: Site Shows 404 on All Pages

**Symptoms:**
- Visiting www.texhpulze.com shows "404 Not Found"
- Vercel says deployment successful
- Build completed without errors

**Diagnosis:**
```bash
# Check if deployment exists
curl -I https://www.texhpulze.com
# Should return 200 OK, not 404

# Check DNS
nslookup www.texhpulze.com
# Should resolve to Vercel IP
```

**Solutions:**

**Solution 1: Check vercel.json**
```bash
# Verify file exists
ls vercel.json

# Should contain:
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Solution 2: Check build output**
```bash
# Build locally
npm run build

# Check dist folder exists
ls dist/

# Should contain index.html
ls dist/index.html
```

**Solution 3: Redeploy**
1. Go to Vercel dashboard
2. Deployments → Latest deployment
3. Click "..." → "Redeploy"
4. Wait for completion

**Solution 4: Check domain configuration**
- Vercel → Settings → Domains
- Ensure domain shows "Valid Configuration"
- If not, check DNS records

---

### Issue: Homepage Works but Refresh on Routes Gives 404

**Symptoms:**
- Homepage (www.texhpulze.com) loads fine
- Navigation works
- Refreshing on /about or other routes gives 404

**Diagnosis:**
This is a classic SPA routing issue.

**Solution:**

Ensure `vercel.json` contains rewrites:
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

Then redeploy:
```bash
vercel --prod
```

---

### Issue: API Calls Failing with CORS Error

**Symptoms:**
- Console shows: "CORS policy: No 'Access-Control-Allow-Origin' header"
- Network tab shows failed API requests
- Frontend loads but no data

**Diagnosis:**
```javascript
// Open browser console
console.log(import.meta.env.VITE_API_URL)
// Should show: https://texhpulze.onrender.com/api

// Check CORS error details in Network tab
```

**Solutions:**

**Solution 1: Check FRONTEND_URL on Render**
1. Go to Render dashboard
2. Select texhpulze backend
3. Environment tab
4. Check `FRONTEND_URL` is set correctly:
   - Should be: `https://www.texhpulze.com`
   - NOT: `https://www.texhpulze.com/` (no trailing slash)
5. Save and restart backend

**Solution 2: Verify backend is running**
```bash
# Test backend directly
curl https://texhpulze.onrender.com/api

# Should return response, not error
```

**Solution 3: Check VITE_API_URL**
1. Vercel → Settings → Environment Variables
2. Ensure `VITE_API_URL` exists
3. Value: `https://texhpulze.onrender.com/api`
4. Redeploy after changing

---

### Issue: Environment Variables Not Working

**Symptoms:**
- `import.meta.env.VITE_API_URL` returns undefined
- API calls going to wrong URL
- Console shows errors about undefined variables

**Diagnosis:**
```javascript
// Check in browser console
console.log(import.meta.env.VITE_API_URL)
// Should NOT be undefined
```

**Solutions:**

**Solution 1: Check variable prefix**
- All Vite env vars must start with `VITE_`
- ❌ Wrong: `API_URL`
- ✅ Correct: `VITE_API_URL`

**Solution 2: Check Vercel dashboard**
1. Vercel → Settings → Environment Variables
2. Ensure variables are added
3. Check all environments selected (Production, Preview, Development)
4. Click "Save"

**Solution 3: Redeploy**
Environment variables only apply to NEW builds:
1. Vercel → Deployments
2. Click "Redeploy"
3. Wait for build completion

**Solution 4: Clear cache**
```bash
# In browser
Ctrl + Shift + Delete → Clear cache

# Or hard refresh
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

---

## ⚠️ Common Issues

### Issue: Build Failing on Vercel

**Symptoms:**
- Vercel deployment fails
- Build logs show errors
- Red "Failed" status

**Diagnosis:**
Check build logs in Vercel dashboard.

**Common Causes & Solutions:**

**Cause 1: Missing dependencies**
```bash
# Solution: Ensure all packages in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Cause 2: ESLint errors**
```bash
# Test locally
npm run lint

# Fix errors or disable strict linting
# In package.json:
"scripts": {
  "build": "vite build"
  // Remove lint from build if needed
}
```

**Cause 3: TypeScript errors**
```bash
# Check for type errors
npm run type-check

# Fix or configure tsconfig.json
```

**Cause 4: Out of memory**
Add to `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
  }
}
```

---

### Issue: Domain Not Connecting

**Symptoms:**
- www.texhpulze.com doesn't load
- Shows registrar's parking page
- "Site not found" error

**Diagnosis:**
```bash
# Check DNS
nslookup www.texhpulze.com

# Should show cname.vercel-dns.com
# If shows different IP, DNS not updated
```

**Solutions:**

**Solution 1: Verify DNS records**
At your domain registrar:
- A record: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`

**Solution 2: Wait for propagation**
- DNS changes take 5 min - 48 hours
- Check at: https://dnschecker.org
- Enter: www.texhpulze.com
- Wait until green checkmarks globally

**Solution 3: Clear DNS cache**
```bash
# Windows
ipconfig /flushdns

# Mac
sudo dscacheutil -flushcache

# Linux
sudo systemd-resolve --flush-caches
```

**Solution 4: Check in Vercel**
- Vercel → Settings → Domains
- Status should show "Valid Configuration"
- If not, re-add domain

---

### Issue: SSL Certificate Not Issued

**Symptoms:**
- "Not secure" warning in browser
- No padlock icon
- Certificate error

**Diagnosis:**
```bash
# Check certificate
curl -vI https://www.texhpulze.com
# Look for SSL handshake errors
```

**Solutions:**

**Solution 1: Wait for issuance**
- SSL certs can take 5-60 minutes after DNS propagates
- Be patient, Vercel auto-provisions

**Solution 2: Check DNS**
- Ensure DNS fully propagated
- Use dnschecker.org
- Must be green globally

**Solution 3: If using Cloudflare**
- Turn OFF proxy (orange cloud)
- Use "DNS only" (gray cloud)
- Vercel needs direct access for SSL

**Solution 4: Remove and re-add domain**
1. Vercel → Settings → Domains
2. Remove domain
3. Wait 5 minutes
4. Re-add domain
5. Wait for SSL provisioning

---

### Issue: Images or Assets Not Loading

**Symptoms:**
- Broken image icons
- Console shows 404 for assets
- Missing CSS/JS files

**Diagnosis:**
Check Network tab in DevTools for failed requests.

**Solutions:**

**Solution 1: Check asset paths**
```jsx
// ❌ Wrong - absolute path
<img src="/assets/logo.png" />

// ✅ Correct - from public folder
<img src="/logo.png" />

// ✅ Correct - import
import logo from './assets/logo.png'
<img src={logo} />
```

**Solution 2: Check public folder**
```bash
# Assets should be in public/ folder
ls public/

# Vite copies public/ to dist/ root
```

**Solution 3: Check base path**
In `vite.config.js`:
```javascript
export default defineConfig({
  base: '/',  // Should be '/' for root domain
})
```

---

### Issue: API Returns 401 Unauthorized

**Symptoms:**
- API calls fail with 401 status
- "Unauthorized" error messages
- Can't access protected resources

**Solutions:**

**Solution 1: Check authentication token**
```javascript
// Check if token exists
console.log(localStorage.getItem('authToken'))

// If null, user needs to log in again
```

**Solution 2: Clear old tokens**
```javascript
// In browser console
localStorage.clear()
// Then log in again
```

**Solution 3: Check token expiry**
Backend may have expired the JWT. User needs to re-authenticate.

---

## 🔍 Debugging Tools

### Browser DevTools

**Console:**
- Check for JavaScript errors
- View environment variables
- Test API calls manually

**Network Tab:**
- See all API requests
- Check request/response headers
- Identify failed requests
- View CORS errors

**Application Tab:**
- Check localStorage
- View cookies
- Inspect service workers

### Command Line Tools

**Check DNS:**
```bash
nslookup www.texhpulze.com
dig www.texhpulze.com
```

**Test API:**
```bash
curl https://texhpulze.onrender.com/api
curl -I https://www.texhpulze.com
```

**Check SSL:**
```bash
openssl s_client -connect www.texhpulze.com:443
```

### Online Tools

- **DNS Checker:** https://dnschecker.org
- **SSL Test:** https://www.ssllabs.com/ssltest/
- **HTTP Headers:** https://mxtoolbox.com/SuperTool.aspx
- **Website Speed:** https://pagespeed.web.dev

---

## 🆘 Emergency Procedures

### Site is Completely Down

1. **Check Vercel Status**
   - Visit: https://www.vercel-status.com
   - If Vercel is down, wait for resolution

2. **Check Render Status**
   - Visit: https://status.render.com
   - If Render is down, wait for resolution

3. **Rollback Deployment**
   - Vercel → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

### Database Connection Failed

1. Check Render logs for DB errors
2. Verify DB credentials in Render environment
3. Check database service status
4. Restart Render backend

### Complete Reset

If all else fails:

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Test build locally
npm run build
npm run preview

# 3. If works locally, redeploy
vercel --prod

# 4. If still fails, contact support
```

---

## 📞 Getting Help

### Check Logs

**Vercel Logs:**
1. Vercel → Deployments
2. Click deployment
3. View Build/Function logs

**Render Logs:**
1. Render → Service
2. Click "Logs" tab
3. View real-time logs

### Community Support

- **Vercel:** https://github.com/vercel/vercel/discussions
- **Vite:** https://chat.vitejs.dev
- **React:** https://react.dev/community

### Contact Support

- **Vercel:** support@vercel.com
- **Render:** support@render.com

---

## ✅ Preventive Measures

### Before Deploying

- [ ] Test build locally: `npm run build`
- [ ] Test preview: `npm run preview`
- [ ] Check all environment variables
- [ ] Verify backend is running
- [ ] Review recent code changes

### After Deploying

- [ ] Monitor first 10 minutes closely
- [ ] Check error logs
- [ ] Test all major features
- [ ] Verify API connections
- [ ] Check across browsers

### Regular Maintenance

- [ ] Check logs weekly
- [ ] Update dependencies monthly
- [ ] Test backups quarterly
- [ ] Review security annually

---

**Last Updated:** 2025-10-21
**For:** TexhPulze Deployment
**Support:** See documentation folder
