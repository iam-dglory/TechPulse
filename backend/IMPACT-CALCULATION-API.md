# Impact Calculation & Recommendation API

This document provides comprehensive examples for testing the TexhPulze 2.0 Impact Calculation and Recommendation endpoints.

## Overview

The Impact Calculation API allows users to:

- Save their job, location, and technology stack
- Get personalized risk metrics and recommendations
- Receive industry-specific story recommendations

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## Base URL

```
https://texhpulze.onrender.com/api
```

## Endpoints

### 1. Get User Impact Profile

**GET** `/users/:id/impact`

Retrieves a user's impact profile with computed risk metrics.

#### Example Request

```bash
# Get impact profile for user
curl -X GET "https://texhpulze.onrender.com/api/users/550e8400-e29b-41d4-a716-446655440000/impact" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

#### Example Response

```json
{
  "success": true,
  "message": "User impact profile retrieved successfully",
  "data": {
    "id": "impact-uuid-here",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "job": "Customer Service Representative",
    "location": "San Francisco, CA",
    "techUsed": ["Chatbots", "CRM Systems", "Email"],
    "industry": "customer-service",
    "riskMetrics": {
      "automationRisk": 7.5,
      "skillObsolescenceRisk": 6.0,
      "privacyRisk": 4.0,
      "overallRiskScore": 5.8
    },
    "riskFactors": [
      "job-automation",
      "skill-obsolescence",
      "workload-increase"
    ],
    "recommendedActions": [
      {
        "action": "Learn Complementary Skills",
        "priority": "high",
        "description": "Develop skills that complement automation tools to remain valuable"
      },
      {
        "action": "Develop Human Skills",
        "priority": "medium",
        "description": "Focus on empathy, complex problem-solving, and relationship building"
      }
    ],
    "industryContext": {
      "industry": "Customer Service",
      "sectors": [
        "AI",
        "Automation",
        "Chatbots",
        "Natural Language Processing",
        "Sentiment Analysis"
      ],
      "impactTags": [
        "automation",
        "ai-tools",
        "job-displacement",
        "productivity",
        "customer-experience"
      ],
      "threshold": 6.0
    },
    "techImpacts": [
      {
        "tech": "Chatbots",
        "impact": "negative",
        "weight": 8,
        "description": "High risk of job displacement"
      },
      {
        "tech": "AI Analytics",
        "impact": "negative",
        "weight": 6,
        "description": "Moderate automation risk"
      }
    ],
    "lastCalculatedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Save User Impact Profile

**POST** `/users/:id/impact`

Creates or updates a user's impact profile with computed risk metrics.

#### Example Request

```bash
# Create/update impact profile for customer service representative
curl -X POST "https://texhpulze.onrender.com/api/users/550e8400-e29b-41d4-a716-446655440000/impact" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "job": "Customer Service Representative",
    "location": "San Francisco, CA",
    "techUsed": [
      "Chatbots",
      "CRM Systems",
      "Email",
      "Social Media",
      "Cloud Services"
    ],
    "industry": "customer-service"
  }'
```

#### Example Response (201 Created)

```json
{
  "success": true,
  "message": "User impact profile created successfully",
  "data": {
    "id": "new-impact-uuid-here",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "job": "Customer Service Representative",
    "location": "San Francisco, CA",
    "techUsed": [
      "Chatbots",
      "CRM Systems",
      "Email",
      "Social Media",
      "Cloud Services"
    ],
    "industry": "customer-service",
    "riskMetrics": {
      "automationRisk": 8.0,
      "skillObsolescenceRisk": 5.0,
      "privacyRisk": 6.0,
      "overallRiskScore": 6.3
    },
    "riskFactors": [
      "job-automation",
      "skill-obsolescence",
      "workload-increase"
    ],
    "recommendedActions": [
      {
        "action": "Learn Complementary Skills",
        "priority": "high",
        "description": "Develop skills that complement automation tools to remain valuable"
      },
      {
        "action": "Review Privacy Settings",
        "priority": "medium",
        "description": "Audit and update privacy settings on all platforms you use"
      },
      {
        "action": "Develop Human Skills",
        "priority": "medium",
        "description": "Focus on empathy, complex problem-solving, and relationship building"
      }
    ],
    "industryContext": {
      "industry": "Customer Service",
      "sectors": [
        "AI",
        "Automation",
        "Chatbots",
        "Natural Language Processing",
        "Sentiment Analysis"
      ],
      "impactTags": [
        "automation",
        "ai-tools",
        "job-displacement",
        "productivity",
        "customer-experience"
      ],
      "threshold": 6.0
    },
    "techImpacts": [
      {
        "tech": "Chatbots",
        "impact": "negative",
        "weight": 8,
        "description": "High risk of job displacement"
      },
      {
        "tech": "AI Analytics",
        "impact": "negative",
        "weight": 6,
        "description": "Moderate automation risk"
      },
      {
        "tech": "Sentiment Analysis",
        "impact": "positive",
        "weight": 4,
        "description": "Can improve service quality"
      },
      {
        "tech": "CRM Systems",
        "impact": "neutral",
        "weight": 3,
        "description": "Supporting tool, low displacement risk"
      }
    ],
    "lastCalculatedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Get Recommended Stories

**GET** `/stories?recommendedFor=customer-service`

Retrieves stories recommended for a specific industry based on impact analysis.

#### Example Request

```bash
# Get stories recommended for customer service industry
curl -X GET "https://texhpulze.onrender.com/api/stories?recommendedFor=customer-service&sort=hot&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

#### Example Response

```json
{
  "success": true,
  "message": "Stories retrieved successfully",
  "data": {
    "stories": [
      {
        "id": "story-uuid-1",
        "title": "AI Chatbots Replacing Human Customer Service Agents",
        "content": "Major tech companies are deploying advanced AI chatbots that can handle 80% of customer inquiries without human intervention...",
        "eli5Summary": "Robots are getting really good at talking to customers, which means fewer jobs for human customer service workers.",
        "sectorTag": "AI",
        "hypeScore": 8.5,
        "ethicsScore": 6.0,
        "impactTags": ["automation", "job-displacement", "customer-experience"],
        "publishedAt": "2024-01-15T08:00:00Z",
        "company": {
          "id": "company-uuid",
          "name": "TechCorp",
          "slug": "techcorp"
        },
        "sentimentScore": 0.2,
        "voteCount": 15,
        "helpfulVotes": 12,
        "harmfulVotes": 3
      },
      {
        "id": "story-uuid-2",
        "title": "New Sentiment Analysis Tools Help Customer Service Teams",
        "content": "Advanced sentiment analysis technology is helping customer service teams better understand customer emotions...",
        "eli5Summary": "New tools help customer service workers understand how customers are feeling, making their jobs easier.",
        "sectorTag": "Natural Language Processing",
        "hypeScore": 6.0,
        "ethicsScore": 8.0,
        "impactTags": ["productivity", "customer-experience", "ai-tools"],
        "publishedAt": "2024-01-14T14:30:00Z",
        "company": {
          "id": "company-uuid-2",
          "name": "SentimentAI",
          "slug": "sentimentai"
        },
        "sentimentScore": 0.8,
        "voteCount": 8,
        "helpfulVotes": 7,
        "harmfulVotes": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    },
    "filters": {
      "sectorTag": null,
      "companyId": null,
      "impactTag": null,
      "sort": "hot",
      "search": null,
      "recommendedFor": "customer-service"
    },
    "recommendationInfo": {
      "industry": "customer-service",
      "threshold": 6.0,
      "totalEligible": 15,
      "applied": true
    }
  }
}
```

## Additional Examples

### Healthcare Industry Example

```bash
# Save impact profile for healthcare worker
curl -X POST "https://texhpulze.onrender.com/api/users/550e8400-e29b-41d4-a716-446655440001/impact" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "job": "Medical Technician",
    "location": "Boston, MA",
    "techUsed": [
      "Medical Imaging AI",
      "Health Data Analytics",
      "Telemedicine",
      "Electronic Health Records"
    ],
    "industry": "healthcare"
  }'

# Get recommended stories for healthcare
curl -X GET "https://texhpulze.onrender.com/api/stories?recommendedFor=healthcare&sort=top&limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Education Industry Example

```bash
# Save impact profile for educator
curl -X POST "https://texhpulze.onrender.com/api/users/550e8400-e29b-41d4-a716-446655440002/impact" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "job": "High School Teacher",
    "location": "Austin, TX",
    "techUsed": [
      "AI Tutoring",
      "Learning Analytics",
      "Assessment Tools",
      "Video Conferencing"
    ],
    "industry": "education"
  }'

# Get recommended stories for education
curl -X GET "https://texhpulze.onrender.com/api/stories?recommendedFor=education&sort=new&limit=8" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Finance Industry Example

```bash
# Save impact profile for finance professional
curl -X POST "https://texhpulze.onrender.com/api/users/550e8400-e29b-41d4-a716-446655440003/impact" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "job": "Financial Analyst",
    "location": "New York, NY",
    "techUsed": [
      "Algorithmic Trading",
      "Risk Assessment AI",
      "Blockchain",
      "Data Analytics"
    ],
    "industry": "finance"
  }'

# Get recommended stories for finance
curl -X GET "https://texhpulze.onrender.com/api/stories?recommendedFor=finance&sort=trending&limit=6" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

### 400 Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Job is required",
      "param": "job",
      "location": "body"
    },
    {
      "msg": "At least one technology must be selected",
      "param": "techUsed",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Industry Mapping Configuration

The system includes comprehensive industry mappings for:

- `customer-service` - Customer Service (threshold: 6.0)
- `healthcare` - Healthcare (threshold: 7.0)
- `education` - Education (threshold: 6.5)
- `finance` - Finance (threshold: 8.0)
- `technology` - Technology (threshold: 7.5)
- `retail` - Retail (threshold: 6.0)
- `manufacturing` - Manufacturing (threshold: 8.5)
- `transportation` - Transportation (threshold: 8.0)
- `government` - Government (threshold: 7.0)
- `non-profit` - Non-Profit (threshold: 5.5)
- `freelance` - Freelance (threshold: 6.0)

Each industry mapping includes:

- Relevant tech sectors
- Impact tags for filtering
- Risk factors
- Impact threshold for recommendations
- Technology-specific impact assessments

## Testing Workflow

1. **Register/Login** to get JWT token
2. **Save Impact Profile** with job, location, and tech stack
3. **Get Personalized Recommendations** using the industry parameter
4. **Vote on Stories** to provide feedback
5. **Update Profile** as your situation changes

## Rate Limits

- Impact profile endpoints: 10 requests per minute
- Story recommendation endpoints: 30 requests per minute
- All endpoints respect standard API rate limits

## Data Privacy

- User impact profiles are stored securely
- Personal data is not shared with third parties
- Risk calculations are performed server-side
- Users can delete their impact profiles at any time

