# < DNS Configuration Guide for techpulze.com

## Complete Guide to Connect Your Domain to Vercel

Since your deployment is verified and done, let's connect your custom domain!

---

##  **Prerequisites Completed**

You mentioned everything is verified:
-  Vercel deployment successful
-  Site running on Vercel URL
-  Domain ownership verified
-  Ready to configure DNS

**Perfect! Let's configure DNS now.**

---

## <¯ **Quick Summary: 2 Methods**

### **Method 1: Vercel Nameservers (Recommended - Easiest)**
- Change nameservers at domain registrar
- Vercel manages everything automatically
- **Best for:** Complete control by Vercel
- **Time:** 5 min setup + 24-48 hours propagation

### **Method 2: Custom DNS Records**
- Keep your current nameservers
- Add A and CNAME records manually
- **Best for:** Keep other DNS settings
- **Time:** 5 min setup + 5-30 min propagation

---

## =€ **Method 1: Vercel Nameservers (Recommended)**

### **Step 1: Add Domain in Vercel Dashboard**

1. **Go to Vercel Dashboard:**
   - URL: https://vercel.com/dashboard
   - Select your **techpulze** project
   - Click **"Settings"** ’ **"Domains"**

2. **Add Domain:**
   - Click **"Add Domain"**
   - Enter: `techpulze.com`
   - Click **"Add"**

3. **Add www subdomain:**
   - Click **"Add Domain"** again
   - Enter: `www.techpulze.com`
   - Click **"Add"**

### **Step 2: Get Vercel Nameservers**

Vercel will show you nameservers to use:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Keep this page open - you'll need these!**

### **Step 3: Update Nameservers at Your Domain Registrar**

**Where is your domain registered?**

#### **For GoDaddy:**
1. Go to: https://account.godaddy.com/products
2. Find **techpulze.com**
3. Click **"DNS"** or **"Manage DNS"**
4. Scroll to **"Nameservers"**
5. Click **"Change"**
6. Select **"Custom"**
7. Enter:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
8. Click **"Save"**

#### **For Namecheap:**
1. Go to: https://ap.www.namecheap.com/domains/list/
2. Find **techpulze.com**
3. Click **"Manage"**
4. Find **"Nameservers"** section
5. Select **"Custom DNS"**
6. Enter:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
7. Click **green checkmark** to save

#### **For Cloudflare:**
1. Go to: https://dash.cloudflare.com
2. Select **techpulze.com**
3. Click **"DNS"** ’ **"Records"**
4. Remove all existing records
5. Go to **"Overview"**
6. Scroll to **"Nameservers"**
7. Click **"Change nameservers"**
8. Enter Vercel nameservers

#### **For Domain.com:**
1. Go to: https://www.domain.com/control-panel/domain
2. Select **techpulze.com**
3. Click **"DNS & Nameservers"**
4. Click **"Nameservers"**
5. Select **"Use custom nameservers"**
6. Enter:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
7. Click **"Update"**

### **Step 4: Wait for Propagation**

- **Typical time:** 5-30 minutes
- **Maximum time:** 48 hours
- **Average:** 2-4 hours

**Check status:**
- Vercel Dashboard will show verification status
- Green checkmark = DNS configured correctly
- SSL certificate issued automatically

### **Step 5: Verify DNS Propagation**

**Check if DNS is working:**

1. **Online checker:**
   - Go to: https://dnschecker.org
   - Enter: `techpulze.com`
   - Check nameservers globally

2. **Command line (PowerShell):**
   ```powershell
   nslookup techpulze.com
   ```
   Should show Vercel's IP

3. **Browser:**
   - Try: https://techpulze.com
   - If loading, DNS is working!

---

## =' **Method 2: Custom DNS Records (Keep Your Nameservers)**

Use this if you want to keep your current DNS provider.

### **Step 1: Add Domain in Vercel**

Same as Method 1, Step 1:
- Vercel Dashboard ’ Settings ’ Domains
- Add `techpulze.com` and `www.techpulze.com`

### **Step 2: Get Vercel's IPs**

Vercel will show you the DNS records to add:

**For apex domain (techpulze.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### **Step 3: Add DNS Records at Your Provider**

**Go to your DNS provider's dashboard:**

#### **GoDaddy:**
1. Go to: https://account.godaddy.com/products
2. Find **techpulze.com** ’ **"DNS"**
3. Click **"Add"** to add new record
4. **Record 1 - Apex domain:**
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   - TTL: `1 Hour` (or 3600)
   - Click **"Save"**
5. **Record 2 - www:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `1 Hour`
   - Click **"Save"**

#### **Namecheap:**
1. Go to: https://ap.www.namecheap.com/domains/list/
2. Find **techpulze.com** ’ **"Manage"**
3. Click **"Advanced DNS"**
4. Click **"Add New Record"**
5. **Record 1:**
   - Type: `A Record`
   - Host: `@`
   - Value: `76.76.21.21`
   - TTL: `Automatic` or `1 Hour`
6. **Record 2:**
   - Type: `CNAME Record`
   - Host: `www`
   - Target: `cname.vercel-dns.com`
   - TTL: `Automatic`
7. Click **green checkmark** to save

#### **Cloudflare:**
1. Go to: https://dash.cloudflare.com
2. Select **techpulze.com**
3. Click **"DNS"** ’ **"Records"**
4. Click **"Add record"**
5. **Record 1:**
   - Type: `A`
   - Name: `@`
   - IPv4 address: `76.76.21.21`
   - Proxy status: `Proxied` (orange cloud) or `DNS only`
   - Click **"Save"**
6. **Record 2:**
   - Type: `CNAME`
   - Name: `www`
   - Target: `cname.vercel-dns.com`
   - Proxy status: `Proxied`
   - Click **"Save"**

**Note:** If using Cloudflare proxy, SSL/TLS mode should be "Full" or "Full (strict)"

### **Step 4: Wait for Propagation**

- **Typical time:** 5-30 minutes
- **Maximum:** 48 hours

### **Step 5: Verify**

Check at: https://dnschecker.org

---

## = **SSL Certificate (Automatic)**

Once DNS is configured:

1. **Vercel automatically:**
   - Detects DNS is pointing to Vercel
   - Issues Let's Encrypt SSL certificate
   - Enables HTTPS
   - Sets up HTTP ’ HTTPS redirect

2. **Timeline:**
   - DNS configured: 5-30 min
   - SSL issued: 5 minutes after DNS
   - Total: Usually under 1 hour

3. **Verify SSL:**
   - Visit: https://techpulze.com
   - Look for = in browser
   - Click padlock ’ Certificate valid

---

##  **Domain Configuration Checklist**

Mark as you complete:

### **In Vercel Dashboard:**
- [ ] Added `techpulze.com` to project
- [ ] Added `www.techpulze.com` to project
- [ ] Got nameservers or DNS records from Vercel

### **At Domain Registrar:**
- [ ] Logged into domain account
- [ ] Found DNS/Nameserver settings
- [ ] Updated to Vercel nameservers OR added A/CNAME records
- [ ] Saved changes

### **Verification:**
- [ ] Checked dnschecker.org
- [ ] Vercel shows domain as verified (green checkmark)
- [ ] SSL certificate issued (= in browser)
- [ ] http://techpulze.com redirects to https://
- [ ] www.techpulze.com works
- [ ] techpulze.com (no www) works

---

## =P **DNS Propagation Timeline**

**What to expect:**

| Time | Status |
|------|--------|
| **0-5 min** | DNS changes saved at registrar |
| **5-30 min** | DNS starts propagating globally |
| **30 min** | Usually working in most locations |
| **2-4 hours** | Working globally for most users |
| **24-48 hours** | Fully propagated everywhere (max) |

**Don't panic if it's not instant!** DNS propagation is gradual.

---

## = **Checking DNS Status**

### **Method 1: Online Checker**
```
Website: https://dnschecker.org
Enter: techpulze.com
Type: A (for apex) or CNAME (for www)
```

### **Method 2: Command Line**
```powershell
# Check nameservers
nslookup -type=NS techpulze.com

# Check A record
nslookup techpulze.com

# Check CNAME
nslookup www.techpulze.com
```

### **Method 3: Vercel Dashboard**
- Go to: Settings ’ Domains
- Look for green checkmark next to domain
- Shows: "Valid Configuration"

---

## <¯ **Domain Redirect Configuration**

**In Vercel Dashboard:**

After domain is added, configure redirects:

1. **Settings** ’ **Domains**
2. Find `www.techpulze.com`
3. Click **î** (three dots)
4. Select **"Redirect to..."**
5. Choose: `techpulze.com` (redirect www ’ non-www)
   - OR choose: `www.techpulze.com` (redirect non-www ’ www)

**Recommended:** Redirect www ’ non-www
- Primary: `techpulze.com`
- Redirect: `www.techpulze.com` ’ `techpulze.com`

---

## = **Troubleshooting**

### **Issue: Domain not verifying in Vercel**

**Solutions:**
1. Wait 30 minutes and refresh
2. Check DNS records are correct
3. Use `nslookup techpulze.com` to verify
4. Try "Refresh" in Vercel Domains page
5. Remove and re-add domain

### **Issue: SSL certificate not issued**

**Solutions:**
1. Wait 5 more minutes after DNS is verified
2. Check domain shows "Valid Configuration" in Vercel
3. Try visiting https://techpulze.com to trigger issuance
4. Contact Vercel support if >1 hour

### **Issue: Site shows "404: NOT_FOUND"**

**Solutions:**
1. Check deployment is successful
2. Verify domain is added to correct project
3. Re-deploy: Vercel Dashboard ’ Deployments ’ Redeploy

### **Issue: DNS not propagating**

**Solutions:**
1. Wait 24-48 hours (maximum)
2. Clear DNS cache:
   ```powershell
   ipconfig /flushdns
   ```
3. Try different DNS checker: https://whatsmydns.net
4. Test from different network (mobile data)

### **Issue: Shows old/wrong website**

**Solutions:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Try incognito mode
3. Check correct DNS records set
4. Wait for propagation

---

## =Ê **Verify Everything is Working**

### **Final Test Checklist:**

- [ ] `http://techpulze.com` redirects to `https://techpulze.com`
- [ ] `http://www.techpulze.com` redirects to `https://techpulze.com`
- [ ] SSL certificate valid (= in browser)
- [ ] Homepage loads
- [ ] Company pages work: `/companies/[id]`
- [ ] Voting interface visible
- [ ] Can submit votes
- [ ] All images/assets load
- [ ] Mobile responsive
- [ ] No console errors (F12)

---

## <Š **Success! Your Domain is Live!**

Once all checks pass, your site is live at:

### **< https://techpulze.com**

With:
-  Custom domain configured
-  SSL/HTTPS enabled
-  Global CDN active
-  www redirect working
-  Voting system live
-  Production ready!

---

## =Þ **Need Help?**

**Vercel DNS Support:**
- Docs: https://vercel.com/docs/concepts/projects/domains
- Support: https://vercel.com/support

**DNS Troubleshooting:**
- Checker: https://dnschecker.org
- Propagation: https://whatsmydns.net

**Domain Registrar Support:**
- GoDaddy: https://www.godaddy.com/help
- Namecheap: https://www.namecheap.com/support
- Cloudflare: https://support.cloudflare.com

---

## =€ **You're Live!**

Your TechPulze voting system is now accessible at your custom domain!

**Share it:**
- =& Twitter
- =¼ LinkedIn
- =ñ Social media
- =€ Product Hunt

**Congratulations!** <‰<Š(
