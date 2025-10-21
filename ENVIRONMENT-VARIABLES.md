# TexhPulze Environment Variables Guide

This document lists all required and optional environment variables for deploying TexhPulze.

## Frontend Environment Variables (Vercel)

All frontend environment variables must be prefixed with `VITE_` to be accessible in the Vite application.

### Required Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_API_URL` | `https://texhpulze.onrender.com/api` | Backend API URL on Render |

### Optional Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_APP_NAME` | `TexhPulze` | Application name displayed in UI |
| `VITE_APP_VERSION` | `1.0.0` | Application version |

## How to Set Environment Variables in Vercel

### Method 1: Via Vercel Dashboard

1. Go to your project on Vercel dashboard
2. Click on **Settings**
3. Click on **Environment Variables** in the left sidebar
4. For each variable:
   - Enter the **Variable Name** (e.g., `VITE_API_URL`)
   - Enter the **Value** (e.g., `https://texhpulze.onrender.com/api`)
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

### Method 2: Via Vercel CLI

```bash
vercel env add VITE_API_URL production
# Enter value when prompted: https://texhpulze.onrender.com/api

vercel env add VITE_APP_NAME production
# Enter value when prompted: TexhPulze

vercel env add VITE_APP_VERSION production
# Enter value when prompted: 1.0.0
```

## Backend Environment Variables (Render)

These should already be set in your Render backend deployment.

### Required Variables

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `DB_HOST` | `your-db-host` | Database host |
| `DB_PORT` | `3306` | Database port |
| `DB_USER` | `your-db-user` | Database username |
| `DB_PASSWORD` | `your-db-password` | Database password |
| `DB_NAME` | `tech_news` | Database name |
| `JWT_SECRET` | `your-secure-jwt-secret` | JWT signing secret |
| `NEWS_API_KEY` | `your-news-api-key` | NewsAPI key |
| `GUARDIAN_API_KEY` | `your-guardian-api-key` | Guardian API key |
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `5000` | Server port |
| `FRONTEND_URL` | `https://www.texhpulze.com` | Frontend URL for CORS |

### How to Update FRONTEND_URL on Render

**IMPORTANT:** After deploying to Vercel, you must update the `FRONTEND_URL` in Render:

1. Go to Render dashboard → Your backend service
2. Click **Environment** in the left sidebar
3. Find or add `FRONTEND_URL`
4. Set value to your Vercel domain:
   - Development: `https://texhpulze.vercel.app`
   - Production: `https://www.texhpulze.com`
5. Click **Save Changes**
6. Render will automatically restart your service

## Local Development

For local development, create a `.env` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` with your values:

```env
VITE_API_URL=https://texhpulze.onrender.com/api
VITE_APP_NAME=TexhPulze
VITE_APP_VERSION=1.0.0
```

**Note:** `.env` is in `.gitignore` and will not be committed to version control.

## Verification

After setting environment variables, verify they're loaded correctly:

### In Vercel
1. Go to your deployment logs
2. Look for "Build" output
3. Check that environment variables are being used (values are hidden for security)

### In Browser
Open browser console and check:
```javascript
// This will show the API URL being used
console.log(import.meta.env.VITE_API_URL)
```

## Troubleshooting

### Variable not accessible in code
- Ensure variable name starts with `VITE_`
- Redeploy after adding variables
- Clear browser cache

### CORS errors
- Verify `FRONTEND_URL` is correct on Render backend
- Ensure no trailing slashes in URLs
- Check that Render backend is running

### API connection fails
- Verify `VITE_API_URL` is correct
- Check that Render backend is deployed and running
- Test backend URL directly in browser

## Security Best Practices

1. **Never commit** `.env` files to Git
2. **Use different values** for development/staging/production
3. **Rotate secrets** regularly (JWT_SECRET, API keys)
4. **Keep API keys** secure - don't share in public forums
5. **Use Vercel's encrypted** storage for sensitive values
