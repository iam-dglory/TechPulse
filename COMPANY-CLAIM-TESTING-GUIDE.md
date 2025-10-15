# Company Claim Flow - End-to-End Testing Guide

This guide provides step-by-step instructions to test the complete company claim and verification flow from submission to approval.

## 🎯 **Testing Overview**

The company claim flow includes:

1. **User submits claim** → Company status becomes `pending_review`
2. **Admin reviews claim** → Admin approves/rejects with notes
3. **Email notifications sent** → User receives approval/rejection email
4. **Company verification** → Company gets verified badge if approved

## 📋 **Prerequisites**

### Backend Setup

```bash
# 1. Run database migrations
cd backend
npm run typeorm:migrate

# 2. Start the backend server
npm run dev:ts:watch

# 3. Seed the database (optional)
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

You need an admin user for testing. Create one via API or database:

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

### **Scenario 1: Complete Claim Flow**

#### Step 1: User Submits Company Claim

**Mobile App:**

1. Open the mobile app
2. Navigate to any company profile
3. Tap "Contact / Claim Ownership" button
4. Fill out the `CompanyClaimForm`:
   - Company Name: "TestCorp Inc"
   - Official Email: "admin@testcorp.com"
   - Website URL: "https://testcorp.com"
   - Contact Person: "John Doe"
   - Phone Number: "+1 (555) 123-4567"
   - Verification Method: "Website Verification"
   - Additional Info: "Testing company claim flow"

**Expected Result:**

- Form submits successfully
- Toast shows "Claim Submitted"
- Response includes `claimId` and `status: "pending"`

#### Step 2: Verify Backend Data

**Check Database:**

```sql
-- Check company_claims table
SELECT * FROM company_claims ORDER BY created_at DESC LIMIT 1;

-- Check companies table (if company existed)
SELECT id, name, claim_status, verified FROM companies WHERE name = 'TestCorp Inc';
```

**Expected Results:**

- New row in `company_claims` table with `status = 'pending'`
- Company `claim_status` updated to `'pending_review'`

#### Step 3: Admin Reviews Claim

**Admin Interface (Use AdminClaimsManager component):**

1. Open admin interface (you'll need to integrate AdminClaimsManager into your app)
2. View pending claims list
3. Find the "TestCorp Inc" claim
4. Tap "Approve" button
5. Add review notes: "Verified company website and contact information"
6. Confirm approval

**Expected Result:**

- Claim status changes to `'approved'`
- Company gets `verified = true` and `verifiedAt` timestamp
- Email notification logged to console

#### Step 4: Verify Email Notification

**Check Console Logs:**
Look for email notification in backend console:

```
📧 EMAIL NOTIFICATION
==================================================
To: admin@testcorp.com
Subject: 🎉 Company Claim Approved: TestCorp Inc
Body: [Email content]
==================================================
```

#### Step 5: Verify Company Verification Badge

**Mobile App:**

1. Navigate back to the company profile
2. Verify the company now shows:
   - ✅ Verified badge
   - Verified date
   - Updated claim status

### **Scenario 2: Claim Rejection Flow**

#### Step 1: Submit Another Claim

Follow the same process as Scenario 1, but use:

- Company Name: "BadCorp Ltd"
- Official Email: "fake@badcorp.com"
- Website URL: "https://badcorp.com"

#### Step 2: Admin Rejects Claim

1. Open admin interface
2. Find the "BadCorp Ltd" claim
3. Tap "Reject" button
4. Add rejection reason: "Unable to verify company website and contact information"

#### Step 3: Verify Rejection

- Claim status changes to `'rejected'`
- Company `claim_status` becomes `'rejected'`
- Rejection email notification logged to console

## 🔧 **API Testing with cURL**

### Submit Company Claim

```bash
# Get auth token first
TOKEN="your_jwt_token_here"

# Submit claim
curl -X POST "http://localhost:5000/api/companies/claim" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "existing-company-id-here",
    "companyName": "API Test Corp",
    "officialEmail": "contact@apitestcorp.com",
    "websiteUrl": "https://apitestcorp.com",
    "contactPerson": "Jane Smith",
    "phoneNumber": "+1 (555) 987-6543",
    "proofDocuments": [],
    "verificationMethod": "email",
    "additionalInfo": "Testing via API"
  }'
```

### Get All Claims (Admin)

```bash
curl -X GET "http://localhost:5000/api/admin/claims" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Approve Claim (Admin)

```bash
CLAIM_ID="claim-id-from-previous-response"

curl -X POST "http://localhost:5000/api/admin/claims/$CLAIM_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reviewNotes": "Approved via API testing"
  }'
```

### Reject Claim (Admin)

```bash
curl -X POST "http://localhost:5000/api/admin/claims/$CLAIM_ID/reject" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reviewNotes": "Rejected via API testing - insufficient documentation"
  }'
```

### Get Claims Statistics (Admin)

```bash
curl -X GET "http://localhost:5000/api/admin/claims/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## 🎨 **UI Integration Testing**

### Add CompanyClaimForm to Mobile App

1. Import `CompanyClaimForm` component
2. Add navigation to claim form from company profiles
3. Handle form submission success/error states

### Add AdminClaimsManager to Admin Interface

1. Import `AdminClaimsManager` component
2. Add to admin dashboard or create admin section
3. Pass admin auth token to component

## 📊 **Expected Database State After Testing**

### company_claims table:

```sql
SELECT
  id,
  company_name,
  official_email,
  status,
  verification_method,
  created_at,
  reviewed_at
FROM company_claims
ORDER BY created_at DESC;
```

### companies table:

```sql
SELECT
  id,
  name,
  claim_status,
  verified,
  verified_at
FROM companies
WHERE claim_status != 'unclaimed'
ORDER BY updated_at DESC;
```

## ✅ **Success Criteria**

### Claim Submission:

- [ ] Form validates all required fields
- [ ] Claim saved to database with `status = 'pending'`
- [ ] Company status updated to `'pending_review'`
- [ ] User receives success confirmation

### Admin Review:

- [ ] Admin can view all pending claims
- [ ] Admin can approve claims with notes
- [ ] Admin can reject claims with reasons
- [ ] Claim status updates correctly
- [ ] Company verification status updates

### Email Notifications:

- [ ] Approval emails logged to console (MVP)
- [ ] Rejection emails logged to console (MVP)
- [ ] Email content includes all relevant information
- [ ] Email templates render correctly

### Company Verification:

- [ ] Approved companies show verified badge
- [ ] Verified date is displayed
- [ ] Company can be managed by claim submitter
- [ ] Rejected companies show appropriate status

## 🐛 **Common Issues & Troubleshooting**

### Issue: "Authentication required"

**Solution:** Ensure user is logged in and has valid JWT token

### Issue: "Admin privileges required"

**Solution:** Ensure user has `isActive: true` in database

### Issue: "Company already claimed"

**Solution:** Check if company already has approved or pending claims

### Issue: Email notifications not appearing

**Solution:** Check backend console logs for email service output

### Issue: Database migration errors

**Solution:** Ensure all migrations are run: `npm run typeorm:migrate`

## 🚀 **Production Deployment Notes**

### Email Service Integration:

Replace console logging in `emailService.ts` with actual email provider:

- SendGrid
- AWS SES
- Mailgun
- Nodemailer with SMTP

### Admin Interface:

- Implement proper admin dashboard
- Add user management features
- Add audit logging for admin actions

### Security:

- Implement rate limiting on claim submission
- Add CAPTCHA for claim forms
- Implement admin role-based access control

## 📝 **Test Results Template**

```
Test Date: ___________
Tester: ___________

Claim Submission:
- [ ] Mobile form works
- [ ] API endpoint responds correctly
- [ ] Database updated properly

Admin Review:
- [ ] Claims list loads
- [ ] Approval works
- [ ] Rejection works
- [ ] Status updates correctly

Email Notifications:
- [ ] Approval email logged
- [ ] Rejection email logged
- [ ] Email content correct

Company Verification:
- [ ] Verified badge appears
- [ ] Verification date shows
- [ ] Status updates correctly

Notes:
_________________________________
_________________________________
```

This testing guide ensures the complete company claim flow works end-to-end from user submission through admin approval to final verification status updates! 🎉
