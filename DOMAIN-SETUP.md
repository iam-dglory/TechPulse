# TexhPulze Domain Configuration Guide

Complete guide to configuring www.texhpulze.com with Vercel.

## 📋 Overview

- **Domain:** texhpulze.com
- **Primary URL:** www.texhpulze.com
- **Hosting:** Vercel
- **SSL:** Automatic (Vercel-managed)

## 🔧 Step-by-Step Domain Setup

### Step 1: Add Domain to Vercel

1. **Navigate to your Vercel project:**
   - Go to https://vercel.com/dashboard
   - Select your TexhPulze project
   - Click **Settings** (left sidebar)
   - Click **Domains**

2. **Add root domain:**
   - Click **"Add"** button
   - Enter: `texhpulze.com`
   - Click **"Add"**

3. **Add www subdomain:**
   - Click **"Add"** button again
   - Enter: `www.texhpulze.com`
   - Click **"Add"**

4. **Set www as primary (optional):**
   - Click on `www.texhpulze.com`
   - Click **"Make Primary"**
   - This redirects `texhpulze.com` → `www.texhpulze.com`

### Step 2: Get DNS Records from Vercel

After adding domains, Vercel will display required DNS records:

**Example DNS Records:**

For **texhpulze.com** (root domain):
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

For **www.texhpulze.com**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

**Note:** Copy the exact values shown in your Vercel dashboard as they may differ.

### Step 3: Configure DNS at Your Domain Registrar

DNS configuration varies by registrar. Here are guides for common ones:

#### Option A: GoDaddy

1. **Login to GoDaddy:**
   - Go to https://www.godaddy.com
   - Sign in to your account

2. **Access DNS Management:**
   - Click **"My Products"**
   - Find texhpulze.com
   - Click **"DNS"** or **"Manage DNS"**

3. **Add A Record (Root Domain):**
   - Click **"Add"** button
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21` (from Vercel)
   - TTL: `1 Hour` or `3600`
   - Click **"Save"**

4. **Add/Update CNAME Record (www):**
   - If www record exists, click **Edit**, else click **Add**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `1 Hour` or `3600`
   - Click **"Save"**

#### Option B: Namecheap

1. **Login to Namecheap:**
   - Go to https://www.namecheap.com
   - Sign in

2. **Access DNS:**
   - Click **"Domain List"**
   - Click **"Manage"** next to texhpulze.com
   - Click **"Advanced DNS"**

3. **Add A Record:**
   - Click **"Add New Record"**
   - Type: `A Record`
   - Host: `@`
   - Value: `76.76.21.21`
   - TTL: `Automatic`
   - Click **"Save"**

4. **Add CNAME Record:**
   - Click **"Add New Record"**
   - Type: `CNAME Record`
   - Host: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `Automatic`
   - Click **"Save"**

#### Option C: Cloudflare

1. **Login to Cloudflare:**
   - Go to https://dash.cloudflare.com
   - Select texhpulze.com domain

2. **Go to DNS:**
   - Click **"DNS"** in top menu
   - Click **"Records"**

3. **Add A Record:**
   - Click **"Add record"**
   - Type: `A`
   - Name: `@` or `texhpulze.com`
   - IPv4 address: `76.76.21.21`
   - Proxy status: `DNS only` (turn off orange cloud)
   - TTL: `Auto`
   - Click **"Save"**

4. **Add CNAME Record:**
   - Click **"Add record"**
   - Type: `CNAME`
   - Name: `www`
   - Target: `cname.vercel-dns.com`
   - Proxy status: `DNS only` (turn off orange cloud)
   - TTL: `Auto`
   - Click **"Save"**

**Important for Cloudflare:**
- Turn OFF the proxy (orange cloud) for both records
- Vercel needs direct DNS access for SSL

### Step 4: Verify DNS Configuration

1. **Check DNS Records:**
   - Visit https://dnschecker.org
   - Enter `texhpulze.com`
   - Select `A` record type
   - Click **"Search"**
   - Verify IP shows `76.76.21.21` globally

2. **Check www subdomain:**
   - Enter `www.texhpulze.com`
   - Select `CNAME` record type
   - Click **"Search"**
   - Verify target shows `cname.vercel-dns.com`

### Step 5: Wait for DNS Propagation

- **Typical time:** 15-30 minutes
- **Maximum time:** 48 hours
- **Check status:** Use dnschecker.org

During propagation:
- ✅ Some regions will show new DNS
- ❌ Some regions will show old/no DNS
- 🔄 This is normal, be patient

### Step 6: Verify SSL Certificate

After DNS propagates:

1. **Check Vercel Dashboard:**
   - Go to Vercel → Settings → Domains
   - Status should show: ✅ Valid Configuration
   - SSL should show: ✅ Certificate Issued

2. **Visit your domain:**
   - Go to https://www.texhpulze.com
   - Check for padlock icon in browser
   - Click padlock → should show valid certificate

If SSL not ready:
- Wait 5-10 more minutes
- Vercel auto-provisions SSL certificates
- May take up to 1 hour after DNS propagates

## ✅ Verification Checklist

After setup complete:

- [ ] `texhpulze.com` resolves to A record `76.76.21.21`
- [ ] `www.texhpulze.com` resolves to CNAME `cname.vercel-dns.com`
- [ ] https://www.texhpulze.com loads without errors
- [ ] https://texhpulze.com redirects to www (if set as primary)
- [ ] Padlock icon shows (HTTPS/SSL working)
- [ ] No browser security warnings
- [ ] Vercel dashboard shows "Valid Configuration"

## 🔍 Troubleshooting

### Domain shows "Invalid Configuration" in Vercel

**Causes:**
- DNS not propagated yet
- DNS records incorrect
- TTL too high

**Solutions:**
1. Wait 24 hours for propagation
2. Double-check DNS records match Vercel's instructions
3. Use `dig texhpulze.com` or `nslookup texhpulze.com` to verify
4. Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### SSL Certificate Not Issued

**Causes:**
- DNS not fully propagated
- Cloudflare proxy enabled
- CAA records blocking certificate

**Solutions:**
1. Wait up to 1 hour after DNS propagates
2. If using Cloudflare, disable proxy (turn off orange cloud)
3. Check for CAA records that might block Let's Encrypt
4. Contact Vercel support if issue persists

### Site loads but shows "Not Found" or 404

**Causes:**
- Vercel deployment issue
- Incorrect domain configuration

**Solutions:**
1. Check Vercel deployment is successful
2. Verify `vercel.json` exists with rewrites
3. Redeploy: `vercel --prod`
4. Check domain is pointed to correct Vercel project

### www works but root domain doesn't (or vice versa)

**Causes:**
- Missing DNS record
- Not set as redirect

**Solutions:**
1. Ensure both A and CNAME records exist
2. In Vercel, set one as primary domain
3. Vercel will auto-redirect non-primary to primary

## 🌐 Advanced Configuration

### Email Records (MX Records)

If you need email@texhpulze.com:

1. Keep A and CNAME records for website
2. Add MX records for email provider
3. These don't conflict with Vercel

Example for Google Workspace:
```
Type: MX
Name: @
Priority: 1
Value: smtp.google.com
```

### Subdomains

To add subdomains (e.g., api.texhpulze.com):

1. Go to Vercel → Settings → Domains
2. Click "Add"
3. Enter subdomain: `api.texhpulze.com`
4. Add CNAME record at DNS provider:
   ```
   Type: CNAME
   Name: api
   Value: cname.vercel-dns.com
   ```

### Custom Nameservers (Optional)

For full control, transfer nameservers to Vercel:

1. Vercel → Settings → Domains → Use Vercel Nameservers
2. Copy nameserver addresses
3. Update at domain registrar
4. Manage all DNS records in Vercel

## 📊 Testing Your Domain

### Command Line Tests

**Check A Record:**
```bash
nslookup texhpulze.com
# Should show: 76.76.21.21
```

**Check CNAME:**
```bash
nslookup www.texhpulze.com
# Should show: cname.vercel-dns.com
```

**Test HTTPS:**
```bash
curl -I https://www.texhpulze.com
# Should return 200 OK
```

### Browser Tests

1. Visit https://www.texhpulze.com
2. Open DevTools (F12) → Console
3. Check for errors
4. Network tab → verify API calls work

### SSL Certificate Check

Visit: https://www.ssllabs.com/ssltest/
- Enter: www.texhpulze.com
- Run test
- Should get A or A+ rating

## 🔄 Updating DNS Records

If you need to change DNS:

1. **Update at registrar** (not Vercel)
2. **Wait for propagation** (5-60 minutes typically)
3. **Verify changes** with dnschecker.org
4. **Clear browser cache** (Ctrl+Shift+Delete)

## 🆘 Getting Help

If domain setup fails:

1. **Check Vercel Status:** https://www.vercel-status.com
2. **Vercel Support:** support@vercel.com
3. **Community Forum:** https://github.com/vercel/vercel/discussions
4. **DNS Troubleshooting:** https://vercel.com/docs/concepts/projects/custom-domains

## 📱 Mobile Testing

After domain configured:

1. Test on mobile device
2. Visit https://www.texhpulze.com
3. Check responsiveness
4. Verify no security warnings
5. Test on different browsers (Chrome, Safari, Firefox)

---

## Quick Reference Card

**Domain:** texhpulze.com
**Primary URL:** www.texhpulze.com
**DNS Provider:** [Your Registrar]
**Hosting:** Vercel
**SSL:** Let's Encrypt (Auto)

**DNS Records:**
```
A Record:    @     →  76.76.21.21
CNAME:       www   →  cname.vercel-dns.com
```

**Status Checks:**
- DNS: https://dnschecker.org
- SSL: https://www.ssllabs.com/ssltest/
- Vercel: https://vercel.com/dashboard

---

**Last Updated:** 2025-10-21
**Status:** Ready to Configure ✅
