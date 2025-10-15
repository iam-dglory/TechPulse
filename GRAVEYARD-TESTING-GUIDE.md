# Graveyard System - End-to-End Testing Guide

This guide provides comprehensive testing instructions for the Tech Graveyard system, including database setup, API endpoints, scheduled jobs, and mobile UI integration.

## 🎯 **System Overview**

The Graveyard system tracks failed tech promises and overhyped claims with:

- **Graveyard Entries**: Failed projects with follow-up analysis
- **Editorial Workflow**: Admin interface for adding entries
- **Scheduled Jobs**: Automated reminders for high-hype story follow-ups
- **Mobile Interface**: Searchable graveyard with filtering and navigation

## 📋 **Prerequisites**

### Backend Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Run database migrations
npm run typeorm:migrate

# 3. Start the backend server
npm run dev:ts:watch

# 4. Seed the database (optional)
npm run seed
```

### Mobile App Setup

```bash
# 1. Install dependencies
cd TexhPulzeMobile
npm install

# 2. Start the mobile app
npm start
```

### Admin User Setup

Ensure you have an admin user for testing:

```bash
# Create admin user via API
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@texhpulze.com",
    "password": "admin123",
    "isActive": true
  }'
```

## 🧪 **Test Scenarios**

### **Scenario 1: Create Graveyard Entry (Admin)**

#### Step 1: Submit Graveyard Entry via API

```bash
# Get admin auth token first
ADMIN_TOKEN="your_admin_jwt_token"

# Create graveyard entry
curl -X POST "http://localhost:5000/api/graveyard" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originalClaimStoryId": "existing-story-id",
    "companyId": "existing-company-id",
    "title": "Theranos Blood Testing Revolution",
    "followUpSummary": "Theranos claimed to revolutionize blood testing with a single drop of blood, promising faster, cheaper, and more accurate results than traditional lab testing.",
    "actualOutcome": "The company was exposed for fraud in 2015-2016. Their technology never worked as claimed. Elizabeth Holmes was convicted of fraud in 2022. The company dissolved in 2018.",
    "outcomeDate": "2022-01-03T00:00:00.000Z",
    "failureType": "broken-promise",
    "impactAssessment": {
      "usersAffected": 1000000,
      "financialImpact": "$9 billion valuation lost",
      "reputationDamage": "Severe damage to health tech credibility",
      "lessonsLearned": [
        "Due diligence in health tech claims",
        "Importance of peer review",
        "Regulatory oversight needed"
      ]
    },
    "originalPromises": "Revolutionary blood testing with single drop, faster results, cheaper costs, more accurate than traditional methods",
    "sources": [
      {
        "url": "https://example.com/theranos-fraud",
        "title": "Theranos Fraud Exposed",
        "date": "2022-01-03",
        "type": "news-report"
      }
    ],
    "isPublished": true
  }'
```

**Expected Result:**

- Status 201 with success response
- Graveyard entry created with all fields
- Entry marked as published with timestamp

#### Step 2: Verify Database Entry

```sql
-- Check graveyard table
SELECT
  id,
  title,
  failure_type,
  outcome_date,
  is_published,
  created_at
FROM graveyard
ORDER BY created_at DESC
LIMIT 1;

-- Check relationships
SELECT
  g.title,
  g.failure_type,
  s.title as original_story_title,
  c.name as company_name
FROM graveyard g
LEFT JOIN stories s ON g.original_claim_story_id = s.id
LEFT JOIN companies c ON g.company_id = c.id
WHERE g.title = 'Theranos Blood Testing Revolution';
```

### **Scenario 2: View Graveyard Entries (Public)**

#### Step 1: Get All Published Entries

```bash
curl -X GET "http://localhost:5000/api/graveyard" \
  -H "Content-Type: application/json"
```

#### Step 2: Search Entries

```bash
curl -X GET "http://localhost:5000/api/graveyard?search=theranos" \
  -H "Content-Type: application/json"
```

#### Step 3: Filter by Failure Type

```bash
curl -X GET "http://localhost:5000/api/graveyard?failureType=broken-promise" \
  -H "Content-Type: application/json"
```

#### Step 4: Get Single Entry

```bash
GRAVEYARD_ID="graveyard-entry-id-from-previous-response"

curl -X GET "http://localhost:5000/api/graveyard/$GRAVEYARD_ID" \
  -H "Content-Type: application/json"
```

**Expected Results:**

- Paginated list of graveyard entries
- Search functionality works
- Filtering by failure type works
- Single entry details returned

### **Scenario 3: Mobile App Graveyard Interface**

#### Step 1: Navigate to Graveyard

1. Open mobile app
2. Tap "Graveyard" tab (skull icon)
3. Verify screen loads with search and filters

#### Step 2: Test Search Functionality

1. Enter search term in search box
2. Verify results filter in real-time
3. Clear search to show all entries

#### Step 3: Test Filtering

1. Tap different failure type chips
2. Verify entries filter by type
3. Test "All Types" to show everything

#### Step 4: Test Entry Interaction

1. Tap on a graveyard entry
2. Verify entry details are shown
3. Test navigation to original story (if linked)
4. Test navigation to company profile (if linked)
5. Test external source links

### **Scenario 4: Editorial Reminder System**

#### Step 1: Test Manual Reminder Job

```bash
# Run editorial reminder job manually (for testing)
curl -X POST "http://localhost:5000/api/admin/cron/run" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobName": "editorial-reminders"}'
```

#### Step 2: Verify Console Output

Check backend console for:

```
📝 Running editorial reminder job...
📧 Editorial reminders sent to X admin users for Y stories
✅ Editorial reminder job completed successfully
```

#### Step 3: Check Email Notifications

Look for email notifications in console:

```
📧 EMAIL NOTIFICATION
==================================================
To: admin@texhpulze.com
Subject: 📝 Editorial Reminder: X Stories Need Follow-up
Body: [Detailed reminder content]
==================================================
```

#### Step 4: Test Scheduled Jobs Status

```bash
# Get cron job status
curl -X GET "http://localhost:5000/api/admin/cron/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### **Scenario 5: Graveyard Statistics**

#### Step 1: Get Graveyard Stats

```bash
curl -X GET "http://localhost:5000/api/graveyard/stats" \
  -H "Content-Type: application/json"
```

**Expected Result:**

```json
{
  "success": true,
  "data": {
    "total": 15,
    "published": 12,
    "unpublished": 3,
    "recent": 5,
    "byFailureType": {
      "broken-promise": 8,
      "overhyped": 4,
      "failed-delivery": 2,
      "misleading-claims": 1
    }
  }
}
```

## 🔧 **Advanced Testing**

### **Test Scheduled Jobs**

#### Manual Job Execution

```bash
# Test editorial reminders
curl -X POST "http://localhost:5000/api/admin/cron/run" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobName": "editorial-reminders"}'

# Test graveyard review
curl -X POST "http://localhost:5000/api/admin/cron/run" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobName": "graveyard-review"}'
```

#### Verify Job Scheduling

Check backend console on startup:

```
🕐 Initializing scheduled jobs...
📅 Editorial reminders scheduled for Mondays at 9 AM UTC
📅 Graveyard review scheduled for Fridays at 2 PM UTC
📅 Monthly cleanup scheduled for 1st of every month at 6 AM UTC
✅ All scheduled jobs initialized
```

### **Test Data Relationships**

#### Create Related Test Data

```bash
# 1. Create a high-hype story
STORY_ID=$(curl -X POST "http://localhost:5000/api/stories" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Revolutionary AI That Will Change Everything",
    "content": "This AI promises to solve all problems...",
    "sectorTag": "AI",
    "hypeScore": 9,
    "ethicsScore": 3
  }' | jq -r '.data.story.id')

# 2. Wait 6 months (or manually set publishedAt in database)
# 3. Create graveyard entry referencing the story
curl -X POST "http://localhost:5000/api/graveyard" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"originalClaimStoryId\": \"$STORY_ID\",
    \"title\": \"AI Revolution Never Delivered\",
    \"followUpSummary\": \"The AI promised to revolutionize everything but never delivered.\",
    \"actualOutcome\": \"The AI was overhyped and underdelivered.\",
    \"outcomeDate\": \"2024-01-01T00:00:00.000Z\",
    \"failureType\": \"overhyped\"
  }"
```

## 📊 **Expected Database State**

### Graveyard Table Structure

```sql
SELECT
  id,
  title,
  failure_type,
  outcome_date,
  is_published,
  created_at,
  updated_at
FROM graveyard
ORDER BY created_at DESC;
```

### Relationships Verification

```sql
-- Check graveyard entries with their original stories
SELECT
  g.title as graveyard_title,
  g.failure_type,
  s.title as original_story_title,
  s.hype_score as original_hype_score,
  c.name as company_name
FROM graveyard g
LEFT JOIN stories s ON g.original_claim_story_id = s.id
LEFT JOIN companies c ON g.company_id = c.id
ORDER BY g.created_at DESC;
```

## ✅ **Success Criteria**

### Backend API:

- [ ] Graveyard entries can be created (admin only)
- [ ] Public endpoints return published entries
- [ ] Search functionality works correctly
- [ ] Filtering by failure type works
- [ ] Statistics endpoint returns accurate data
- [ ] Scheduled jobs run automatically
- [ ] Editorial reminders are sent to admins

### Mobile App:

- [ ] Graveyard tab appears in navigation
- [ ] Search functionality works in real-time
- [ ] Filter chips work correctly
- [ ] Entry cards display all relevant information
- [ ] Navigation to related stories/companies works
- [ ] External links open correctly
- [ ] Pull-to-refresh works

### Scheduled Jobs:

- [ ] Editorial reminders run on schedule (Mondays 9 AM)
- [ ] Graveyard review runs on schedule (Fridays 2 PM)
- [ ] Monthly cleanup runs on schedule (1st of month 6 AM)
- [ ] Email notifications are generated
- [ ] Job status can be queried

### Data Integrity:

- [ ] Foreign key relationships work correctly
- [ ] Graveyard entries link to original stories
- [ ] Company relationships are maintained
- [ ] Impact assessments are stored as JSON
- [ ] Sources are stored as JSON arrays

## 🐛 **Common Issues & Troubleshooting**

### Issue: "Admin privileges required"

**Solution:** Ensure user has `isActive: true` in database

### Issue: "Original claim story not found"

**Solution:** Verify story ID exists in stories table

### Issue: Scheduled jobs not running

**Solution:** Check cron service initialization in server startup logs

### Issue: Mobile app not showing entries

**Solution:** Verify API base URL in mobile app configuration

### Issue: Email notifications not appearing

**Solution:** Check backend console logs for email service output

## 🚀 **Production Deployment Notes**

### Scheduled Jobs:

- Ensure server has persistent timezone configuration
- Consider using external cron service for high availability
- Monitor job execution logs

### Database:

- Add indexes for performance on large datasets
- Consider archiving old graveyard entries
- Regular cleanup of unpublished entries

### Email Service:

- Replace console logging with actual email provider
- Configure proper SMTP settings
- Set up email templates and branding

## 📝 **Test Results Template**

```
Test Date: ___________
Tester: ___________

Backend API:
- [ ] Create graveyard entry
- [ ] Get published entries
- [ ] Search functionality
- [ ] Filter by failure type
- [ ] Get statistics
- [ ] Scheduled jobs

Mobile App:
- [ ] Graveyard tab navigation
- [ ] Search interface
- [ ] Filter chips
- [ ] Entry display
- [ ] Link navigation
- [ ] Pull-to-refresh

Scheduled Jobs:
- [ ] Editorial reminders
- [ ] Graveyard review
- [ ] Email notifications
- [ ] Job status queries

Notes:
_________________________________
_________________________________
```

This testing guide ensures the complete graveyard system works end-to-end from database creation through mobile app interaction to automated editorial reminders! 🎉⚰️✨

