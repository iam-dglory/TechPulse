# TechPulze Development Guide

This guide provides instructions for setting up and developing the TechPulze application locally.

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate Limiting and Caching (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# AI Integration
OPENAI_API_KEY=sk-your-key
```

### Setting Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and keys from the Supabase dashboard
3. Run the database migrations:

```bash
# Navigate to the SQL editor in Supabase dashboard
# Run the contents of the following files:
# - supabase-techpulze-complete-schema.sql
```

## Local Development

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

### API Development

When developing API routes, follow these guidelines:

1. Group related endpoints under the same route handler to minimize serverless function count
2. Use the centralized Supabase helpers from `lib/supabase/`
3. Apply rate limiting with the helper from `lib/rateLimited.ts`
4. Validate request bodies using Zod schemas

Example API route:

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { rateLimitRequest } from '@/lib/rateLimited';

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = await rateLimitRequest(request, 'api');
  if (rateLimit) return rateLimit;
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    // Initialize Supabase client
    const supabase = createSupabaseServer();
    
    // Process request...
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Database Migrations

To update the database schema:

1. Make changes to the SQL files in the `supabase/` directory
2. Apply migrations through the Supabase dashboard SQL editor
3. Update the TypeScript types in `types/database.ts`

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.