# TexhPulze 2.0 Backend Setup

This document provides instructions for setting up the new TexhPulze 2.0 backend with TypeORM and PostgreSQL.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=texhpulze_2_0
DATABASE_URL=postgresql://username:password@localhost:5432/texhpulze_2_0

# Application
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret
```

### 3. Database Setup

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE texhpulze_2_0;
```

### 4. Run Migrations

```bash
npm run typeorm:migrate
```

### 5. Seed Sample Data (Optional)

```bash
npm run seed
```

### 6. Start Development Server

```bash
npm run dev:ts
```

## 📊 Database Schema

### Companies Table

- **id**: UUID primary key
- **name**: Company name
- **slug**: URL-friendly identifier
- **logoUrl**: Company logo URL
- **website**: Company website
- **sectorTags**: Array of industry tags
- **fundingStage**: Enum (pre-seed, seed, series-a, etc.)
- **investors**: Array of investor names
- **hqLocation**: Headquarters location
- **ethicsStatementUrl**: Link to ethics statement
- **privacyPolicyUrl**: Link to privacy policy
- **credibilityScore**: 0-100 credibility rating
- **ethicsScore**: 0-100 ethics rating
- **hypeScore**: 0-100 hype rating
- **verified**: Boolean verification status
- **verifiedAt**: Verification timestamp

### Products Table

- **id**: UUID primary key
- **companyId**: Foreign key to companies
- **name**: Product name
- **description**: Product description
- **priceTiers**: JSON array of pricing tiers
- **features**: JSON object of product features
- **targetUsers**: Array of target user types
- **demoUrl**: Link to product demo

### Stories Table

- **id**: UUID primary key
- **title**: Story headline
- **content**: Story content
- **sourceUrl**: Original source URL
- **companyId**: Foreign key to companies (nullable)
- **sectorTag**: Industry sector
- **hypeScore**: 0-100 hype rating
- **ethicsScore**: 0-100 ethics rating
- **realityCheck**: Fact-checking notes
- **impactTags**: Array of impact categories
- **createdBy**: Creator identifier
- **publishedAt**: Publication timestamp

### Votes Table

- **id**: UUID primary key
- **storyId**: Foreign key to stories
- **userId**: User identifier (nullable for anonymous)
- **industry**: Voter's industry
- **voteValue**: Enum (helpful, harmful, neutral)
- **comment**: Optional vote comment
- **createdAt**: Vote timestamp

## 🛠️ Available Scripts

- `npm run typeorm:migrate` - Run database migrations
- `npm run typeorm:migrate:generate` - Generate new migration
- `npm run typeorm:migrate:revert` - Revert last migration
- `npm run seed` - Seed database with sample data
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev:ts` - Start development server with TypeScript

## 🔧 TypeORM Configuration

The TypeORM configuration is in `ormconfig.ts` and includes:

- PostgreSQL connection setup
- Entity and migration paths
- SSL configuration for production
- Logging for development

## 📝 Model Features

### Company Model

- **Virtual Fields**: `overallScore`, `isHighRisk`, `isVerified`
- **Relations**: One-to-many with Products and Stories
- **Indexes**: slug (unique), name, verified

### Product Model

- **Virtual Fields**: `hasFreeTier`, `startingPrice`, `totalFeatures`
- **Relations**: Many-to-one with Company
- **Features**: JSONB for flexible feature storage

### Story Model

- **Virtual Fields**: `isPublished`, `overallScore`, `voteCount`, `sentimentScore`
- **Relations**: Many-to-one with Company, One-to-many with Votes
- **Indexes**: companyId, sectorTag, publishedAt, createdBy

### Vote Model

- **Virtual Fields**: `isPositive`, `isNegative`, `hasComment`, `voteWeight`
- **Relations**: Many-to-one with Story
- **Constraints**: Unique voting per user per story

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Enable SSL for database connection
4. Run migrations: `npm run typeorm:migrate`
5. Build TypeScript: `npm run build`
6. Start with: `npm start`

## 🔍 Sample Data

The seeder includes sample data for:

- 3 companies (OpenAI, Anthropic, Tesla)
- 2 products (ChatGPT, Claude)
- 3 stories with different ethical implications

## 📚 Next Steps

1. Create API controllers for CRUD operations
2. Add authentication middleware
3. Implement rate limiting
4. Add comprehensive error handling
5. Create API documentation
6. Set up monitoring and logging

## 🐛 Troubleshooting

### Common Issues

1. **Migration fails**: Check database connection and permissions
2. **TypeORM not found**: Run `npm install` to install dependencies
3. **Database connection error**: Verify `.env` configuration
4. **UUID generation error**: Ensure PostgreSQL has uuid-ossp extension

### Useful Commands

```bash
# Check database connection
psql -h localhost -U postgres -d texhpulze_2_0

# Reset database (careful!)
DROP DATABASE texhpulze_2_0;
CREATE DATABASE texhpulze_2_0;

# View migration status
npm run typeorm migration:show
```

## 📄 License

This project is part of TexhPulze 2.0 - Building the World's First Courtroom for Technology.
