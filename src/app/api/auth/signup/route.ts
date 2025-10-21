/**
 * Authentication Signup API Endpoint
 *
 * POST /api/auth/signup - Register new user
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { signUpSchema } from '@/lib/validations';
import { validate } from '@/lib/validations/utils';
import {
  createdResponse,
  validationErrorResponse,
  errorResponseFromUnknown,
  parseRequestBody,
} from '@/lib/api-response';
import {
  ConflictError,
  AuthenticationError,
  DatabaseError,
  fromSupabaseError,
} from '@/lib/errors';

/**
 * POST /api/auth/signup
 *
 * Register a new user with email, password, and profile information.
 *
 * Request Body:
 * - email: Email address
 * - password: Password (min 8 chars with complexity)
 * - username: Username (3-20 alphanumeric chars)
 * - userType: User type (citizen, researcher, policymaker, government)
 * - fullName: Full name (optional)
 *
 * Flow:
 * 1. Validate request data with signUpSchema
 * 2. Check if username already exists in profiles table
 * 3. Create auth user with Supabase auth.signUp
 * 4. Create user profile in profiles table
 * 5. Return user, session, and success message
 *
 * @returns 201 Created with user and session data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Parse and validate request body
    const body = await parseRequestBody(request);
    const validationResult = validate(signUpSchema, body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.errors);
    }

    const { email, password, username, userType, fullName } = validationResult.data;

    // Check if username already exists
    const { data: existingProfile, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (usernameCheckError) {
      console.warn('Username check error:', usernameCheckError);
      // Continue anyway - will be caught by unique constraint if needed
    }

    if (existingProfile) {
      throw ConflictError.duplicate(
        'username',
        username,
        `Username '${username}' is already taken`
      );
    }

    // Create auth user with Supabase
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          user_type: userType,
          full_name: fullName || null,
        },
      },
    });

    if (signUpError) {
      // Handle specific Supabase auth errors
      if (signUpError.message.includes('already registered')) {
        throw ConflictError.duplicate(
          'email',
          email,
          'An account with this email already exists'
        );
      }

      throw new AuthenticationError(
        signUpError.message,
        'SIGNUP_FAILED',
        { originalError: signUpError }
      );
    }

    if (!authData.user) {
      throw new AuthenticationError(
        'Failed to create user account',
        'SIGNUP_FAILED'
      );
    }

    // Create user profile
    // Note: This may be handled by database triggers in production
    // If trigger fails, this ensures profile is created
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          username,
          full_name: fullName || null,
          role: userType as any,
          reputation: 0,
        });

      if (profileError) {
        console.warn('Profile creation error (may be handled by trigger):', profileError);
        // Non-fatal: Database trigger might have already created the profile
      }
    } catch (profileCreationError) {
      console.warn('Profile creation failed (may be handled by trigger):', profileCreationError);
      // Non-fatal error - continue with signup success
    }

    // Return success response with user and session
    return createdResponse(
      {
        user: authData.user,
        session: authData.session,
      },
      'Account created successfully',
      '/dashboard'
    );
  } catch (error) {
    console.error('POST /api/auth/signup error:', error);
    return errorResponseFromUnknown(error);
  }
}
