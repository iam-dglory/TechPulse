# TexhPulze - Error Handling & API Responses

## Overview

Comprehensive error handling utilities and standardized API response helpers for consistent error management across the TexhPulze application.

---

## Table of Contents

1. [Custom Error Classes](#1-custom-error-classes)
2. [Error Codes](#2-error-codes)
3. [Error Formatting](#3-error-formatting)
4. [API Response Helpers](#4-api-response-helpers)
5. [Usage Examples](#5-usage-examples)
6. [Best Practices](#6-best-practices)

---

## 1. Custom Error Classes

### Base AppError Class

All custom errors extend `AppError` for consistent error handling.

```typescript
import { AppError, ErrorCode } from '@/lib/errors';

class AppError extends Error {
  statusCode: number;
  code: ErrorCode;
  isOperational: boolean;
  timestamp: string;
  details?: any;
}
```

**Properties:**
- `message`: Error message
- `statusCode`: HTTP status code
- `code`: Error code enum
- `isOperational`: True if expected error (vs programming error)
- `timestamp`: ISO timestamp when error occurred
- `details`: Optional additional error details

### ValidationError (400)

Thrown when input validation fails.

```typescript
import { ValidationError } from '@/lib/errors';

// Basic usage
throw new ValidationError('Invalid email format');

// With details
throw new ValidationError('Validation failed', {
  email: ['Invalid format'],
  password: ['Too short', 'Missing uppercase letter'],
});

// From validation errors object
const error = ValidationError.fromValidationErrors({
  email: ['Invalid email address'],
  username: ['Username already exists'],
});
```

### AuthenticationError (401)

Thrown when authentication fails or is required.

```typescript
import { AuthenticationError } from '@/lib/errors';

// Basic usage
throw new AuthenticationError('Please sign in to continue');

// Invalid credentials
throw AuthenticationError.invalidCredentials();

// Token expired
throw AuthenticationError.tokenExpired();

// Invalid token
throw AuthenticationError.invalidToken();

// Session expired
throw AuthenticationError.sessionExpired();
```

### AuthorizationError (403)

Thrown when user lacks permission to perform an action.

```typescript
import { AuthorizationError } from '@/lib/errors';

// Basic usage
throw new AuthorizationError('Access denied');

// Forbidden access
throw AuthorizationError.forbidden();

// Insufficient permissions
throw AuthorizationError.insufficientPermissions('admin');
```

### NotFoundError (404)

Thrown when a requested resource is not found.

```typescript
import { NotFoundError } from '@/lib/errors';

// Basic usage
throw new NotFoundError('Page not found');

// Generic resource
throw NotFoundError.resource('Article', 'article-123');

// User not found
throw NotFoundError.user('user-456');

// Company not found
throw NotFoundError.company('company-789');

// Article not found
throw NotFoundError.article('article-abc');

// Discussion not found
throw NotFoundError.discussion('discussion-xyz');
```

### ConflictError (409)

Thrown when a request conflicts with existing data.

```typescript
import { ConflictError } from '@/lib/errors';

// Basic usage
throw new ConflictError('Resource already exists');

// Duplicate field
throw ConflictError.duplicate('email', 'user@example.com');

// Email exists
throw ConflictError.emailExists('user@example.com');

// Username exists
throw ConflictError.usernameExists('john_doe');
```

### RateLimitError (429)

Thrown when rate limit is exceeded.

```typescript
import { RateLimitError } from '@/lib/errors';

// Basic usage
throw new RateLimitError('Too many requests');

// With retry-after
throw RateLimitError.withRetryAfter(60); // 60 seconds
```

### DatabaseError (500)

Thrown when database operations fail.

```typescript
import { DatabaseError } from '@/lib/errors';

throw new DatabaseError('Failed to insert record', {
  table: 'users',
  operation: 'insert',
});
```

### ExternalServiceError (500)

Thrown when external service calls fail.

```typescript
import { ExternalServiceError } from '@/lib/errors';

throw new ExternalServiceError(
  'OpenAI',
  'Failed to generate AI response',
  { statusCode: 503 }
);
```

---

## 2. Error Codes

```typescript
enum ErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Authentication Errors (401)
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Authorization Errors (403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Not Found Errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  COMPANY_NOT_FOUND = 'COMPANY_NOT_FOUND',

  // Conflict Errors (409)
  CONFLICT = 'CONFLICT',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Rate Limiting Errors (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Server Errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Other
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

---

## 3. Error Formatting

### formatErrorResponse()

Format any error into consistent response structure.

```typescript
import { formatErrorResponse } from '@/lib/errors';

const error = new ValidationError('Invalid input');
const formatted = formatErrorResponse(error);

// Returns:
{
  success: false,
  error: {
    message: 'Invalid input',
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    timestamp: '2025-10-21T...',
    details: { ... }
  }
}
```

### logError()

Log error with appropriate level (error/warn).

```typescript
import { logError } from '@/lib/errors';

try {
  // ... operation
} catch (error) {
  logError(error, { userId: 'user-123', operation: 'createUser' });
}
```

### fromSupabaseError()

Convert Supabase errors to AppError.

```typescript
import { fromSupabaseError } from '@/lib/errors';

const { error } = await supabase.from('users').insert(data);

if (error) {
  throw fromSupabaseError(error);
}
```

### withErrorHandling()

Wrap async function with error handling.

```typescript
import { withErrorHandling } from '@/lib/errors';

const safeFunction = withErrorHandling(async (userId: string) => {
  // ... operation
  return result;
});
```

---

## 4. API Response Helpers

### Success Responses

#### successResponse()

Create a standard success response.

```typescript
import { successResponse } from '@/lib/api-response';

export async function GET() {
  const data = { id: '123', name: 'John Doe' };
  return successResponse(data, 200, 'User retrieved successfully');
}

// Returns:
{
  success: true,
  data: { id: '123', name: 'John Doe' },
  message: 'User retrieved successfully',
  meta: {
    timestamp: '2025-10-21T...'
  }
}
```

#### paginatedResponse()

Create a paginated response.

```typescript
import { paginatedResponse, createPaginationMeta } from '@/lib/api-response';

export async function GET(request: Request) {
  const users = await getUsers({ limit: 20, offset: 0 });
  const total = await getUserCount();

  const pagination = createPaginationMeta(total, 20, 0);

  return paginatedResponse(users, pagination);
}

// Returns:
{
  success: true,
  data: [...users],
  pagination: {
    total: 150,
    limit: 20,
    offset: 0,
    hasMore: true,
    page: 1,
    totalPages: 8
  }
}
```

#### createdResponse()

Create a 201 Created response.

```typescript
import { createdResponse } from '@/lib/api-response';

export async function POST(request: Request) {
  const user = await createUser(data);
  return createdResponse(user, 'User created successfully', `/api/users/${user.id}`);
}
```

#### noContentResponse()

Create a 204 No Content response.

```typescript
import { noContentResponse } from '@/lib/api-response';

export async function DELETE() {
  await deleteResource();
  return noContentResponse();
}
```

### Error Responses

#### errorResponse()

Create a generic error response.

```typescript
import { errorResponse } from '@/lib/api-response';

return errorResponse('Something went wrong', 500, 'INTERNAL_SERVER_ERROR');
```

#### validationErrorResponse()

Create a validation error response.

```typescript
import { validationErrorResponse } from '@/lib/api-response';

const errors = {
  email: ['Invalid email format'],
  password: ['Too short', 'Missing uppercase letter'],
};

return validationErrorResponse(errors);

// Returns:
{
  success: false,
  error: {
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    timestamp: '2025-10-21T...',
    details: {
      errors: { email: [...], password: [...] },
      fields: ['email', 'password']
    }
  }
}
```

#### Specific Error Responses

```typescript
import {
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  rateLimitResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// Not Found (404)
return notFoundResponse('User not found', 'User');

// Unauthorized (401)
return unauthorizedResponse('Please sign in');

// Forbidden (403)
return forbiddenResponse('Admin access required');

// Conflict (409)
return conflictResponse('Email already exists', 'email');

// Rate Limit (429)
return rateLimitResponse(60, 'Too many requests');

// Bad Request (400)
return badRequestResponse('Invalid request format');

// Server Error (500)
return serverErrorResponse('Database connection failed');
```

### Error Response from Error Objects

```typescript
import { errorResponseFromError, errorResponseFromUnknown } from '@/lib/api-response';

try {
  // ... operation
} catch (error) {
  if (error instanceof AppError) {
    return errorResponseFromError(error);
  }
  return errorResponseFromUnknown(error);
}
```

### Response Builder (Fluent API)

```typescript
import { createResponse } from '@/lib/api-response';

// Success response
return createResponse()
  .withData(user)
  .withStatus(200)
  .withMessage('User retrieved')
  .withMeta({ cached: true })
  .success();

// Error response
return createResponse()
  .withError('Invalid input', 'VALIDATION_ERROR')
  .withStatus(400)
  .error();

// Validation error
return createResponse()
  .withValidationErrors({ email: ['Invalid format'] })
  .error();
```

### Utility Functions

```typescript
import {
  getQueryParams,
  parseRequestBody,
  withCORS,
  withErrorHandler,
} from '@/lib/api-response';

// Get query parameters
export async function GET(request: Request) {
  const params = getQueryParams(request);
  // params = { page: '1', limit: '20' }
}

// Parse JSON body
export async function POST(request: Request) {
  const body = await parseRequestBody(request);
  // Throws ValidationError if invalid JSON
}

// Add CORS headers
export async function GET() {
  const response = successResponse(data);
  return withCORS(response);
}

// Wrap handler with error handling
export const POST = withErrorHandler(async (request: Request) => {
  // Any thrown error is automatically caught and formatted
  const data = await processRequest(request);
  return successResponse(data);
});
```

---

## 5. Usage Examples

### Example 1: API Route with Validation

```typescript
// app/api/users/route.ts
import { NextRequest } from 'next/server';
import { signUpSchema } from '@/lib/validations';
import { validate } from '@/lib/validations/utils';
import {
  successResponse,
  validationErrorResponse,
  errorResponseFromUnknown,
  parseRequestBody,
} from '@/lib/api-response';
import { ConflictError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body = await parseRequestBody(request);

    // Validate input
    const result = validate(signUpSchema, body);

    if (!result.success) {
      return validationErrorResponse(result.errors);
    }

    // Check if user exists
    const existingUser = await getUserByEmail(result.data.email);
    if (existingUser) {
      throw ConflictError.emailExists(result.data.email);
    }

    // Create user
    const user = await createUser(result.data);

    return successResponse(user, 201, 'User created successfully');
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
```

### Example 2: Protected Route with Auth

```typescript
// app/api/profile/route.ts
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import {
  successResponse,
  unauthorizedResponse,
  errorResponseFromUnknown,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse('Please sign in to view your profile');
    }

    // Get profile data
    const profile = await getProfile(user.id);

    return successResponse(profile);
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
```

### Example 3: Paginated List Endpoint

```typescript
// app/api/articles/route.ts
import { NextRequest } from 'next/server';
import {
  paginatedResponse,
  createPaginationMeta,
  getQueryParams,
  badRequestResponse,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request);

    const limit = parseInt(params.limit || '20', 10);
    const offset = parseInt(params.offset || '0', 10);

    if (limit < 1 || limit > 100) {
      return badRequestResponse('Limit must be between 1 and 100');
    }

    // Fetch articles and total count
    const [articles, total] = await Promise.all([
      getArticles({ limit, offset }),
      getArticlesCount(),
    ]);

    const pagination = createPaginationMeta(total, limit, offset);

    return paginatedResponse(articles, pagination);
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
```

### Example 4: Error Handler Wrapper

```typescript
// app/api/companies/route.ts
import { withErrorHandler } from '@/lib/api-response';
import { successResponse } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const company = await getCompany(id);

  if (!company) {
    throw NotFoundError.company(id);
  }

  return successResponse(company);
});
```

### Example 5: Rate Limiting

```typescript
// app/api/vote/route.ts
import { NextRequest } from 'next/server';
import { RateLimitError } from '@/lib/errors';
import { rateLimitResponse, successResponse } from '@/lib/api-response';

const rateLimiter = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const lastVote = rateLimiter.get(userId);

    if (lastVote && Date.now() - lastVote < 60000) {
      const retryAfter = Math.ceil((60000 - (Date.now() - lastVote)) / 1000);
      return rateLimitResponse(retryAfter);
    }

    // Process vote
    const vote = await createVote(data);

    rateLimiter.set(userId, Date.now());

    return successResponse(vote);
  } catch (error) {
    return errorResponseFromUnknown(error);
  }
}
```

---

## 6. Best Practices

### ✅ DO:

1. **Use appropriate error classes**
   ```typescript
   // Good
   throw NotFoundError.user(userId);

   // Bad
   throw new Error('User not found');
   ```

2. **Include helpful error messages**
   ```typescript
   // Good
   throw new ValidationError('Email must be a valid email address');

   // Bad
   throw new ValidationError('Invalid');
   ```

3. **Add context to errors**
   ```typescript
   // Good
   throw new DatabaseError('Failed to insert user', {
     table: 'users',
     operation: 'insert',
     userId,
   });
   ```

4. **Use consistent response format**
   ```typescript
   // Good
   return successResponse(data);

   // Bad
   return NextResponse.json({ data });
   ```

5. **Log errors appropriately**
   ```typescript
   // Good
   try {
     // ...
   } catch (error) {
     logError(error, { operation: 'createUser', userId });
     throw error;
   }
   ```

### ❌ DON'T:

1. **Don't expose sensitive information in errors**
   ```typescript
   // Bad
   throw new Error(`Database error: ${dbPassword}`);

   // Good
   throw new DatabaseError('Database connection failed');
   ```

2. **Don't swallow errors silently**
   ```typescript
   // Bad
   try {
     // ...
   } catch (error) {
     // Silent failure
   }

   // Good
   try {
     // ...
   } catch (error) {
     logError(error);
     return errorResponseFromUnknown(error);
   }
   ```

3. **Don't return inconsistent response formats**
   ```typescript
   // Bad - mixing formats
   if (error) {
     return { error: 'Something went wrong' };
   }
   return { success: true, data };

   // Good - consistent format
   if (error) {
     return errorResponse('Something went wrong');
   }
   return successResponse(data);
   ```

4. **Don't include stack traces in production**
   ```typescript
   // Good - only in development
   const formatted = formatErrorResponse(error,
     process.env.NODE_ENV === 'development'
   );
   ```

---

## Response Format Reference

### Success Response
```typescript
{
  success: true,
  data: any,
  message?: string,
  meta?: {
    timestamp: string,
    [key: string]: any
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    message: string,
    code: string,
    statusCode: number,
    timestamp: string,
    details?: any
  }
}
```

### Paginated Response
```typescript
{
  success: true,
  data: any[],
  pagination: {
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean,
    page: number,
    totalPages: number
  }
}
```

---

## Summary

✅ **Custom error classes** for all HTTP status codes
✅ **Consistent error codes** across application
✅ **Error formatting** utilities
✅ **API response helpers** for all scenarios
✅ **Type-safe** with TypeScript
✅ **Supabase integration** helpers
✅ **Logging** utilities
✅ **CORS** support
✅ **Rate limiting** support
✅ **Fluent API** with ResponseBuilder

**Files:**
- `src/lib/errors.ts` - Error classes and utilities
- `src/lib/api-response.ts` - API response helpers

---

**Last Updated:** 2025-10-21
**Version:** 1.0.0
