# 🚀 TexhPulze Web Deployment Guide

## ✅ Step-by-Step Deployment Process

### Step 1: Create Static Web Build

```bash
# In your TexhPulzeMobile directory
npx expo export --platform web
```

This generates:
```
dist/
 └── web-build/
      ├── index.html
      ├── assets/
      ├── static/js/
      └── manifest.json
```

### Step 2: Configure Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings → General → Build & Output Settings**
3. Set **Output Directory** to: `dist/web-build`
4. Save changes

### Step 3: Deploy to Vercel

```bash
# Option 1: Direct deployment
npx vercel --prod --token=$VERCEL_TOKEN

# Option 2: Using npm script
npm run deploy:web
```

### Step 4: Verify Deployment

- Visit your deployed URL
- Check that all routes work correctly
- Verify assets are loading properly

## 🔧 Available Scripts

```bash
# Build web version only
npm run build:web

# Build and deploy in one command
npm run deploy:web

# Serve locally for testing
npm run web:serve
```

## 📁 File Structure

```
TexhPulzeMobile/
├── dist/web-build/          # Generated web build
├── public/_redirects        # SPA routing support
├── vercel.json             # Vercel configuration
└── package.json            # Build scripts
```

## 🌐 Domain Configuration

After deployment, configure your custom domain:

1. In Vercel dashboard: **Settings → Domains**
2. Add your domain: `www.texhpulze.com`
3. Update DNS records as instructed
4. SSL certificate will be automatically provisioned

## 🚨 Troubleshooting

### Build Fails
- Check Expo configuration in `app.config.js`
- Ensure all dependencies are installed
- Verify web platform is enabled

### Deployment Issues
- Confirm Vercel token is set: `$env:VERCEL_TOKEN`
- Check output directory is correct: `dist/web-build`
- Verify vercel.json configuration

### Routing Problems
- Ensure `_redirects` file is in `public/` directory
- Check that all routes redirect to `index.html`

## 🎯 Success Indicators

✅ Build completes without errors
✅ `dist/web-build` directory is created
✅ Vercel deployment succeeds
✅ Website loads at your domain
✅ All routes work correctly
✅ Assets load properly

## 🔄 Automated Deployment

For continuous deployment, connect your GitHub repository to Vercel:

1. Import project from GitHub
2. Set build command: `npm run build:web`
3. Set output directory: `dist/web-build`
4. Enable automatic deployments on push to main branch
