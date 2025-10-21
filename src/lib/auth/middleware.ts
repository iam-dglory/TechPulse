/**
 * Authentication Middleware for API Routes
 *
 * Helper functions for checking authentication and authorization
 * in Next.js App Router API routes.
 */

import { cookies } from 'next/headers';
import { supabase } from '../supabase';
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '../errors';
import type { User } from '@supabase/supabase-js';

/**
 * User profile from database
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'citizen' | 'researcher' | 'policymaker' | 'government' | 'admin';
  created_at: string;
  updated_at: string;
}

/**
 * Get current authenticated user from request
 *
 * @returns User object if authenticated
 * @throws AuthenticationError if not authenticated
 */
export async function requireAuth(): Promise<User> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw AuthenticationError.sessionExpired();
    }

    return user;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('Authentication required');
  }
}

/**
 * Get current user's profile from database
 *
 * @returns User profile
 * @throws AuthenticationError if not authenticated
 * @throws NotFoundError if profile not found
 */
export async function requireProfile(): Promise<UserProfile> {
  const user = await requireAuth();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    throw NotFoundError.user(user.id);
  }

  return profile as UserProfile;
}

/**
 * Check if current user has admin role
 *
 * @returns User profile if admin
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if not admin
 */
export async function requireAdmin(): Promise<UserProfile> {
  const profile = await requireProfile();

  if (profile.role !== 'admin') {
    throw AuthorizationError.insufficientPermissions(
      'admin',
      'Admin access required'
    );
  }

  return profile;
}

/**
 * Check if current user has specific role
 *
 * @param requiredRole - Required role
 * @returns User profile if has role
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if doesn't have role
 */
export async function requireRole(
  requiredRole: 'citizen' | 'researcher' | 'policymaker' | 'government' | 'admin'
): Promise<UserProfile> {
  const profile = await requireProfile();

  if (profile.role !== requiredRole && profile.role !== 'admin') {
    throw AuthorizationError.insufficientPermissions(
      requiredRole,
      `${requiredRole} access required`
    );
  }

  return profile;
}

/**
 * Check if current user has one of multiple roles
 *
 * @param roles - Array of allowed roles
 * @returns User profile if has one of the roles
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if doesn't have any of the roles
 */
export async function requireAnyRole(
  roles: Array<'citizen' | 'researcher' | 'policymaker' | 'government' | 'admin'>
): Promise<UserProfile> {
  const profile = await requireProfile();

  if (!roles.includes(profile.role) && profile.role !== 'admin') {
    throw AuthorizationError.insufficientPermissions(
      roles.join(' or '),
      `One of the following roles required: ${roles.join(', ')}`
    );
  }

  return profile;
}

/**
 * Get current user if authenticated (optional auth)
 *
 * @returns User object or null
 */
export async function getOptionalAuth(): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Get current user's profile if authenticated (optional)
 *
 * @returns User profile or null
 */
export async function getOptionalProfile(): Promise<UserProfile | null> {
  try {
    const user = await getOptionalAuth();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return (profile as UserProfile) || null;
  } catch {
    return null;
  }
}

/**
 * Check if user owns a resource
 *
 * @param resourceUserId - User ID of resource owner
 * @returns True if user owns the resource
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if not owner
 */
export async function requireOwnership(resourceUserId: string): Promise<UserProfile> {
  const profile = await requireProfile();

  // Admins can access any resource
  if (profile.role === 'admin') {
    return profile;
  }

  // Check ownership
  if (profile.id !== resourceUserId) {
    throw AuthorizationError.forbidden('You can only access your own resources');
  }

  return profile;
}

/**
 * Check if user can modify a resource (owner or admin)
 *
 * @param resourceUserId - User ID of resource owner
 * @returns User profile if can modify
 * @throws AuthenticationError if not authenticated
 * @throws AuthorizationError if cannot modify
 */
export async function canModifyResource(resourceUserId: string): Promise<boolean> {
  try {
    const profile = await requireProfile();
    return profile.role === 'admin' || profile.id === resourceUserId;
  } catch {
    return false;
  }
}
