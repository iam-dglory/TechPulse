# TexhPulze Company Claim Workflow Guide

This guide explains how to test the company claim approval workflow using the seeded admin and company owner users.

## Overview

The company claim workflow allows legitimate company owners to claim and verify their company profiles on TexhPulze. The process involves:

1. **Company Owner**: Creates a claim with verification documents
2. **Admin**: Reviews and approves/rejects claims
3. **System**: Updates company verification status

## Seeded Users

After running the seed script (`npm run seed`), the following users are created:

### Admin User

- **Email**: `admin@texhpulze.local`
- **Password**: `admin123`
- **Role**: Admin (can approve/reject claims)
- **Permissions**: Full administrative access

### Company Owner Users

- **PixaAI Owner**: `ceo@pixaai.com` (password: `owner123`)
- **SynthHealth Owner**: `founder@synthhealth.com` (password: `owner123`)
- **RideEV Owner**: `owner@rideev.com` (password: `owner123`)
- **Role**: Company Owner (can create claims)
- **Permissions**: Can claim their respective companies

## Testing the Workflow

### Step 1: Seed the Database

First, ensure the database is seeded with admin and company owner users:

```bash
cd backend
npm run seed
```

Expected output:

```
🌱 Starting database seeding...
✅ Database connected successfully
🧹 Clearing existing data...
✅ Existing data cleared
👤 Creating admin user...
✅ Admin user created: admin@texhpulze.local (password: admin123)
👥 Creating company owner users...
   ✅ Created owner: ceo@pixaai.com (password: owner123) for PixaAI
   ✅ Created owner: founder@synthhealth.com (password: owner123) for SynthHealth
   ✅ Created owner: owner@rideev.com (password: owner123) for RideEV
🏢 Creating companies...
   ✅ Created company: PixaAI
   ✅ Created company: SynthHealth
   ✅ Created company: RideEV
   ... (more companies)
📰 Creating stories...
   ✅ Created story: PixaAI Launches Revolutionary AI Image Generator...
   ... (more stories)

🎉 Database seeding completed successfully!
📊 Summary:
   - Companies: 8
   - Products: 3
   - Stories: 6
   - Users: 4 (1 admin + 3 company owners)

🔐 Admin Login Credentials:
   Email: admin@texhpulze.local
   Password: admin123

👥 Company Owner Login Credentials:
   PixaAI: ceo@pixaai.com (password: owner123)
   SynthHealth: founder@synthhealth.com (password: owner123)
   RideEV: owner@rideev.com (password: owner123)
```

### Step 2: Start the API Server

```bash
npm run dev:ts
```

### Step 3: Run the Claim Workflow Demo

```bash
npm run test:claims
```

This will demonstrate the complete workflow:

1. Company owner logs in and creates a claim
2. Admin logs in and reviews pending claims
3. Admin approves the claim
4. Admin rejects another claim (for demo purposes)

## Manual Testing with API Calls

### 1. Login as Company Owner

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ceo@pixaai.com",
    "password": "owner123"
  }'
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "ceo@pixaai.com",
    "username": "pixaai_ceo",
    "isAdmin": false
  }
}
```

### 2. Create Company Claim

```bash
curl -X POST http://localhost:5000/api/companies/claim \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "companyName": "PixaAI",
    "officialEmail": "ceo@pixaai.com",
    "websiteUrl": "https://pixaai.com",
    "contactPerson": "PixaAI CEO",
    "phoneNumber": "+1234567890",
    "verificationMethod": "email",
    "additionalInfo": "I am the legitimate owner of PixaAI and can provide verification documents."
  }'
```

Response:

```json
{
  "success": true,
  "message": "Company claim submitted successfully",
  "data": {
    "claimId": "claim-uuid-here",
    "status": "pending"
  }
}
```

### 3. Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@texhpulze.local",
    "password": "admin123"
  }'
```

### 4. View Pending Claims

```bash
curl -X GET "http://localhost:5000/api/admin/claims?status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

Response:

```json
{
  "success": true,
  "message": "Company claims retrieved successfully",
  "data": {
    "claims": [
      {
        "id": "claim-uuid-here",
        "companyName": "PixaAI",
        "officialEmail": "ceo@pixaai.com",
        "contactPerson": "PixaAI CEO",
        "status": "pending",
        "createdAt": "2024-01-15T10:00:00Z",
        "additionalInfo": "I am the legitimate owner of PixaAI..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 5. Approve Claim

```bash
curl -X POST "http://localhost:5000/api/admin/claims/CLAIM_ID_HERE/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "reviewNotes": "Claim approved after verification of domain ownership and email confirmation"
  }'
```

Response:

```json
{
  "success": true,
  "message": "Company claim approved successfully",
  "data": {
    "claimId": "claim-uuid-here",
    "status": "approved",
    "companyId": "company-uuid-here",
    "verifiedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 6. Reject Claim (Optional)

```bash
curl -X POST "http://localhost:5000/api/admin/claims/CLAIM_ID_HERE/reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "reviewNotes": "Insufficient documentation provided for verification"
  }'
```

## API Endpoints

### Company Claims

| Method | Endpoint                        | Description                  | Auth Required       |
| ------ | ------------------------------- | ---------------------------- | ------------------- |
| POST   | `/api/companies/claim`          | Create a company claim       | Yes (Company Owner) |
| GET    | `/api/admin/claims`             | List all claims (admin only) | Yes (Admin)         |
| POST   | `/api/admin/claims/:id/approve` | Approve a claim (admin only) | Yes (Admin)         |
| POST   | `/api/admin/claims/:id/reject`  | Reject a claim (admin only)  | Yes (Admin)         |

### Authentication

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| POST   | `/api/auth/login`    | Login user            |
| POST   | `/api/auth/register` | Register new user     |
| GET    | `/api/auth/me`       | Get current user info |

## Claim Status Flow

```
pending → under_review → approved/rejected
```

1. **pending**: Initial status when claim is created
2. **under_review**: Admin has started reviewing the claim
3. **approved**: Claim approved, company marked as verified
4. **rejected**: Claim rejected, company remains unverified

## Verification Methods

The system supports various verification methods:

- **email**: Email domain verification
- **document_upload**: Official business documents
- **website_ownership**: Website ownership verification
- **manual_review**: Manual review by admin team

## Security Considerations

1. **Rate Limiting**: Company claims are rate-limited to prevent spam
2. **Admin Only**: Only admin users can approve/reject claims
3. **Audit Trail**: All claim actions are logged for compliance
4. **Email Verification**: Official email addresses are required
5. **Document Validation**: Uploaded documents are validated

## Troubleshooting

### Common Issues

1. **"Authentication required"**

   - Make sure you're logged in with a valid token
   - Check that the Authorization header is correct

2. **"Admin privileges required"**

   - Ensure you're logged in as admin@texhpulze.local
   - Verify the user has isAdmin: true

3. **"Company already claimed"**

   - The company may already have a verified owner
   - Check existing claims for the company

4. **"Rate limit exceeded"**
   - Wait before creating another claim
   - Check rate limiting configuration

### Debug Steps

1. **Check User Status**:

   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Verify Database**:

   ```bash
   # Check if users exist
   npm run test:seed
   ```

3. **Check Server Logs**:
   - Look for error messages in the API server console
   - Check database connection status

## Next Steps

After successfully testing the claim workflow:

1. **Production Setup**: Configure proper email verification
2. **Document Storage**: Set up secure file upload for verification documents
3. **Notification System**: Implement email notifications for claim status updates
4. **Audit Logging**: Set up comprehensive audit trail for compliance
5. **Admin Dashboard**: Build a web interface for claim management

For questions or issues, refer to the API documentation or create an issue in the repository.
