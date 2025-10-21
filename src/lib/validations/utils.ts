/**
 * Validation Utilities
 *
 * Helper functions for working with Zod validation schemas.
 * Provides utilities for validation, error formatting, and type guards.
 */

import { ZodError, ZodSchema } from 'zod';

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | {
      success: true;
      data: T;
      errors?: never;
    }
  | {
      success: false;
      data?: never;
      errors: Record<string, string[]>;
    };

/**
 * Validate data against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with parsed data or formatted errors
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const parsed = schema.parse(data);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
      };
    }
    // Unexpected error
    throw error;
  }
}

/**
 * Safely validate data (doesn't throw on validation errors)
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result
 */
export function safeValidate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Format Zod errors into a user-friendly structure
 *
 * @param error - ZodError to format
 * @returns Object mapping field names to error messages
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';

    if (!formatted[path]) {
      formatted[path] = [];
    }

    formatted[path].push(issue.message);
  }

  return formatted;
}

/**
 * Get first error message for a field
 *
 * @param errors - Formatted error object
 * @param field - Field name
 * @returns First error message or undefined
 */
export function getFieldError(
  errors: Record<string, string[]> | undefined,
  field: string
): string | undefined {
  if (!errors || !errors[field]) {
    return undefined;
  }
  return errors[field][0];
}

/**
 * Get all error messages as a flat array
 *
 * @param errors - Formatted error object
 * @returns Array of all error messages
 */
export function getAllErrors(errors: Record<string, string[]>): string[] {
  return Object.values(errors).flat();
}

/**
 * Create a validation error object for API responses
 *
 * @param errors - Formatted error object
 * @returns Error response object
 */
export function createValidationErrorResponse(
  errors: Record<string, string[]>
) {
  return {
    success: false,
    error: 'Validation failed',
    details: errors,
    message: getAllErrors(errors).join(', '),
  };
}

/**
 * Validate and throw on error
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed and validated data
 * @throws ValidationError if validation fails
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Check if value is a valid UUID
 *
 * @param value - Value to check
 * @returns True if valid UUID
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Check if value is a valid URL
 *
 * @param value - Value to check
 * @returns True if valid URL
 */
export function isValidURL(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is a valid email
 *
 * @param value - Value to check
 * @returns True if valid email
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Sanitize string input (trim and remove extra whitespace)
 *
 * @param value - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Generate slug from string
 *
 * @param value - String to convert to slug
 * @returns Slug (lowercase with hyphens)
 */
export function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate pagination parameters
 *
 * @param limit - Items per page
 * @param offset - Number of items to skip
 * @returns Validated pagination params
 */
export function validatePagination(
  limit?: number,
  offset?: number
): { limit: number; offset: number } {
  const validatedLimit = Math.max(1, Math.min(limit || 20, 100));
  const validatedOffset = Math.max(0, offset || 0);

  return {
    limit: validatedLimit,
    offset: validatedOffset,
  };
}

/**
 * Validate date range
 *
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns True if valid date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
}

/**
 * Validate score range
 *
 * @param min - Minimum score
 * @param max - Maximum score
 * @returns True if valid score range
 */
export function isValidScoreRange(min?: number, max?: number): boolean {
  if (min === undefined && max === undefined) return true;
  if (min === undefined || max === undefined) return true;
  return min >= 0 && max <= 10 && max >= min;
}

/**
 * Create a partial validation schema (all fields optional)
 * Useful for update operations
 *
 * @param schema - Original Zod schema
 * @returns Schema with all fields optional
 */
export function createPartialSchema<T extends ZodSchema>(schema: T) {
  return schema.partial();
}

/**
 * Merge multiple error objects
 *
 * @param errorObjects - Array of error objects to merge
 * @returns Merged error object
 */
export function mergeErrors(
  ...errorObjects: Array<Record<string, string[]> | undefined>
): Record<string, string[]> {
  const merged: Record<string, string[]> = {};

  for (const errors of errorObjects) {
    if (!errors) continue;

    for (const [field, messages] of Object.entries(errors)) {
      if (!merged[field]) {
        merged[field] = [];
      }
      merged[field].push(...messages);
    }
  }

  return merged;
}
