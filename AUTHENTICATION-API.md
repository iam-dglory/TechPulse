## Authentication API - Complete Implementation

REST API endpoints for user authentication with Supabase.

---

## API Endpoints

### POST /api/auth/signup
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "johndoe",
  "userType": "citizen",
  "fullName": "John Doe"
}
```

**Validation:**
- **email**: Valid email address, lowercase, trimmed
- **password**: Min 8 characters, must contain uppercase, lowercase, and number
- **username**: 3-20 characters, alphanumeric and underscores only, lowercase
- **userType**: One of: citizen, researcher, policymaker, government (defaults to 'citizen')
- **fullName**: 2-100 characters (optional)

**Response (201 Created):**
```typescript
{
  success: true,
  data: {
    user: {
      id: string,
      email: string,
      user_metadata: {
        username: string,
        user_type: string,
        full_name: string | null
      },
      created_at: string,
      ...
    },
    session: {
      access_token: string,
      refresh_token: string,
      expires_at: number,
      expires_in: number,
      token_type: "bearer",
      user: { ... }
    }
  },
  message: "Account created successfully"
}
```

**Flow:**
1. Validate request data with `signUpSchema`
2. Check if username already exists in `profiles` table
3. If username taken: Return **409 Conflict**
4. Create auth user with `supabase.auth.signUp()`
   - Stores email, password (hashed)
   - Sets user metadata (username, user_type, full_name)
5. Create user profile in `profiles` table
   - Insert: id, email, username, full_name, role, reputation (0)
   - Note: Profile creation errors are non-fatal (may be handled by database triggers)
6. Return **201 Created** with user and session

**Error Responses:**
- **400 Bad Request**: Validation errors
- **409 Conflict**: Username or email already exists
- **500 Internal Server Error**: Auth or database errors

---

### POST /api/auth/login
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Validation:**
- **email**: Valid email address, lowercase, trimmed
- **password**: Required (min 1 character)

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    user: {
      id: string,
      email: string,
      user_metadata: { ... },
      created_at: string,
      ...
    },
    session: {
      access_token: string,
      refresh_token: string,
      expires_at: number,
      expires_in: number,
      token_type: "bearer",
      user: { ... }
    },
    profile: {
      id: string,
      email: string,
      username: string | null,
      full_name: string | null,
      avatar_url: string | null,
      role: string,
      reputation: number,
      created_at: string,
      updated_at: string
    } | null
  },
  message: "Login successful"
}
```

**Flow:**
1. Validate request data with `loginSchema`
2. Call `supabase.auth.signInWithPassword()`
3. If auth fails: Return **401 Unauthorized** with generic message
4. Fetch user profile from `profiles` table
5. Return **200 OK** with user, session, and profile

**Error Responses:**
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Invalid email or password (generic message for security)
- **500 Internal Server Error**: Server errors

**Security Note:**
Generic error message "Invalid email or password" is returned for both incorrect email and incorrect password to prevent email enumeration attacks.

---

## Supabase Client Utilities

### `src/lib/supabase.ts`

**Browser Client:**
```typescript
import { supabase } from '@/lib/supabase';

// Use in client components
const { data } = await supabase.from('companies').select('*');
```

**Server Client with Cookies:**
```typescript
import { createServerClient } from '@/lib/supabase';

// Use in API routes for auth operations
const supabase = createServerClient();
const { data } = await supabase.auth.getUser();
```

**Key Features:**
- ✅ Browser client for client-side operations
- ✅ Server client with cookie handling for auth
- ✅ Automatic session management via cookies
- ✅ TypeScript type safety with Database types
- ✅ Environment variable validation

**Environment Variables Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Or using VITE_ prefix (fallback)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Authentication Flow

### Signup Flow
```
User → POST /api/auth/signup
  ↓ Validate data (Zod)
  ↓ Check username uniqueness
  ↓ supabase.auth.signUp()
  ↓ Create auth user
  ↓ Insert profile record
  ↓ Return user + session
  → Client stores session (cookies)
```

### Login Flow
```
User → POST /api/auth/login
  ↓ Validate credentials (Zod)
  ↓ supabase.auth.signInWithPassword()
  ↓ Verify credentials
  ↓ Fetch user profile
  ↓ Return user + session + profile
  → Client stores session (cookies)
```

### Session Management
- Sessions stored in HTTP-only cookies
- Automatic refresh via Supabase SDK
- Session expires after inactivity
- Refresh token used for re-authentication

---

## Database Integration

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('citizen', 'researcher', 'policymaker', 'government', 'admin')),
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Database Trigger (Optional):**
```sql
CREATE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'citizen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();
```

This trigger automatically creates profile records when users sign up, making the manual profile creation in the API route a fallback.

---

## Security Features

✅ **Password Requirements**: Min 8 chars, uppercase, lowercase, number
✅ **Email Validation**: RFC-compliant email format
✅ **Username Validation**: Alphanumeric + underscores only
✅ **Unique Constraints**: Email and username uniqueness enforced
✅ **Generic Error Messages**: Prevent email enumeration attacks
✅ **HTTP-Only Cookies**: Session tokens not accessible to JavaScript
✅ **Server-Side Validation**: Zod schemas on all inputs
✅ **CSRF Protection**: Built into Supabase auth flow
✅ **Rate Limiting**: Applied via middleware (60 req/min)

---

## Testing

```bash
# Signup
curl -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "username": "testuser",
    "userType": "citizen",
    "fullName": "Test User"
  }'

# Login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'

# Test duplicate username (should return 409)
curl -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "another@example.com",
    "password": "SecurePass123",
    "username": "testuser",
    "userType": "citizen"
  }'

# Test invalid credentials (should return 401)
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }'
```

---

## Error Handling

### Signup Errors
```json
// Validation error (400)
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "errors": [
      {
        "field": "password",
        "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      }
    ]
  }
}

// Username conflict (409)
{
  "success": false,
  "error": {
    "message": "Username 'johndoe' is already taken",
    "code": "DUPLICATE_RESOURCE",
    "statusCode": 409
  }
}

// Email conflict (409)
{
  "success": false,
  "error": {
    "message": "An account with this email already exists",
    "code": "DUPLICATE_RESOURCE",
    "statusCode": 409
  }
}
```

### Login Errors
```json
// Invalid credentials (401)
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS",
    "statusCode": 401
  }
}
```

---

## Client Integration

### React Example
```typescript
// Signup
const signup = async (data: SignUpInput) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  // Session is automatically stored in cookies
  return result.data;
};

// Login
const login = async (data: LoginInput) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  // Redirect to dashboard
  window.location.href = '/dashboard';
};
```

---

## Production Considerations

1. **Email Verification**: Enable email confirmation in Supabase settings
2. **Password Reset**: Implement forgot password flow
3. **2FA**: Add two-factor authentication for sensitive accounts
4. **OAuth**: Add social login (Google, GitHub, etc.)
5. **Account Lockout**: Implement lockout after N failed login attempts
6. **Audit Logging**: Log all auth events for security monitoring
7. **CORS**: Configure allowed origins in production

**Last Updated:** 2025-01-20
