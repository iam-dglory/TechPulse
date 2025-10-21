/**
 * Authentication Login API Endpoint
 *
 * POST /api/auth/login - User login
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { loginSchema } from '@/lib/validations';
import { validate } from '@/lib/validations/utils';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  errorResponseFromUnknown,
  parseRequestBody,
} from '@/lib/api-response';
import {
  AuthenticationError,
  fromSupabaseError,
} from '@/lib/errors';

/**
 * POST /api/auth/login
 *
 * Authenticate user with email and password.
 *
 * Request Body:
 * - email: Email address
 * - password: Password
 *
 * Flow:
 * 1. Validate request data with loginSchema
 * 2. Call Supabase auth.signInWithPassword
 * 3. Return user and session on success
 * 4. Return 401 "Invalid email or password" on failure
 *
 * @returns 200 OK with user and session data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Parse and validate request body
    const body = await parseRequestBody(request);
    const validationResult = validate(loginSchema, body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const { email, password } = validationResult.data;

    // Attempt to sign in with Supabase
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Return generic error message for security
      // Don't reveal whether email exists or password is wrong
      return unauthorizedResponse(
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
    }

    if (!authData.user || !authData.session) {
      return unauthorizedResponse(
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.warn('Failed to fetch user profile:', profileError);
      // Non-fatal - profile might not exist yet
    }

    // Return success response with user, session, and profile
    return successResponse(
      {
        user: authData.user,
        session: authData.session,
        profile: profile || null,
      },
      200,
      'Login successful'
    );
  } catch (error) {
    console.error('POST /api/auth/login error:', error);

    // Handle authentication errors specifically
    if (error instanceof AuthenticationError) {
      return unauthorizedResponse(
        'Invalid email or password',
        'INVALID_CREDENTIALS'
      );
    }

    return errorResponseFromUnknown(error);
  }
}
