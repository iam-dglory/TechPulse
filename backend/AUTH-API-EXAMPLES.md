# TexhPulze 2.0 Authentication API Examples

This document provides curl examples for testing the authentication endpoints.

## 🚀 Quick Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
# Create .env file with:
JWT_SECRET=your-super-secret-jwt-key-here
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=texhpulze_2_0
DATABASE_URL=postgresql://username:password@localhost:5432/texhpulze_2_0
NODE_ENV=development
PORT=5000
```

3. **Run migrations:**

```bash
npm run typeorm:migrate
```

4. **Start the server:**

```bash
npm run dev:ts
```

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/auth`

---

## 🔐 Authentication Endpoints

### 1. Register User

**POST** `/api/auth/register`

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "username": "johndoe",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "industry": "Technology"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "industry": "Technology",
      "emailVerified": false,
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User

**POST** `/api/auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "industry": "Technology",
      "emailVerified": false,
      "isActive": true,
      "lastLoginAt": "2025-01-15T10:35:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:35:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User Profile

**GET** `/api/auth/me`

```bash
# Save the token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "industry": "Technology",
      "emailVerified": false,
      "isActive": true,
      "lastLoginAt": "2025-01-15T10:35:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:35:00.000Z"
    }
  }
}
```

### 4. Update User Profile

**PUT** `/api/auth/profile`

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Johnny",
    "lastName": "Doe-Smith",
    "industry": "AI Research",
    "bio": "Tech ethics researcher and AI safety advocate"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "firstName": "Johnny",
      "lastName": "Doe-Smith",
      "industry": "AI Research",
      "bio": "Tech ethics researcher and AI safety advocate",
      "emailVerified": false,
      "isActive": true,
      "lastLoginAt": "2025-01-15T10:35:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:40:00.000Z"
    }
  }
}
```

### 5. Change Password

**PUT** `/api/auth/change-password`

```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "securepassword123",
    "newPassword": "newsecurepassword456"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 6. Verify Token

**POST** `/api/auth/verify-token`

```bash
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@example.com",
      "username": "johndoe"
    }
  }
}
```

### 7. Health Check

**GET** `/api/auth/health`

```bash
curl -X GET http://localhost:5000/api/auth/health
```

**Response:**

```json
{
  "success": true,
  "message": "Authentication service is healthy",
  "timestamp": "2025-01-15T10:45:00.000Z"
}
```

---

## 🔧 Complete Test Workflow

Here's a complete workflow to test all endpoints:

```bash
# 1. Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@texhpulze.com",
    "username": "testuser",
    "password": "testpass123",
    "firstName": "Test",
    "lastName": "User",
    "industry": "Technology"
  }'

# 2. Login (save the token from response)
TOKEN="your-jwt-token-from-login-response"

# 3. Get profile
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Update profile
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Testing TexhPulze 2.0 authentication"
  }'

# 5. Verify token
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}"

# 6. Change password
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "testpass123",
    "newPassword": "newtestpass456"
  }'
```

---

## 🛡️ Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration with issuer/audience validation
- **Input Validation**: Email format, password strength, required fields
- **Rate Limiting**: Ready for implementation
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers
- **SQL Injection Protection**: TypeORM parameterized queries

---

## 📊 Database Schema

The authentication system uses the following tables:

### Users Table

- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `username` (VARCHAR, Unique)
- `password` (VARCHAR, bcrypt hashed)
- `firstName`, `lastName` (VARCHAR, Optional)
- `industry` (VARCHAR, Optional)
- `avatar`, `bio` (VARCHAR/TEXT, Optional)
- `emailVerified` (BOOLEAN, Default: false)
- `isActive` (BOOLEAN, Default: true)
- `lastLoginAt` (TIMESTAMP, Optional)
- `createdAt`, `updatedAt` (TIMESTAMP, Auto-generated)

---

## 🚀 Production Considerations

1. **Environment Variables**: Set strong JWT_SECRET
2. **Database**: Use PostgreSQL with SSL in production
3. **Rate Limiting**: Implement rate limiting middleware
4. **Email Verification**: Add email verification flow
5. **Password Reset**: Implement password reset functionality
6. **Logging**: Add comprehensive request/error logging
7. **Monitoring**: Set up health checks and monitoring

---

## 🐛 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created (registration)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/token)
- `403`: Forbidden (invalid token)
- `409`: Conflict (email/username already exists)
- `500`: Internal Server Error
