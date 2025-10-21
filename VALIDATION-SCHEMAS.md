# TexhPulze - Validation Schemas Documentation

## Overview

Comprehensive validation schemas using **Zod** for runtime type validation and TypeScript type inference. All data inputs are validated before processing to ensure data integrity and security.

---

## Installation

```bash
npm install zod
```

**Status:** ✅ Installed

---

## File Structure

```
src/lib/validations/
├── index.ts       # All validation schemas and types
└── utils.ts       # Validation utilities and helpers
```

---

## Table of Contents

1. [Authentication Schemas](#1-authentication-schemas)
2. [Company Schemas](#2-company-schemas)
3. [Voting Schemas](#3-voting-schemas)
4. [Promises Schemas](#4-promises-schemas)
5. [Reviews Schemas](#5-reviews-schemas)
6. [Search Schemas](#6-search-schemas)
7. [Grievance Schemas](#7-grievance-schemas)
8. [Discussion Schemas](#8-discussion-schemas)
9. [Validation Utilities](#9-validation-utilities)
10. [Usage Examples](#10-usage-examples)

---

## 1. Authentication Schemas

### Sign Up Schema

**Validation Rules:**
- **Email**: Valid email format, lowercase, trimmed
- **Password**: Minimum 8 characters, must contain uppercase, lowercase, and number
- **Username**: 3-20 characters, alphanumeric + underscore only
- **User Type**: Enum (`citizen`, `researcher`, `policymaker`, `government`, `admin`)
- **Full Name**: 2-100 characters (optional)

**Schema:**
```typescript
import { signUpSchema, type SignUpInput } from '@/lib/validations';

// TypeScript type
type SignUpInput = {
  email: string;
  password: string;
  username: string;
  userType: 'citizen' | 'researcher' | 'policymaker' | 'government' | 'admin';
  fullName?: string;
};

// Example
const signUpData: SignUpInput = {
  email: 'user@example.com',
  password: 'SecurePass123',
  username: 'john_doe',
  userType: 'citizen',
  fullName: 'John Doe',
};

// Validate
const result = signUpSchema.safeParse(signUpData);
```

### Login Schema

**Validation Rules:**
- **Email**: Valid email format, lowercase, trimmed
- **Password**: Required (no validation on login)

**Schema:**
```typescript
import { loginSchema, type LoginInput } from '@/lib/validations';

type LoginInput = {
  email: string;
  password: string;
};
```

---

## 2. Company Schemas

### Company Schema

**Validation Rules:**
- **Name**: 2-100 characters, trimmed
- **Slug**: Lowercase with hyphens only, 2-100 characters
- **Industry**: Enum (technology, finance, healthcare, etc.)
- **Website**: Valid URL or empty string (optional)
- **Description**: 50-500 characters, trimmed
- **Founded Year**: 1800 to current year
- **Headquarters**: 2-100 characters, trimmed
- **Employee Count**: Positive integer (optional)
- **Logo URL**: Valid URL (optional)

**Schema:**
```typescript
import { companySchema, type CompanyInput } from '@/lib/validations';

type CompanyInput = {
  name: string;
  slug: string;
  industry: Industry;
  website?: string;
  description: string;
  founded_year: number;
  headquarters: string;
  employee_count?: number;
  logo_url?: string;
};

// Example
const companyData: CompanyInput = {
  name: 'TechCorp Inc.',
  slug: 'techcorp-inc',
  industry: 'technology',
  website: 'https://techcorp.com',
  description: 'Leading technology company specializing in AI and cloud solutions...',
  founded_year: 2010,
  headquarters: 'San Francisco, CA',
  employee_count: 500,
};
```

### Industry Enum

```typescript
type Industry =
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'retail'
  | 'manufacturing'
  | 'energy'
  | 'transportation'
  | 'telecommunications'
  | 'education'
  | 'entertainment'
  | 'hospitality'
  | 'real-estate'
  | 'agriculture'
  | 'consulting'
  | 'other';
```

---

## 3. Voting Schemas

### Vote Schema

**Validation Rules:**
- **Company ID**: Valid UUID
- **Vote Type**: Enum (`ethics`, `credibility`, `delivery`, `security`, `innovation`)
- **Score**: Integer 1-10
- **Comment**: Max 500 characters, trimmed (optional)
- **Evidence URL**: Valid URL (optional)

**Schema:**
```typescript
import { voteSchema, type VoteInput } from '@/lib/validations';

type VoteInput = {
  company_id: string;
  vote_type: 'ethics' | 'credibility' | 'delivery' | 'security' | 'innovation';
  score: number; // 1-10
  comment?: string;
  evidence_url?: string;
};

// Example
const voteData: VoteInput = {
  company_id: '123e4567-e89b-12d3-a456-426614174000',
  vote_type: 'ethics',
  score: 8,
  comment: 'Company shows strong ethical practices in supply chain management.',
  evidence_url: 'https://example.com/ethics-report',
};
```

---

## 4. Promises Schemas

### Promise Schema

**Validation Rules:**
- **Company ID**: Valid UUID
- **Promise Text**: 20-500 characters, trimmed
- **Category**: Enum (`product`, `ethics`, `sustainability`, `privacy`, `security`)
- **Promised Date**: YYYY-MM-DD format
- **Deadline Date**: YYYY-MM-DD format, must be >= promised date
- **Source URL**: Valid URL (required)
- **Impact Level**: Integer 1-5
- **Status**: Enum (default: `pending`)

**Schema:**
```typescript
import { promiseSchema, type PromiseInput } from '@/lib/validations';

type PromiseInput = {
  company_id: string;
  promise_text: string;
  category: 'product' | 'ethics' | 'sustainability' | 'privacy' | 'security';
  promised_date: string; // YYYY-MM-DD
  deadline_date: string; // YYYY-MM-DD
  source_url: string;
  impact_level: number; // 1-5
  status?: 'pending' | 'in-progress' | 'kept' | 'broken' | 'delayed';
};

// Example
const promiseData: PromiseInput = {
  company_id: '123e4567-e89b-12d3-a456-426614174000',
  promise_text: 'We will achieve carbon neutrality across all operations',
  category: 'sustainability',
  promised_date: '2024-01-15',
  deadline_date: '2025-12-31',
  source_url: 'https://company.com/sustainability-report',
  impact_level: 5,
};
```

---

## 5. Reviews Schemas

### Review Schema

**Validation Rules:**
- **Company ID**: Valid UUID
- **Rating**: Integer 1-5
- **Title**: 10-100 characters, trimmed
- **Content**: 50-2000 characters, trimmed
- **Is Employee**: Boolean (default: false)
- **Is Customer**: Boolean (default: false)
- **Pros**: Max 500 characters (optional)
- **Cons**: Max 500 characters (optional)

**Schema:**
```typescript
import { reviewSchema, type ReviewInput } from '@/lib/validations';

type ReviewInput = {
  company_id: string;
  rating: number; // 1-5
  title: string;
  content: string;
  is_employee: boolean;
  is_customer: boolean;
  pros?: string;
  cons?: string;
};

// Example
const reviewData: ReviewInput = {
  company_id: '123e4567-e89b-12d3-a456-426614174000',
  rating: 4,
  title: 'Great workplace culture and benefits',
  content: 'I have been working at this company for 2 years and the culture is amazing...',
  is_employee: true,
  is_customer: false,
  pros: 'Excellent benefits, flexible work hours, collaborative team',
  cons: 'Limited career advancement opportunities',
};
```

---

## 6. Search Schemas

### Search Schema

**Validation Rules:**
- **Query**: 1-100 characters, trimmed
- **Industry**: Industry enum (optional)
- **Score Min/Max**: 0-10 (optional)
- **Verification Tier**: Enum (optional)
- **Sort**: Sort order enum (default: `relevance`)
- **Limit**: 1-100 (default: 20)
- **Offset**: >= 0 (default: 0)

**Schema:**
```typescript
import { searchSchema, type SearchInput } from '@/lib/validations';

type SearchInput = {
  query: string;
  industry?: Industry;
  score_min?: number;
  score_max?: number;
  verification_tier?: 'unverified' | 'basic' | 'verified' | 'premium';
  sort?: 'relevance' | 'score_high' | 'score_low' | 'name_asc' | 'name_desc' | ...;
  limit?: number;
  offset?: number;
};

// Example
const searchData: SearchInput = {
  query: 'tech companies',
  industry: 'technology',
  score_min: 7,
  verification_tier: 'verified',
  sort: 'score_high',
  limit: 20,
  offset: 0,
};
```

---

## 7. Grievance Schemas

### Grievance Schema

**Validation Rules:**
- **Title**: 10-200 characters, trimmed
- **Description**: 50-2000 characters, trimmed
- **Category**: Grievance category enum
- **Risk Level**: Enum (default: `medium`)
- **Location**: 3-200 characters (optional)
- **Evidence URLs**: Array of URLs, max 5 (optional)

**Schema:**
```typescript
import { grievanceSchema, type GrievanceInput } from '@/lib/validations';

type GrievanceInput = {
  title: string;
  description: string;
  category: GrievanceCategory;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  evidence_urls?: string[];
};

// Example
const grievanceData: GrievanceInput = {
  title: 'Poor road conditions causing accidents',
  description: 'The main highway has multiple potholes that have caused several accidents...',
  category: 'infrastructure',
  risk_level: 'high',
  location: 'Main Highway, District 5',
  evidence_urls: [
    'https://example.com/photo1.jpg',
    'https://example.com/photo2.jpg',
  ],
};
```

### Grievance Categories

```typescript
type GrievanceCategory =
  | 'infrastructure'
  | 'healthcare'
  | 'education'
  | 'transportation'
  | 'environment'
  | 'safety'
  | 'corruption'
  | 'public-service'
  | 'other';
```

---

## 8. Discussion Schemas

### Discussion Schema

**Validation Rules:**
- **Title**: 10-200 characters, trimmed
- **Content**: 50-5000 characters, trimmed
- **Category**: Discussion category enum
- **Tags**: Array of strings, 2-30 chars each, max 5 tags (optional)

**Schema:**
```typescript
import { discussionSchema, type DiscussionInput } from '@/lib/validations';

type DiscussionInput = {
  title: string;
  content: string;
  category: DiscussionCategory;
  tags?: string[];
};

// Example
const discussionData: DiscussionInput = {
  title: 'How can we improve public transportation?',
  content: 'I would like to start a discussion about improving our city\'s public transportation...',
  category: 'policy',
  tags: ['transportation', 'policy', 'infrastructure'],
};
```

### Comment Schema

```typescript
type CommentInput = {
  discussion_id: string;
  content: string; // 5-1000 characters
  parent_comment_id?: string; // For nested comments
};
```

---

## 9. Validation Utilities

### validate()

Validate data and return structured result:

```typescript
import { validate } from '@/lib/validations/utils';
import { signUpSchema } from '@/lib/validations';

const result = validate(signUpSchema, userData);

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.error('Validation errors:', result.errors);
  // errors = { email: ['Invalid email'], password: ['Too short'] }
}
```

### safeValidate()

Safe validation (never throws):

```typescript
import { safeValidate } from '@/lib/validations/utils';

const result = safeValidate(companySchema, companyData);
// Always returns ValidationResult
```

### formatZodErrors()

Format Zod errors into user-friendly structure:

```typescript
import { formatZodErrors } from '@/lib/validations/utils';

try {
  schema.parse(data);
} catch (error) {
  if (error instanceof ZodError) {
    const formatted = formatZodErrors(error);
    // { field: ['Error 1', 'Error 2'], ... }
  }
}
```

### getFieldError()

Get first error for a specific field:

```typescript
import { getFieldError } from '@/lib/validations/utils';

const emailError = getFieldError(errors, 'email');
// Returns: 'Invalid email address' or undefined
```

### Helper Functions

```typescript
// UUID validation
isValidUUID('123e4567-e89b-12d3-a456-426614174000'); // true

// URL validation
isValidURL('https://example.com'); // true

// Email validation
isValidEmail('user@example.com'); // true

// Generate slug
generateSlug('TechCorp Inc.'); // 'techcorp-inc'

// Sanitize string
sanitizeString('  Extra   spaces  '); // 'Extra spaces'

// Validate pagination
validatePagination(50, 20); // { limit: 50, offset: 20 }

// Validate date range
isValidDateRange('2024-01-01', '2024-12-31'); // true

// Validate score range
isValidScoreRange(5, 10); // true
```

---

## 10. Usage Examples

### React Component with Validation

```typescript
import { useState } from 'react';
import { signUpSchema, type SignUpInput } from '@/lib/validations';
import { validate, getFieldError } from '@/lib/validations/utils';

function SignUpForm() {
  const [formData, setFormData] = useState<Partial<SignUpInput>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const result = validate(signUpSchema, formData);

    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    // Data is valid - proceed with API call
    try {
      await signUp(result.data);
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email || ''}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {getFieldError(errors, 'email') && (
        <span className="error">{getFieldError(errors, 'email')}</span>
      )}

      {/* More fields... */}
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### API Route with Validation

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { companySchema } from '@/lib/validations';
import { createValidationErrorResponse } from '@/lib/validations/utils';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate request body
  const result = companySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      createValidationErrorResponse(formatZodErrors(result.error)),
      { status: 400 }
    );
  }

  // Proceed with validated data
  const company = await createCompany(result.data);

  return NextResponse.json({ success: true, company });
}
```

### Custom Hook for Validation

```typescript
import { useState } from 'react';
import { ZodSchema } from 'zod';
import { validate, type ValidationResult } from '@/lib/validations/utils';

export function useValidation<T>(schema: ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validateData = (data: unknown): ValidationResult<T> => {
    const result = validate(schema, data);

    if (!result.success) {
      setErrors(result.errors);
    } else {
      setErrors({});
    }

    return result;
  };

  const clearErrors = () => setErrors({});
  const clearFieldError = (field: string) => {
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  return {
    errors,
    validateData,
    clearErrors,
    clearFieldError,
  };
}

// Usage
function MyForm() {
  const { errors, validateData } = useValidation(signUpSchema);

  const handleSubmit = (data: unknown) => {
    const result = validateData(data);
    if (result.success) {
      // Process data
    }
  };

  return <form>...</form>;
}
```

---

## Error Response Format

All validation errors follow this format:

```typescript
{
  success: false,
  error: 'Validation failed',
  details: {
    email: ['Invalid email address'],
    password: [
      'Password must be at least 8 characters',
      'Password must contain uppercase letter'
    ],
    username: ['Username can only contain letters, numbers, and underscores']
  },
  message: 'Invalid email address, Password must be at least 8 characters, ...'
}
```

---

## Best Practices

### 1. Always Validate User Input

```typescript
// ✅ Good
const result = validate(schema, userInput);
if (result.success) {
  await saveData(result.data);
}

// ❌ Bad
await saveData(userInput); // No validation
```

### 2. Use Type Inference

```typescript
// ✅ Good
import { type SignUpInput } from '@/lib/validations';
const data: SignUpInput = { ... };

// ❌ Bad
const data: any = { ... };
```

### 3. Provide Helpful Error Messages

```typescript
// All schemas include descriptive error messages
z.string().min(10, 'Title must be at least 10 characters')
```

### 4. Validate on Client and Server

```typescript
// Client-side validation for UX
const clientResult = validate(schema, formData);

// Server-side validation for security
const serverResult = validate(schema, requestBody);
```

### 5. Use Partial Schemas for Updates

```typescript
// Create operation - all fields required
const createResult = validate(companySchema, data);

// Update operation - all fields optional
const updateResult = validate(companySchema.partial(), data);
```

---

## Testing Validation Schemas

```typescript
import { describe, it, expect } from 'vitest';
import { signUpSchema } from '@/lib/validations';

describe('signUpSchema', () => {
  it('should validate valid signup data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'SecurePass123',
      username: 'john_doe',
      userType: 'citizen',
    };

    const result = signUpSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject weak password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'weak',
      username: 'john_doe',
      userType: 'citizen',
    };

    const result = signUpSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

---

## Migration Guide

If you have existing validation code, migrate to Zod schemas:

### Before (Manual Validation)
```typescript
function validateSignUp(data: any) {
  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
    throw new Error('Invalid email');
  }
  if (!data.password || data.password.length < 8) {
    throw new Error('Password too short');
  }
  // More manual checks...
}
```

### After (Zod Schema)
```typescript
import { signUpSchema } from '@/lib/validations';
import { validate } from '@/lib/validations/utils';

const result = validate(signUpSchema, data);
if (!result.success) {
  console.error(result.errors);
}
```

---

## Summary

✅ **Complete validation schemas** for all data inputs
✅ **Type-safe** with TypeScript inference
✅ **Comprehensive error messages** for user feedback
✅ **Utility functions** for common validation tasks
✅ **Reusable** across client and server
✅ **Well-documented** with examples

**Next Steps:**
- Integrate schemas into API routes
- Add client-side form validation
- Create validation middleware
- Add unit tests for schemas

---

**Last Updated:** 2025-10-21
**Version:** 1.0.0
