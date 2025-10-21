/**
 * Error Handling Utilities for TexhPulze
 *
 * Custom error classes and utilities for consistent error handling
 * across the application.
 */

/**
 * Error codes enumeration
 */
export enum ErrorCode {
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

/**
 * Base AppError class
 *
 * All custom errors extend this class for consistent error handling.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);

    // Maintain proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.details = details;

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to JSON format
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp,
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * ValidationError (400)
 *
 * Thrown when input validation fails.
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
  }

  /**
   * Create from validation errors object
   */
  static fromValidationErrors(errors: Record<string, string[]>) {
    const firstError = Object.values(errors)[0]?.[0];
    return new ValidationError(
      firstError || 'Validation failed',
      errors
    );
  }
}

/**
 * AuthenticationError (401)
 *
 * Thrown when authentication fails or is required.
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication required',
    code: ErrorCode = ErrorCode.UNAUTHENTICATED,
    details?: any
  ) {
    super(message, 401, code, true, details);
  }

  /**
   * Create for invalid credentials
   */
  static invalidCredentials(message: string = 'Invalid email or password') {
    return new AuthenticationError(message, ErrorCode.INVALID_CREDENTIALS);
  }

  /**
   * Create for expired token
   */
  static tokenExpired(message: string = 'Authentication token has expired') {
    return new AuthenticationError(message, ErrorCode.TOKEN_EXPIRED);
  }

  /**
   * Create for invalid token
   */
  static invalidToken(message: string = 'Invalid authentication token') {
    return new AuthenticationError(message, ErrorCode.TOKEN_INVALID);
  }

  /**
   * Create for expired session
   */
  static sessionExpired(message: string = 'Session has expired. Please sign in again.') {
    return new AuthenticationError(message, ErrorCode.SESSION_EXPIRED);
  }
}

/**
 * AuthorizationError (403)
 *
 * Thrown when user lacks permission to perform an action.
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'You do not have permission to perform this action',
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    details?: any
  ) {
    super(message, 403, code, true, details);
  }

  /**
   * Create for forbidden access
   */
  static forbidden(message: string = 'Access to this resource is forbidden') {
    return new AuthorizationError(message, ErrorCode.FORBIDDEN);
  }

  /**
   * Create for insufficient permissions
   */
  static insufficientPermissions(
    requiredPermission?: string,
    message?: string
  ) {
    const defaultMessage = requiredPermission
      ? `Requires ${requiredPermission} permission`
      : 'Insufficient permissions';

    return new AuthorizationError(
      message || defaultMessage,
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      requiredPermission ? { requiredPermission } : undefined
    );
  }
}

/**
 * NotFoundError (404)
 *
 * Thrown when a requested resource is not found.
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    code: ErrorCode = ErrorCode.NOT_FOUND,
    details?: any
  ) {
    super(message, 404, code, true, details);
  }

  /**
   * Create for specific resource type
   */
  static resource(
    resourceType: string,
    resourceId?: string,
    message?: string
  ) {
    const defaultMessage = resourceId
      ? `${resourceType} with ID '${resourceId}' not found`
      : `${resourceType} not found`;

    return new NotFoundError(
      message || defaultMessage,
      ErrorCode.RESOURCE_NOT_FOUND,
      { resourceType, resourceId }
    );
  }

  /**
   * Create for user not found
   */
  static user(userId?: string, message?: string) {
    return NotFoundError.resource('User', userId, message);
  }

  /**
   * Create for company not found
   */
  static company(companyId?: string, message?: string) {
    return NotFoundError.resource('Company', companyId, message);
  }

  /**
   * Create for article not found
   */
  static article(articleId?: string, message?: string) {
    return NotFoundError.resource('Article', articleId, message);
  }

  /**
   * Create for discussion not found
   */
  static discussion(discussionId?: string, message?: string) {
    return NotFoundError.resource('Discussion', discussionId, message);
  }
}

/**
 * ConflictError (409)
 *
 * Thrown when a request conflicts with existing data.
 */
export class ConflictError extends AppError {
  constructor(
    message: string = 'Resource already exists',
    code: ErrorCode = ErrorCode.CONFLICT,
    details?: any
  ) {
    super(message, 409, code, true, details);
  }

  /**
   * Create for duplicate entry
   */
  static duplicate(
    field: string,
    value?: string,
    message?: string
  ) {
    const defaultMessage = value
      ? `${field} '${value}' already exists`
      : `${field} already exists`;

    return new ConflictError(
      message || defaultMessage,
      ErrorCode.DUPLICATE_ENTRY,
      { field, value }
    );
  }

  /**
   * Create for email already exists
   */
  static emailExists(email: string, message?: string) {
    return ConflictError.duplicate(
      'Email',
      email,
      message || `An account with email '${email}' already exists`
    );
  }

  /**
   * Create for username already exists
   */
  static usernameExists(username: string, message?: string) {
    return ConflictError.duplicate(
      'Username',
      username,
      message || `Username '${username}' is already taken`
    );
  }
}

/**
 * RateLimitError (429)
 *
 * Thrown when rate limit is exceeded.
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number; // Seconds until retry is allowed

  constructor(
    message: string = 'Too many requests. Please try again later.',
    retryAfter?: number,
    details?: any
  ) {
    super(
      message,
      429,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      true,
      { ...details, retryAfter }
    );
    this.retryAfter = retryAfter;
  }

  /**
   * Create with retry-after time
   */
  static withRetryAfter(retryAfterSeconds: number, message?: string) {
    const defaultMessage = `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`;
    return new RateLimitError(message || defaultMessage, retryAfterSeconds);
  }
}

/**
 * DatabaseError (500)
 *
 * Thrown when database operations fail.
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = 'Database operation failed',
    details?: any
  ) {
    super(message, 500, ErrorCode.DATABASE_ERROR, true, details);
  }
}

/**
 * ExternalServiceError (500)
 *
 * Thrown when external service calls fail.
 */
export class ExternalServiceError extends AppError {
  constructor(
    serviceName: string,
    message: string = 'External service error',
    details?: any
  ) {
    super(
      message,
      500,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      true,
      { ...details, serviceName }
    );
  }
}

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    details?: any;
  };
}

/**
 * Format error into consistent response structure
 *
 * @param error - Error to format
 * @param includeStack - Include stack trace in development
 * @returns Formatted error response
 */
export function formatErrorResponse(
  error: unknown,
  includeStack: boolean = process.env.NODE_ENV === 'development'
): ErrorResponse {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: error.timestamp,
        ...(error.details && { details: error.details }),
        ...(includeStack && { stack: error.stack }),
      },
    };
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    return {
      success: false,
      error: {
        message: error.message,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        ...(includeStack && { stack: error.stack }),
      },
    };
  }

  // Handle unknown errors (strings, objects, etc.)
  return {
    success: false,
    error: {
      message: typeof error === 'string' ? error : 'An unexpected error occurred',
      code: ErrorCode.UNKNOWN_ERROR,
      statusCode: 500,
      timestamp: new Date().toISOString(),
      ...(includeStack && error && typeof error === 'object' && { details: error }),
    },
  };
}

/**
 * Check if error is operational (expected) or programming error
 *
 * @param error - Error to check
 * @returns True if operational error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Log error with appropriate level
 *
 * @param error - Error to log
 * @param context - Additional context
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      // Server errors - log as error
      console.error(`[${timestamp}] [ERROR]`, {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        stack: error.stack,
        ...context,
      });
    } else {
      // Client errors - log as warning
      console.warn(`[${timestamp}] [WARN]`, {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...context,
      });
    }
  } else if (error instanceof Error) {
    console.error(`[${timestamp}] [ERROR]`, {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  } else {
    console.error(`[${timestamp}] [ERROR] Unknown error:`, error, context);
  }
}

/**
 * Convert Supabase error to AppError
 *
 * @param error - Supabase error
 * @returns Appropriate AppError instance
 */
export function fromSupabaseError(error: any): AppError {
  const message = error?.message || 'Database operation failed';
  const code = error?.code;

  // Handle specific Supabase error codes
  if (code === '23505') {
    // Unique violation
    return new ConflictError('Record already exists', ErrorCode.DUPLICATE_ENTRY);
  }

  if (code === '23503') {
    // Foreign key violation
    return new ValidationError('Referenced record does not exist');
  }

  if (code === 'PGRST116') {
    // No rows found
    return new NotFoundError('Record not found');
  }

  // Default to database error
  return new DatabaseError(message, { supabaseCode: code });
}

/**
 * Error handler middleware for catching and logging errors
 *
 * @param error - Error that occurred
 * @param operation - Operation that failed
 * @returns Formatted error response
 */
export function handleError(error: unknown, operation?: string): ErrorResponse {
  // Log the error
  logError(error, operation ? { operation } : undefined);

  // Format and return response
  return formatErrorResponse(error);
}

/**
 * Wrap async function with error handling
 *
 * @param fn - Async function to wrap
 * @returns Wrapped function
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error instanceof AppError ? error : new AppError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        false
      );
    }
  }) as T;
}
