# TexhPulze Deployment Setup Guide

This guide explains how to set up CI/CD workflows and deploy TexhPulze to production using GitHub Actions and Render.

## GitHub Secrets Configuration

To enable CI/CD workflows, you need to configure the following secrets in your GitHub repository.

### Setting up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

### Required Secrets

#### 🔐 **DATABASE_URL**

```
Description: PostgreSQL connection string for production database
Example: postgresql://username:password@hostname:5432/database_name
Source: Render database connection string
```

#### 🤖 **OPENAI_API_KEY**

```
Description: OpenAI API key for AI-powered features
Example: sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Source: OpenAI dashboard (https://platform.openai.com/api-keys)
```

#### 📱 **EAS_TOKEN**

```
Description: Expo Application Services authentication token
Example: exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Source: Expo CLI (run: eas login, then eas whoami)
```

#### 🚀 **RENDER_API_KEY**

```
Description: Render API key for deployment automation
Example: rnd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Source: Render dashboard (https://dashboard.render.com/account/settings)
```

#### 🔧 **EXPO_TOKEN**

```
Description: Expo authentication token for CI/CD
Example: exp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Source: Expo CLI (run: expo login, then expo whoami)
```

### Optional Secrets

#### 🔍 **SNYK_TOKEN**

```
Description: Snyk security scanning token
Example: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Source: Snyk dashboard (https://app.snyk.io/account)
```

#### 📢 **SLACK_WEBHOOK**

```
Description: Slack webhook for build notifications
Example: https://hooks.slack.com/services/YOUR_WORKSPACE_ID/YOUR_CHANNEL_ID/YOUR_WEBHOOK_TOKEN
Source: Slack app configuration
```

#### 🏪 **GOOGLE_SERVICE_ACCOUNT_KEY**

```
Description: Google Play Console service account JSON key
Example: {"type": "service_account", "project_id": "...", ...}
Source: Google Play Console API access
```

## CI/CD Workflows

### Backend CI Workflow (`.github/workflows/backend-ci.yml`)

This workflow runs on every push and pull request to the backend:

**Features:**

- ✅ Node.js 18.x and 20.x testing
- ✅ PostgreSQL service for database tests
- ✅ Linting and type checking
- ✅ Database migrations
- ✅ Unit and integration tests
- ✅ Test coverage reporting
- ✅ Security auditing
- ✅ Build artifact generation

**Jobs:**

1. **test**: Runs tests across Node.js versions
2. **build**: Builds the application
3. **security**: Security scanning and auditing
4. **deploy-staging**: Deploys to staging on develop branch
5. **deploy-production**: Deploys to production on main branch

### Mobile EAS Workflow (`.github/workflows/mobile-eas.yml`)

This workflow builds and deploys the mobile app:

**Features:**

- ✅ Component testing
- ✅ Android preview builds
- ✅ iOS preview builds
- ✅ Production builds
- ✅ Google Play submission (optional)
- ✅ Build artifact distribution
- ✅ Slack notifications

**Jobs:**

1. **test**: Runs mobile component tests
2. **build-android-preview**: Builds Android preview APK
3. **build-ios-preview**: Builds iOS preview IPA
4. **build-production**: Builds production versions
5. **notify**: Sends build status notifications

## Render Deployment Configuration

### Render Blueprint (`deploy/render.yaml`)

The Render blueprint defines the complete infrastructure:

**Services:**

- **texhpulze-api**: Main API service
- **texhpulze-worker**: Background job processor
- **texhpulze-frontend**: Static frontend site (optional)

**Databases:**

- **texhpulze-db**: PostgreSQL database
- **texhpulze-redis**: Redis cache

### Connecting Repository to Render

1. **Fork or Connect Repository:**

   ```bash
   # Option 1: Connect existing repo
   # Go to Render dashboard → New → Web Service → Connect GitHub repo

   # Option 2: Use Render Blueprint
   # Go to Render dashboard → New → Blueprint → Connect GitHub repo
   ```

2. **Configure Environment Variables:**

   - Set `DATABASE_URL` from Render database
   - Set `JWT_SECRET` (auto-generated)
   - Set `OPENAI_API_KEY` from GitHub secrets
   - Set `FRONTEND_URL` to your frontend domain

3. **Deploy:**
   ```bash
   # Render will automatically deploy on push to main branch
   git push origin main
   ```

## Manual Deployment Steps

### 1. Set up GitHub Secrets

```bash
# Get EAS token
npx eas login
npx eas whoami

# Get Expo token
npx expo login
npx expo whoami

# Get Render API key from dashboard
# https://dashboard.render.com/account/settings
```

### 2. Configure Render

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm ci && npm run build && npm run typeorm:migrate`
4. Set start command: `cd backend && npm run start`
5. Add environment variables from secrets

### 3. Set up Database

1. Create PostgreSQL database in Render
2. Copy connection string to `DATABASE_URL`
3. Run migrations: `npm run typeorm:migrate`

### 4. Configure Mobile Builds

1. Set up EAS project:

   ```bash
   cd TexhPulzeMobile
   npx eas build:configure
   ```

2. Update `eas.json` with production profiles:
   ```json
   {
     "cli": {
       "version": ">= 5.2.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       },
       "production": {
         "android": {
           "buildType": "aab"
         }
       }
     }
   }
   ```

## Environment Variables Reference

### Backend Environment Variables

| Variable         | Required | Description                  | Example                               |
| ---------------- | -------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL`   | Yes      | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET`     | Yes      | JWT signing secret           | `your-super-secret-jwt-key`           |
| `OPENAI_API_KEY` | No       | OpenAI API key               | `sk-proj-...`                         |
| `NODE_ENV`       | Yes      | Environment                  | `production`                          |
| `PORT`           | No       | Server port                  | `5000`                                |
| `FRONTEND_URL`   | No       | Frontend URL                 | `https://texhpulze.com`               |
| `API_BASE_URL`   | No       | API base URL                 | `https://api.texhpulze.com`           |

### Mobile Environment Variables

| Variable       | Required | Description               | Example                     |
| -------------- | -------- | ------------------------- | --------------------------- |
| `EXPO_TOKEN`   | Yes      | Expo authentication token | `exp_...`                   |
| `EAS_TOKEN`    | Yes      | EAS authentication token  | `exp_...`                   |
| `API_BASE_URL` | No       | Backend API URL           | `https://api.texhpulze.com` |

## Troubleshooting

### Common Issues

1. **Build Failures:**

   ```bash
   # Check build logs in GitHub Actions
   # Verify all secrets are set correctly
   # Ensure package.json scripts are correct
   ```

2. **Database Connection Issues:**

   ```bash
   # Verify DATABASE_URL format
   # Check database is accessible from Render
   # Ensure migrations are running
   ```

3. **Mobile Build Failures:**

   ```bash
   # Check EAS_TOKEN and EXPO_TOKEN
   # Verify eas.json configuration
   # Check app.config.js settings
   ```

4. **Deployment Issues:**
   ```bash
   # Check Render logs
   # Verify environment variables
   # Check health check endpoint
   ```

### Debug Commands

```bash
# Test database connection
npm run typeorm:migrate

# Test API locally
npm run dev:ts

# Test mobile build locally
cd TexhPulzeMobile
npx eas build --platform android --profile preview --local

# Check GitHub Actions logs
# Go to Actions tab in GitHub repository
```

## Security Considerations

1. **Secrets Management:**

   - Never commit secrets to repository
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly

2. **Environment Isolation:**

   - Use different databases for staging/production
   - Separate API keys for different environments
   - Implement proper access controls

3. **Monitoring:**
   - Set up health checks
   - Monitor build success rates
   - Track deployment metrics

## Next Steps

After successful deployment:

1. **Set up monitoring** (e.g., Sentry, DataDog)
2. **Configure CDN** for static assets
3. **Set up backup strategies** for database
4. **Implement staging environment**
5. **Set up automated testing** in staging
6. **Configure SSL certificates**
7. **Set up domain and DNS**

For additional help, refer to:

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Documentation](https://render.com/docs)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
