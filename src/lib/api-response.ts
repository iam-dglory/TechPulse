/**
 * API Response Utilities for TexhPulze
 *
 * Standardized response helpers for API routes using Next.js App Router.
 * Ensures consistent response format across all endpoints.
 */

import { NextResponse } from 'next/server';
import {
  AppError,
  ValidationError,
  formatErrorResponse,
  type ErrorResponse,
} from './errors';

/**
 * Success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  page?: number;
  totalPages?: number;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

/**
 * Create a success response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param message - Optional success message
 * @param meta - Optional additional metadata
 * @returns NextResponse with success format
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string,
  meta?: Record<string, any>
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a paginated success response
 *
 * @param data - Array of items
 * @param pagination - Pagination metadata
 * @param status - HTTP status code (default: 200)
 * @param message - Optional success message
 * @returns NextResponse with paginated format
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  status: number = 200,
  message?: string
): NextResponse<PaginatedResponse<T>> {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    ...(message && { message }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Create an error response
 *
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @param code - Error code (default: 'INTERNAL_SERVER_ERROR')
 * @param details - Optional additional error details
 * @returns NextResponse with error format
 */
export function errorResponse(
  message: string,
  status: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: any
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      statusCode: status,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a validation error response
 *
 * @param errors - Validation errors object (field: messages[])
 * @param message - Optional custom error message
 * @returns NextResponse with validation error format
 */
export function validationErrorResponse(
  errors: Record<string, string[]>,
  message?: string
): NextResponse<ErrorResponse> {
  const errorMessage = message || 'Validation failed';

  const response: ErrorResponse = {
    success: false,
    error: {
      message: errorMessage,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      timestamp: new Date().toISOString(),
      details: {
        errors,
        fields: Object.keys(errors),
      },
    },
  };

  return NextResponse.json(response, { status: 400 });
}

/**
 * Create response from AppError instance
 *
 * @param error - AppError instance
 * @param includeStack - Include stack trace (default: development only)
 * @returns NextResponse with error format
 */
export function errorResponseFromError(
  error: AppError,
  includeStack: boolean = process.env.NODE_ENV === 'development'
): NextResponse<ErrorResponse> {
  const formattedError = formatErrorResponse(error, includeStack);
  return NextResponse.json(formattedError, { status: error.statusCode });
}

/**
 * Create response from any error
 *
 * @param error - Any error object
 * @param includeStack - Include stack trace (default: development only)
 * @returns NextResponse with error format
 */
export function errorResponseFromUnknown(
  error: unknown,
  includeStack: boolean = process.env.NODE_ENV === 'development'
): NextResponse<ErrorResponse> {
  if (error instanceof AppError) {
    return errorResponseFromError(error, includeStack);
  }

  const formattedError = formatErrorResponse(error, includeStack);
  const status = formattedError.error.statusCode;

  return NextResponse.json(formattedError, { status });
}

/**
 * Create a created response (201)
 *
 * @param data - Created resource data
 * @param message - Optional success message
 * @param resourceId - Optional resource ID for Location header
 * @returns NextResponse with created format
 */
export function createdResponse<T>(
  data: T,
  message?: string,
  resourceId?: string
): NextResponse<SuccessResponse<T>> {
  const response = successResponse(
    data,
    201,
    message || 'Resource created successfully'
  );

  // Add Location header if resource ID provided
  if (resourceId) {
    response.headers.set('Location', resourceId);
  }

  return response;
}

/**
 * Create a no content response (204)
 *
 * @returns NextResponse with no content
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create a not found response (404)
 *
 * @param message - Optional custom message
 * @param resourceType - Type of resource not found
 * @returns NextResponse with not found error
 */
export function notFoundResponse(
  message?: string,
  resourceType?: string
): NextResponse<ErrorResponse> {
  const errorMessage = message || 'Resource not found';

  return errorResponse(
    errorMessage,
    404,
    'NOT_FOUND',
    resourceType ? { resourceType } : undefined
  );
}

/**
 * Create an unauthorized response (401)
 *
 * @param message - Optional custom message
 * @returns NextResponse with unauthorized error
 */
export function unauthorizedResponse(
  message?: string
): NextResponse<ErrorResponse> {
  return errorResponse(
    message || 'Authentication required',
    401,
    'UNAUTHENTICATED'
  );
}

/**
 * Create a forbidden response (403)
 *
 * @param message - Optional custom message
 * @returns NextResponse with forbidden error
 */
export function forbiddenResponse(
  message?: string
): NextResponse<ErrorResponse> {
  return errorResponse(
    message || 'You do not have permission to perform this action',
    403,
    'FORBIDDEN'
  );
}

/**
 * Create a conflict response (409)
 *
 * @param message - Conflict message
 * @param conflictingField - Field that caused the conflict
 * @returns NextResponse with conflict error
 */
export function conflictResponse(
  message: string,
  conflictingField?: string
): NextResponse<ErrorResponse> {
  return errorResponse(
    message,
    409,
    'CONFLICT',
    conflictingField ? { field: conflictingField } : undefined
  );
}

/**
 * Create a rate limit response (429)
 *
 * @param retryAfter - Seconds until retry is allowed
 * @param message - Optional custom message
 * @returns NextResponse with rate limit error
 */
export function rateLimitResponse(
  retryAfter?: number,
  message?: string
): NextResponse<ErrorResponse> {
  const response = errorResponse(
    message || 'Too many requests. Please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED',
    retryAfter ? { retryAfter } : undefined
  );

  // Add Retry-After header if provided
  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

/**
 * Create a bad request response (400)
 *
 * @param message - Error message
 * @param details - Optional additional details
 * @returns NextResponse with bad request error
 */
export function badRequestResponse(
  message: string,
  details?: any
): NextResponse<ErrorResponse> {
  return errorResponse(message, 400, 'INVALID_INPUT', details);
}

/**
 * Create an internal server error response (500)
 *
 * @param message - Optional custom message
 * @param includeDetails - Include error details (default: development only)
 * @returns NextResponse with server error
 */
export function serverErrorResponse(
  message?: string,
  includeDetails: boolean = process.env.NODE_ENV === 'development'
): NextResponse<ErrorResponse> {
  return errorResponse(
    message || 'An internal server error occurred',
    500,
    'INTERNAL_SERVER_ERROR',
    includeDetails ? { environment: process.env.NODE_ENV } : undefined
  );
}

/**
 * Create pagination metadata
 *
 * @param total - Total number of items
 * @param limit - Items per page
 * @param offset - Number of items skipped
 * @returns Pagination metadata object
 */
export function createPaginationMeta(
  total: number,
  limit: number,
  offset: number
): PaginationMeta {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasMore = offset + limit < total;

  return {
    total,
    limit,
    offset,
    hasMore,
    page: currentPage,
    totalPages,
  };
}

/**
 * Response builder for fluent API
 */
export class ResponseBuilder<T = any> {
  private data?: T;
  private statusCode: number = 200;
  private errorMessage?: string;
  private errorCode?: string;
  private successMessage?: string;
  private metadata?: Record<string, any>;
  private validationErrors?: Record<string, string[]>;

  /**
   * Set response data
   */
  withData(data: T): this {
    this.data = data;
    return this;
  }

  /**
   * Set status code
   */
  withStatus(status: number): this {
    this.statusCode = status;
    return this;
  }

  /**
   * Set success message
   */
  withMessage(message: string): this {
    this.successMessage = message;
    return this;
  }

  /**
   * Set error
   */
  withError(message: string, code?: string): this {
    this.errorMessage = message;
    this.errorCode = code;
    return this;
  }

  /**
   * Set validation errors
   */
  withValidationErrors(errors: Record<string, string[]>): this {
    this.validationErrors = errors;
    return this;
  }

  /**
   * Set metadata
   */
  withMeta(meta: Record<string, any>): this {
    this.metadata = meta;
    return this;
  }

  /**
   * Build success response
   */
  success(): NextResponse {
    if (this.data === undefined) {
      throw new Error('Data is required for success response');
    }

    return successResponse(
      this.data,
      this.statusCode,
      this.successMessage,
      this.metadata
    );
  }

  /**
   * Build error response
   */
  error(): NextResponse {
    if (this.validationErrors) {
      return validationErrorResponse(this.validationErrors, this.errorMessage);
    }

    return errorResponse(
      this.errorMessage || 'An error occurred',
      this.statusCode,
      this.errorCode,
      this.metadata
    );
  }

  /**
   * Build response (auto-detect success/error)
   */
  build(): NextResponse {
    if (this.errorMessage || this.validationErrors) {
      return this.error();
    }
    return this.success();
  }
}

/**
 * Create a new response builder
 */
export function createResponse<T = any>(): ResponseBuilder<T> {
  return new ResponseBuilder<T>();
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse(
  response: SuccessResponse | ErrorResponse
): response is SuccessResponse {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: SuccessResponse | ErrorResponse
): response is ErrorResponse {
  return response.success === false;
}

/**
 * Wrap API route handler with automatic error handling
 *
 * @param handler - API route handler function
 * @returns Wrapped handler with error handling
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      return errorResponseFromUnknown(error);
    }
  }) as T;
}

/**
 * Extract query parameters from request URL
 *
 * @param request - Next.js request object
 * @returns Query parameters object
 */
export function getQueryParams(request: Request): Record<string, string> {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Parse and validate JSON request body
 *
 * @param request - Next.js request object
 * @returns Parsed JSON body
 * @throws ValidationError if body is invalid JSON
 */
export async function parseRequestBody<T = any>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body');
  }
}

/**
 * Set CORS headers on response
 *
 * @param response - NextResponse to add headers to
 * @param origin - Allowed origin (default: *)
 * @returns Response with CORS headers
 */
export function withCORS(
  response: NextResponse,
  origin: string = '*'
): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
