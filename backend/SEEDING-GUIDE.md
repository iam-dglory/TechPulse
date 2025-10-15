# TexhPulze 2.0 Database Seeding Guide

This guide explains how to seed the TexhPulze database with sample company profiles and stories.

## 🚀 Quick Setup

1. **Run migrations first:**

```bash
npm run typeorm:migrate
```

2. **Seed the database:**

```bash
# Development mode
npm run seed

# Production mode (after building)
npm run build
npm run seed:prod
```

3. **Test the seeding:**

```bash
npm run test:seed
```

4. **Start the server and test:**

```bash
npm run dev:ts

# In another terminal, test the API
curl -X GET "http://localhost:5000/api/stories"
```

## 📊 Seed Data Overview

The seeding script creates realistic sample data including:

### 🏢 **8 Verified Companies:**

- **PixaAI** - AI image generation with bias detection
- **SynthHealth** - Healthcare AI diagnostics
- **RideEV** - Autonomous electric vehicles
- **AgroSense** - Precision agriculture IoT
- **SecureCloud** - Enterprise cybersecurity
- **EduBot** - AI tutoring and personalized learning
- **CleanGrid** - Smart grid and renewable energy
- **NovaRobotics** - Industrial automation and robotics

### 📰 **6 Sample Stories:**

- AI ethics and bias mitigation
- Healthcare privacy concerns
- Autonomous vehicle safety milestones
- Agricultural sustainability
- Cloud security policy changes
- Educational equity challenges

### 👤 **Admin User:**

- Email: `admin@texhpulze.com`
- Username: `admin`
- Password: `admin123`
- Role: `admin`

## 📋 Company Profiles

### PixaAI

- **Sector**: AI, Computer Vision, Creative Tools
- **Funding**: Series A
- **Investors**: Andreessen Horowitz, Sequoia Capital
- **Location**: San Francisco, CA
- **Scores**: Credibility 85, Ethics 78, Hype 72
- **Product**: PixaStudio Pro (AI image generation with bias detection)

### SynthHealth

- **Sector**: Healthcare AI, Medical Imaging, Diagnostics
- **Funding**: Series B
- **Investors**: GV (Google Ventures), Khosla Ventures, HealthTech Capital
- **Location**: Boston, MA
- **Scores**: Credibility 92, Ethics 88, Hype 65
- **Product**: DiagnosticAI Assistant (AI-powered diagnostic support)

### RideEV

- **Sector**: Electric Vehicles, Autonomous Driving, Transportation
- **Funding**: Series C+
- **Investors**: Tesla Ventures, BMW i Ventures, Toyota AI Ventures
- **Location**: Austin, TX
- **Scores**: Credibility 88, Ethics 75, Hype 85
- **Product**: Autonomous Fleet Management System

### AgroSense

- **Sector**: AgTech, IoT, Precision Agriculture
- **Funding**: Series A
- **Investors**: IndieBio, AgFunder, Rural Innovation Fund
- **Location**: Des Moines, IA
- **Scores**: Credibility 82, Ethics 85, Hype 68

### SecureCloud

- **Sector**: Cybersecurity, Cloud Infrastructure, Enterprise Security
- **Funding**: Public
- **Investors**: N/A (Public company)
- **Location**: Seattle, WA
- **Scores**: Credibility 90, Ethics 82, Hype 58

### EduBot

- **Sector**: EdTech, AI Tutoring, Personalized Learning
- **Funding**: Series B
- **Investors**: GSV Ventures, Reach Capital, Learn Capital
- **Location**: Palo Alto, CA
- **Scores**: Credibility 86, Ethics 89, Hype 70

### CleanGrid

- **Sector**: Clean Energy, Smart Grid, Renewable Energy
- **Funding**: Series A
- **Investors**: Breakthrough Energy Ventures, Energy Impact Partners
- **Location**: Denver, CO
- **Scores**: Credibility 84, Ethics 91, Hype 63

### NovaRobotics

- **Sector**: Robotics, Industrial Automation, AI
- **Funding**: Series B
- **Investors**: SoftBank Vision Fund, Intel Capital, Qualcomm Ventures
- **Location**: Pittsburgh, PA
- **Scores**: Credibility 87, Ethics 79, Hype 76

## 📰 Sample Stories

### 1. PixaAI - AI Ethics Success

**Title**: "PixaAI Launches Revolutionary AI Image Generator with Built-in Bias Detection"

- **Hype Score**: 75 (High innovation claims)
- **Ethics Score**: 85 (Strong ethical framework)
- **Impact Tags**: positive, innovation, bias-mitigation
- **Reality Check**: "Verified by independent AI ethics researchers"

### 2. SynthHealth - Privacy Concerns

**Title**: "SynthHealth AI Diagnostic Tool Raises Privacy Concerns Among Medical Professionals"

- **Hype Score**: 68 (Moderate claims)
- **Ethics Score**: 45 (Privacy concerns)
- **Impact Tags**: concern, privacy, healthcare
- **Reality Check**: "HIPAA compliance claims need independent verification"

### 3. RideEV - Safety Milestone

**Title**: "RideEV Autonomous Vehicle Fleet Completes 1 Million Miles with Zero Accidents"

- **Hype Score**: 82 (High achievement claims)
- **Ethics Score**: 78 (Good safety practices)
- **Impact Tags**: milestone, safety, autonomous-driving
- **Reality Check**: "Achievement verified by independent safety auditors"

### 4. AgroSense - Environmental Impact

**Title**: "AgroSense Precision Farming Platform Helps Reduce Pesticide Use by 30%"

- **Hype Score**: 58 (Moderate claims)
- **Ethics Score**: 88 (Strong environmental ethics)
- **Impact Tags**: sustainability, environment-positive, precision-agriculture
- **Reality Check**: "Results verified by agricultural extension services"

### 5. SecureCloud - Policy Backlash

**Title**: "SecureCloud Faces Backlash Over Data Retention Policies in New Privacy Update"

- **Hype Score**: 72 (High attention)
- **Ethics Score**: 35 (Poor privacy practices)
- **Impact Tags**: privacy-concern, policy-change, backlash
- **Reality Check**: "Privacy policy changes verified"

### 6. EduBot - Equity Questions

**Title**: "EduBot AI Tutor Shows Promise in Personalized Learning but Raises Equity Questions"

- **Hype Score**: 65 (Moderate claims)
- **Ethics Score**: 72 (Some equity concerns)
- **Impact Tags**: promising, equity-concern, personalized-learning
- **Reality Check**: "Learning outcomes verified by independent education researchers"

## 🔧 API Testing

After seeding, test the API endpoints:

### Get All Stories

```bash
curl -X GET "http://localhost:5000/api/stories"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Stories retrieved successfully",
  "data": {
    "stories": [
      {
        "id": "uuid-here",
        "title": "PixaAI Launches Revolutionary AI Image Generator with Built-in Bias Detection",
        "content": "PixaAI has unveiled their latest AI image generation tool...",
        "hypeScore": 75,
        "ethicsScore": 85,
        "impactTags": ["positive", "innovation", "bias-mitigation"],
        "realityCheck": "Verified by independent AI ethics researchers...",
        "company": {
          "id": "company-uuid",
          "name": "PixaAI",
          "sectorTags": ["AI", "Computer Vision", "Creative Tools"],
          "fundingStage": "Series A"
        }
      }
      // ... more stories
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 6,
      "pages": 1
    }
  }
}
```

### Get All Companies

```bash
curl -X GET "http://localhost:5000/api/companies"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [
      {
        "id": "uuid-here",
        "name": "PixaAI",
        "slug": "pixaai",
        "website": "https://pixaai.com",
        "sectorTags": ["AI", "Computer Vision", "Creative Tools"],
        "fundingStage": "Series A",
        "investors": ["Andreessen Horowitz", "Sequoia Capital"],
        "hqLocation": "San Francisco, CA",
        "credibilityScore": 85,
        "ethicsScore": 78,
        "hypeScore": 72,
        "verified": true,
        "verifiedAt": "2025-01-15T10:00:00.000Z"
      }
      // ... more companies
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "pages": 1
    }
  }
}
```

### Get Company with Products

```bash
curl -X GET "http://localhost:5000/api/companies/pixaai"
```

### Filter Stories by Sector

```bash
curl -X GET "http://localhost:5000/api/stories?sectorTag=AI%20Ethics"
```

### Search Companies

```bash
curl -X GET "http://localhost:5000/api/companies?search=PixaAI"
```

## 🛠️ Development Workflow

### 1. Fresh Setup

```bash
# Clear and recreate database
npm run typeorm:migrate:revert
npm run typeorm:migrate
npm run seed
npm run test:seed
```

### 2. Reset and Reseed

```bash
# Quick reset (clears data and reseeds)
npm run seed
```

### 3. Test Seeding

```bash
# Verify seed data
npm run test:seed
```

### 4. Start Development

```bash
# Start API server
npm run dev:ts

# Test API endpoints
curl -X GET "http://localhost:5000/api/stories"
curl -X GET "http://localhost:5000/api/companies"
```

## 🔍 Troubleshooting

### Common Issues

#### Migration Errors

```bash
# If migrations fail, try:
npm run typeorm:migrate:revert
npm run typeorm:migrate
```

#### Seed Script Errors

```bash
# Check database connection
npm run test:seed

# Verify environment variables
echo $DATABASE_URL
```

#### API Not Returning Data

```bash
# Check if server is running
curl -X GET "http://localhost:5000/health"

# Check database connection
npm run test:seed
```

### Debug Mode

Enable debug logging:

```bash
# Add to .env
DEBUG_SCORING=true
LOG_LEVEL=debug

# Restart server
npm run dev:ts
```

## 📊 Data Validation

After seeding, verify:

1. **8 companies** created and verified
2. **6 stories** with realistic content
3. **3 products** for PixaAI, SynthHealth, and RideEV
4. **1 admin user** for testing
5. **Proper relationships** between stories and companies
6. **Realistic scoring** based on content analysis

## 🚀 Production Seeding

For production environments:

```bash
# Set production environment
export NODE_ENV=production
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Build and seed
npm run build
npm run seed:prod
```

## 📋 Summary

The seeding script provides:

✅ **8 Realistic Companies** - Diverse sectors with proper metadata
✅ **6 Sample Stories** - Real-world scenarios with scoring
✅ **Product Data** - Sample products for key companies
✅ **Admin User** - Ready-to-use admin account
✅ **Proper Relationships** - Stories linked to companies
✅ **Realistic Scoring** - Hype and ethics scores based on content
✅ **API Testing** - Ready-to-test endpoints with data

**To seed the database:**

1. Run migrations: `npm run typeorm:migrate`
2. Seed data: `npm run seed`
3. Test: `npm run test:seed`
4. Start API: `npm run dev:ts`
5. Test endpoints: `curl -X GET "http://localhost:5000/api/stories"`
