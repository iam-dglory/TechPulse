# TexhPulze Vercel Deployment Guide

## Prerequisites
- Backend deployed on Render
- Vercel account

## Vercel Deployment Settings

### 1. Build Settings
When importing to Vercel, use these settings:

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

**Framework Preset:**
```
Vite
```

### 2. Environment Variables

Add these environment variables in your Vercel project settings:

#### Required Variables:

**VITE_API_URL**
```
https://texhpulze.onrender.com/api
```
This is your actual Render backend URL.

#### Optional Variables:

**VITE_APP_NAME**
```
TexhPulze
```

**VITE_APP_VERSION**
```
1.0.0
```

### 3. Root Directory
If asked for root directory, use:
```
./
```

## Important Notes

1. **CORS Configuration**: Make sure your Render backend allows your Vercel domain in CORS settings.

   In your backend `env` on Render, set:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

2. **API Endpoint Format**: Ensure your `VITE_API_URL` ends with `/api` if your backend routes are prefixed with `/api`.

3. **HTTPS**: Vercel automatically provides HTTPS. Make sure your Render backend also uses HTTPS.

4. **Environment Variable Prefix**: All frontend environment variables MUST start with `VITE_` to be accessible in the app.

## Deployment Steps

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your TexhPulze repository
   - Configure build settings (see above)
   - Add environment variables
   - Click "Deploy"

3. **Update Backend CORS**
   - Once deployed, copy your Vercel URL
   - Update `FRONTEND_URL` in your Render backend environment variables
   - Restart your Render backend

## Testing

After deployment:
1. Visit your Vercel URL
2. Check browser console for any API errors
3. Test authentication (login/register)
4. Verify API calls are reaching your Render backend

## Troubleshooting

### 404 Errors
- Ensure `vercel.json` exists with proper rewrites configuration
- Check that `base: '/'` is set in `vite.config.js`

### API Connection Errors
- Verify `VITE_API_URL` is correct in Vercel environment variables
- Check CORS settings in backend
- Ensure backend is running on Render

### Build Failures
- Check that all dependencies are in `package.json`
- Verify Node version compatibility
- Review build logs in Vercel dashboard

## Files Created/Modified for Deployment

- `vercel.json` - Vercel configuration for SPA routing
- `vite.config.js` - Updated with environment variable support
- `.env.example` - Template for environment variables
- `.vercelignore` - Excludes unnecessary files from deployment
- `src/services/api.js` - API service with environment variable support
- `DEPLOYMENT.md` - This file

## Next Steps After Deployment

1. Configure custom domain (optional)
2. Set up monitoring/analytics
3. Enable automatic deployments from GitHub
4. Configure preview deployments for PRs
