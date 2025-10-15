# TexhPulze Deployment Guide

This guide provides exact commands for deploying TexhPulze locally and to production environments.

## 🚀 Quick Start

Choose your deployment method:

- **[Local Development](#local-development)** - Full local setup with Docker
- **[Render Production](#render-production)** - Deploy backend to Render
- **[EAS Mobile Build](#eas-mobile-build)** - Build mobile app with EAS

---

## 🏠 Local Development

### Prerequisites

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Node.js** (18.x or 20.x)
- **Git**

### Step 1: Clone and Setup Environment

```bash
# Clone repository
git clone <your-repo-url>
cd texhpulze

# Copy environment template
cp env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` file with your values:

```bash
# Database (use default values for local development)
POSTGRES_DB=texhpulze_dev
POSTGRES_USER=texhpulze
POSTGRES_PASSWORD=texhpulze_dev_password

# Redis
REDIS_PASSWORD=redis_dev_password

# API Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000

# Analytics (optional)
ANALYTICS_ENABLED=true
SENTRY_DSN=your-sentry-dsn-here
SEGMENT_WRITE_KEY=your-segment-write-key
POSTHOG_API_KEY=your-posthog-api-key
```

### Step 3: Start Services with Docker

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

**Expected Output:**
```
✅ Creating texhpulze-postgres ... done
✅ Creating texhpulze-redis ... done
✅ Creating texhpulze-api ... done
✅ Creating texhpulze-worker ... done

🚀 TexhPulze development environment started!
📊 API: http://localhost:5000
🗄️  Database: localhost:5432
🔴 Redis: localhost:6379
```

### Step 4: Seed Database

```bash
# Run database migrations and seed data
docker-compose exec api npm run seed
```

**Expected Output:**
```
🌱 Starting database seeding...
✅ Database connected successfully
🧹 Clearing existing data...
✅ Existing data cleared
👤 Creating admin user...
✅ Admin user created: admin@texhpulze.local (password: admin123)
👥 Creating company owner users...
✅ Created owner: ceo@pixaai.com (password: owner123) for PixaAI
🏢 Creating companies...
✅ Created company: PixaAI
📰 Creating stories...
✅ Created story: PixaAI Launches Revolutionary AI Image Generator...

🎉 Database seeding completed successfully!
```

### Step 5: Start Background Worker (Optional)

```bash
# In a new terminal, start the background worker
docker-compose exec worker npm run worker:dev
```

### Step 6: Start Mobile Development

```bash
# In a new terminal, start mobile development
cd TexhPulzeMobile
npx expo start
```

**Expected Output:**
```
✅ Starting Metro Bundler
✅ Expo DevTools is running at http://localhost:19002
📱 Scan QR code with Expo Go app
```

### Step 7: Verify Setup

```bash
# Check API health
curl http://localhost:5000/health

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api
```

### Local Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| **API** | http://localhost:5000 | Main backend API |
| **Health Check** | http://localhost:5000/health | API health endpoint |
| **Database Admin** | http://localhost:8080 | Adminer (run `make dev-full`) |
| **Redis Admin** | http://localhost:8081 | Redis Commander (run `make dev-full`) |
| **Expo DevTools** | http://localhost:19002 | Mobile development tools |

### Local Development Commands

```bash
# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Access API container shell
docker-compose exec api sh

# Access database shell
docker-compose exec postgres psql -U texhpulze -d texhpulze_dev

# Clean up everything (WARNING: deletes all data)
docker-compose down -v
```

---

## ☁️ Render Production

### Prerequisites

- **Render Account** - Sign up at [render.com](https://render.com)
- **GitHub Repository** - Push your code to GitHub
- **Environment Variables** - Prepare production values

### Step 1: Connect Repository to Render

1. **Login to Render Dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New" → "Web Service"

2. **Connect GitHub Repository**
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account
   - Select the `texhpulze` repository
   - Choose the `main` branch

### Step 2: Configure Web Service

**Basic Settings:**
```
Name: texhpulze-api
Region: Oregon (US West)
Branch: main
Root Directory: backend
```

**Build Command:**
```bash
npm ci && npm run build && npm run typeorm:migrate
```

**Start Command:**
```bash
npm run start:prod
```

**Runtime:**
```
Environment: Node
Node Version: 20
```

### Step 3: Set Environment Variables

In Render dashboard, add these environment variables:

```env
# Required Variables
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
JWT_SECRET=your-super-secure-jwt-secret-key
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Optional Variables
REDIS_URL=redis://username:password@hostname:6379
FRONTEND_URL=https://your-frontend-domain.com
API_BASE_URL=https://texhpulze-api.onrender.com
ANALYTICS_ENABLED=true
SENTRY_DSN=your-sentry-dsn
SEGMENT_WRITE_KEY=your-segment-write-key
POSTHOG_API_KEY=your-posthog-api-key
```

### Step 4: Create PostgreSQL Database

1. **Create Database Service**
   - Click "New" → "PostgreSQL"
   - Name: `texhpulze-db`
   - Plan: `Starter` (free tier)

2. **Get Connection String**
   - Copy the "External Database URL"
   - Use this as your `DATABASE_URL` in web service

### Step 5: Create Redis Cache (Optional)

1. **Create Redis Service**
   - Click "New" → "Redis"
   - Name: `texhpulze-redis`
   - Plan: `Starter` (free tier)

2. **Get Connection String**
   - Copy the "External Redis URL"
   - Use this as your `REDIS_URL` in web service

### Step 6: Deploy

1. **Save Configuration**
   - Click "Create Web Service"
   - Render will automatically build and deploy

2. **Monitor Deployment**
   - Watch build logs in Render dashboard
   - Check for any build errors

**Expected Build Output:**
```
✅ Installing dependencies...
✅ Building application...
✅ Running database migrations...
✅ Starting application...
✅ Deployment successful!
```

### Step 7: Seed Production Database

```bash
# SSH into Render service (if needed)
# Or use Render shell

# Run seed command
npm run seed:prod
```

### Step 8: Verify Production Deployment

```bash
# Check API health
curl https://texhpulze-api.onrender.com/health

# Test API endpoints
curl https://texhpulze-api.onrender.com/api/stories

# Check admin login
curl -X POST https://texhpulze-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@texhpulze.local", "password": "admin123"}'
```

### Production URLs

| Service | URL | Description |
|---------|-----|-------------|
| **API** | https://texhpulze-api.onrender.com | Production backend API |
| **Health Check** | https://texhpulze-api.onrender.com/health | API health endpoint |
| **Database** | Managed by Render | PostgreSQL database |
| **Redis** | Managed by Render | Redis cache |

### Render Management Commands

```bash
# Deploy new version (automatic on git push)
git push origin main

# View logs
# Go to Render dashboard → Service → Logs

# Restart service
# Go to Render dashboard → Service → Restart

# Scale service
# Go to Render dashboard → Service → Settings → Scale
```

---

## 📱 EAS Mobile Build

### Prerequisites

- **EAS Account** - Sign up at [expo.dev](https://expo.dev)
- **EAS CLI** - Install globally
- **Android/iOS Development** - For production builds

### Step 1: Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

### Step 2: Login to EAS

```bash
eas login
```

### Step 3: Configure EAS Project

```bash
cd TexhPulzeMobile

# Initialize EAS project
eas build:configure
```

This creates `eas.json` with build profiles:

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

### Step 4: Set EAS Secrets

```bash
# Set API base URL for production
eas secret:create --scope project --name API_BASE_URL --value "https://texhpulze-api.onrender.com"

# Set any other secrets
eas secret:create --scope project --name SENTRY_DSN --value "your-sentry-dsn"
```

### Step 5: Build Android APK (Preview)

```bash
# Build preview APK for testing
eas build --platform android --profile preview
```

**Expected Output:**
```
✅ Starting build for platform Android
✅ Build configuration loaded
✅ Build started, you can monitor it at: https://expo.dev/accounts/your-account/projects/texhpulze/builds/build-id
⏳ Build in progress...
✅ Build completed successfully!
📱 Download APK: https://expo.dev/artifacts/build-url
```

### Step 6: Build Android AAB (Production)

```bash
# Build production AAB for Google Play Store
eas build --platform android --profile production
```

### Step 7: Build iOS (Production)

```bash
# Build iOS for App Store (requires Apple Developer account)
eas build --platform ios --profile production
```

### Step 8: Submit to App Stores

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

### Build Management Commands

```bash
# List all builds
eas build:list

# Cancel a build
eas build:cancel --id build-id

# View build logs
eas build:view --id build-id

# Download build artifacts
eas build:download --id build-id

# Update app configuration
eas update
```

### Build Profiles Explained

| Profile | Purpose | Output | Distribution |
|---------|---------|--------|--------------|
| **development** | Local development | Development client | Internal |
| **preview** | Testing & QA | APK/IPA | Internal |
| **production** | App stores | AAB/IPA | Google Play/App Store |

---

## 🔧 Troubleshooting

### Local Development Issues

**Docker Build Fails:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Database Connection Issues:**
```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

**API Not Starting:**
```bash
# Check API logs
docker-compose logs api

# Check environment variables
docker-compose exec api env | grep DATABASE_URL

# Restart API service
docker-compose restart api
```

### Render Deployment Issues

**Build Fails:**
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json`
- Ensure build command is correct

**Database Connection Fails:**
- Verify `DATABASE_URL` is correct
- Check database service is running
- Ensure database allows external connections

**Environment Variables Missing:**
- Double-check all required variables are set
- Verify variable names match code expectations
- Restart service after adding variables

### EAS Build Issues

**Build Configuration Errors:**
```bash
# Validate eas.json
eas build:configure

# Check app configuration
eas config
```

**Missing Secrets:**
```bash
# List current secrets
eas secret:list

# Create missing secrets
eas secret:create --scope project --name SECRET_NAME --value "secret-value"
```

**Build Timeouts:**
- Check build logs for specific errors
- Verify all dependencies are properly configured
- Consider upgrading build plan for faster builds

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Code committed and pushed to repository
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] API keys and secrets secured
- [ ] Tests passing locally

### Local Development

- [ ] Docker and Docker Compose installed
- [ ] Environment file configured
- [ ] Services starting successfully
- [ ] Database seeded with test data
- [ ] API health check passing
- [ ] Mobile app connecting to local API

### Render Production

- [ ] Repository connected to Render
- [ ] Web service configured correctly
- [ ] PostgreSQL database created
- [ ] Environment variables set
- [ ] Build command working
- [ ] Start command working
- [ ] Health check endpoint responding
- [ ] Production database seeded

### EAS Mobile Build

- [ ] EAS CLI installed and logged in
- [ ] Project configured with `eas build:configure`
- [ ] Build profiles defined in `eas.json`
- [ ] Secrets configured for production
- [ ] Preview build successful
- [ ] Production build successful
- [ ] App submitted to stores (if applicable)

### Post-Deployment

- [ ] All services healthy and responding
- [ ] Database connections working
- [ ] API endpoints accessible
- [ ] Mobile app connecting to production API
- [ ] Analytics tracking working
- [ ] Error monitoring configured
- [ ] Performance monitoring active

---

## 🆘 Getting Help

### Common Resources

- **Docker Issues**: [Docker Documentation](https://docs.docker.com/)
- **Render Issues**: [Render Documentation](https://render.com/docs)
- **EAS Issues**: [EAS Documentation](https://docs.expo.dev/build/introduction/)
- **Expo Issues**: [Expo Documentation](https://docs.expo.dev/)

### Debug Commands

```bash
# Check service health
curl http://localhost:5000/health

# View all logs
docker-compose logs

# Check environment
docker-compose exec api env

# Test database connection
docker-compose exec api npm run typeorm:migrate

# Verify mobile connection
npx expo start --tunnel
```

### Support

For deployment issues:
1. Check the troubleshooting section above
2. Review logs for specific error messages
3. Verify all prerequisites are installed
4. Ensure environment variables are correct
5. Create an issue in the repository with logs and error details

---

## 📚 Additional Resources

- **[Local Development Guide](LOCAL-DEVELOPMENT.md)** - Detailed local setup
- **[Analytics Setup](ANALYTICS-SETUP.md)** - Analytics configuration
- **[CI/CD Workflows](DEPLOYMENT-SETUP.md)** - GitHub Actions setup
- **[API Documentation](backend/README.md)** - Backend API reference
- **[Mobile Documentation](TexhPulzeMobile/README.md)** - Mobile app guide
