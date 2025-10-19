# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TechPulse/TexhPulze** is a comprehensive tech news aggregation and company ethics evaluation platform. This is a monorepo containing multiple applications:

1. **Backend API** (`backend/`) - Node.js/TypeScript REST API with Express, TypeORM, PostgreSQL
2. **Web Frontend** (`techpulze/`) - Next.js 15 App Router with React 19, TypeScript, TailwindCSS, Supabase
3. **Mobile App** (`mobile/`, `TexhPulzeMobile/`) - React Native cross-platform app
4. **Ethics Evaluator API** (`api/`) - FastAPI Python service for company ethics scoring
5. **Hardware Integration** - ESP32/Raspberry Pi scripts for "LingoPods" physical devices

The platform provides tech news aggregation, company profiles with ethics scoring, user-generated content (stories, reviews), premium company features, B2B APIs, daily tech briefs, and hardware integration for offline/embedded use.

## Development Commands

### Full Stack Development (Docker)

```bash
# Quick start - setup everything for new developers
make setup

# Start all services
make dev              # API, DB, Redis
make dev-full         # Includes admin tools (pgAdmin, Redis Commander)

# View logs
make logs             # All services
make logs-api         # API only
make logs-worker      # Background worker only

# Database operations
make seed             # Seed with sample data
make seed-fresh       # Drop DB, recreate, and seed
make migrate          # Run migrations
make migrate-fresh    # Reset and run all migrations

# Testing
make test             # All tests
make test-api         # Backend API tests only
make test-scoring     # Ethics scoring tests
make test-integration # Integration tests

# Utilities
make shell-api        # Shell into API container
make shell-db         # PostgreSQL shell
make shell-redis      # Redis CLI
make health           # Check all services
make clean            # Stop and remove everything
```

### Backend API (Node.js/TypeScript)

```bash
cd backend

# Development
npm run dev           # Development with nodemon
npm run dev:ts        # TypeScript dev mode
npm run dev:ts:watch  # TypeScript with auto-reload

# Production servers (different entry points)
npm run start         # Render.com deployment
npm run production    # Generic production
npm run replit        # Replit.com deployment

# Database
npm run seed          # Seed database
npm run test:seed     # Test seeding
npm run typeorm:migrate          # Run migrations
npm run typeorm:migrate:generate # Generate migration
npm run typeorm:migrate:revert   # Revert last migration

# Testing
npm run test          # Run all tests
npm run test:backend  # Backend tests
npm run test:scoring  # Scoring logic tests
npm run test:integration  # Integration tests
npm run test:coverage     # Coverage report
npm run test:claims       # Test claim workflow
npm run test:impact-api   # Test impact scoring API

# Worker (background jobs)
npm run worker        # Production worker
npm run worker:dev    # Development worker
npm run worker:watch  # Worker with auto-reload

# Type checking
npm run type-check    # TypeScript type checking
npm run build         # Compile TypeScript
```

### Web Frontend (Next.js)

```bash
cd techpulze

npm run dev           # Dev server with Turbopack
npm run build         # Production build with Turbopack
npm run start         # Production server
npm run lint          # ESLint
```

### Mobile App (React Native)

```bash
cd mobile  # or TexhPulzeMobile

npm start             # Start Metro bundler
npm run android       # Run on Android
npm run ios           # Run on iOS
npm run test          # Run tests
npm run lint          # ESLint
```

### Ethics Evaluator API (Python/FastAPI)

```bash
cd api

# Install dependencies
pip install -r requirements.txt

# Development
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or from root:
npm run api:dev
npm run api:install
```

### Root-Level Scripts

```bash
# Full stack development
npm run dev           # Frontend only
npm run dev:full      # Frontend + Backend API concurrently
npm run setup         # Install all dependencies
```

## Architecture

### Backend API Structure (`backend/src/`)

**Entry Points:**
- `server.js` - Development server
- `server.ts` - TypeScript development server
- `server.production.js` - Production deployment
- `server.render.js` - Render.com specific
- `server.replit.js` - Replit.com specific

**Core Directories:**
- `controllers/` - Request handlers for all features
  - `storyController.ts` - Tech news stories CRUD
  - `companyController.ts` - Company profiles and claims
  - `premiumCompanyController.ts` - Premium company features
  - `authController.ts` - Authentication/authorization
  - `briefController.ts` - Daily tech briefs
  - `eli5SuggestionController.ts` - ELI5 content suggestions
  - `graveyardController.ts` - Deprecated/discontinued products
  - `legalController.ts` - Legal disputes tracking
  - `flagController.ts` - Content moderation flags
  - `b2bController.ts` - B2B API endpoints
  - `newsletterController.ts` - Newsletter subscriptions
  - `userImpactController.ts` - User impact scoring

- `models/` - TypeORM entities (database models)
- `routes/` - Express route definitions
- `services/` - Business logic layer
- `middleware/` - Express middleware (auth, validation, etc.)
- `migrations/` - TypeORM database migrations
- `seeders/` - Database seed data
- `config/` - Configuration files
- `worker/` - Background job processing (BullMQ/Redis)

**Database:** PostgreSQL with TypeORM ORM

**Background Jobs:** BullMQ with Redis for async processing

### Frontend Structure (`techpulze/`)

Built with **Next.js 15 App Router**, uses **Turbopack** for faster builds.

- `src/app/` - App Router pages and API routes
  - `page.tsx` - Home page
  - `api/` - API route handlers (server-side)
  - `companies/` - Company pages
    - `[id]/page.tsx` - Company detail page
    - `create/page.tsx` - Create company
    - `search/page.tsx` - Search companies
  - `news/` - News pages
  - `layout.tsx` - Root layout
  - `globals.css` - Global styles

- `src/components/` - React components
- `src/hooks/` - Custom React hooks (e.g., `useDebounce.ts`)
- `src/types/` - TypeScript type definitions (`database.ts`)

**Database:** Supabase (PostgreSQL) with `@supabase/supabase-js`

**UI Framework:** TailwindCSS 4 + Radix UI components

### Mobile App Structure (`mobile/`, `TexhPulzeMobile/`)

React Native app with:
- React Navigation (stack + bottom tabs)
- AsyncStorage for local data
- Axios for API calls
- React Native Reanimated for animations

### Ethics Evaluator API (`api/`)

FastAPI service for evaluating company ethics:
- `main.py` - FastAPI app and routes
- `models.py` - Pydantic models
- `evaluator.py` - Ethics scoring algorithms
- `routes.py` - Additional route handlers

**Scoring Categories:**
1. Ethical Practices (40% weight)
2. Credibility (30% weight)
3. Social Responsibility (30% weight)

### Hardware Integration

Python scripts for embedded/offline use:
- `lingopods_core.py` - Core functionality
- `lingopods_esp32.py` - ESP32 microcontroller integration
- `lingopods_rpi.py` - Raspberry Pi integration
- `lingopods_offline.py` - Offline mode

## Testing Strategy

### Backend Tests
- Located in `backend/tests/`
- Uses Jest with `ts-jest` preset
- Test setup in `tests/setup.ts`
- Coverage reporting enabled

**Test Commands:**
```bash
npm run test:backend      # All backend tests
npm run test:scoring      # Scoring logic only
npm run test:integration  # Integration tests
npm run test:coverage     # With coverage
```

### Running Individual Tests
```bash
cd backend
npx jest tests/path/to/test.test.ts
```

## Database Migrations

Using TypeORM migrations:

```bash
# Generate migration from entity changes
npm run typeorm:migrate:generate -- -n MigrationName

# Run pending migrations
npm run typeorm:migrate

# Revert last migration
npm run typeorm:migrate:revert
```

Migration files in `backend/src/migrations/`

## Environment Variables

### Backend (`.env` in `backend/`)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection for workers
- `JWT_SECRET` - JWT signing secret
- `PORT` - API port (default: 5000)
- Sentry, Segment, PostHog analytics keys
- OpenAI API key for AI features

### Frontend (`.env.local` in `techpulze/`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Root Level (`.env`)
- See `env.example` for template
- Production variables in `.env.production`

## Deployment

### Docker (Recommended for Development)
```bash
make dev              # Development environment
make dev-full         # With admin tools
docker-compose up     # Manual start
```

### Production Deployments

**Backend:**
- Render.com: Uses `server.render.js`
- Replit: Uses `server.replit.js`
- Generic: Uses `server.production.js`

**Frontend:**
- Next.js production build
- Deploy to Vercel, Netlify, or custom server

**Configuration:**
- `docker-compose.yml` - Development
- `docker-compose.prod.yml` - Production
- `Dockerfile.backend` - Backend container
- `Dockerfile.frontend` - Frontend container
- nginx configurations for reverse proxy

### Deployment Scripts
```bash
./deploy.sh            # Linux/Mac deployment
./deploy.ps1           # Windows PowerShell deployment
./setup-production.ps1 # Production setup
```

## Key Features

### Company Profiles & Ethics
- Company creation and verification
- Company claim workflow (employees can claim ownership)
- Premium company profiles with enhanced features
- Ethics scoring across 3 dimensions
- Reviews and ratings

### Content Management
- Tech news stories (CRUD)
- ELI5 (Explain Like I'm 5) suggestions
- Daily tech briefs
- Graveyard tracking (deprecated products)
- Legal disputes database
- Content flagging/moderation

### User Features
- Authentication with JWT
- User impact scoring
- Favorites and bookmarks
- Newsletter subscriptions
- B2B API access

### Background Processing
- Worker service (`backend/src/worker/`)
- Uses BullMQ + Redis
- Handles async tasks (emails, notifications, data processing)

## Important Notes

### Multiple Server Entry Points
The backend has several entry points for different deployment environments. When making changes to server initialization:
- `server.js` - Development (used by `npm run dev`)
- `server.ts` - TypeScript development
- `server.production.js` - Production deployments
- `server.render.js` - Render.com (production)
- `server.replit.js` - Replit.com

Ensure changes are propagated across relevant entry points.

### TypeScript Configuration
- Backend: `backend/tsconfig.json`
- Frontend: `techpulze/tsconfig.json`
- Root: `tsconfig.json`
- Path aliases: `@/` maps to `src/` in backend

### Database Migrations
Always create migrations for schema changes:
```bash
cd backend
npm run typeorm:migrate:generate -- -n DescriptiveName
npm run typeorm:migrate
```

### Seeding Data
Sample data seeders in `backend/src/seeders/`. Run with:
```bash
make seed          # Docker
npm run seed       # Direct
npm run test:seed  # Test seeding
```

## Working with Git Branches

Current branch: `revamp/texhpulze-2.0`

Main development happens on feature branches. Key branches:
- `master` - Production-ready code
- `revamp/texhpulze-2.0` - Major platform overhaul (current)

## Port Configuration

Default ports:
- **Frontend:** 3000
- **Backend API:** 5000
- **PostgreSQL:** 5432
- **Redis:** 6379
- **pgAdmin:** 8080 (with `make dev-full`)
- **Redis Commander:** 8081 (with `make dev-full`)
- **Python FastAPI:** 8000

## Additional Documentation

The repository contains extensive documentation:
- `DEPLOY.md` - Deployment guide
- `DEPLOYMENT-SETUP.md` - Setup instructions
- `LOCAL-DEVELOPMENT.md` - Local dev guide
- `TESTING.md` - Testing guidelines
- `CLAIM-WORKFLOW-GUIDE.md` - Company claim process
- `COMPANY-CLAIM-TESTING-GUIDE.md` - Testing claims
- `DAILY-BRIEF-TESTING-GUIDE.md` - Testing briefs
- `ELI5-TESTING-GUIDE.md` - Testing ELI5 features
- `GRAVEYARD-TESTING-GUIDE.md` - Testing graveyard
- `EMBEDDED_USAGE_GUIDE.md` - Hardware integration
- `HARDWARE_SETUP_GUIDE.md` - Hardware setup
- `LINGOPODS_USAGE.md` - LingoPods usage
- Various deployment guides for Docker, Render, Replit

Refer to these files for detailed information on specific features and workflows.
