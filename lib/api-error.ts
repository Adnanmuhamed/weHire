import { NextResponse } from 'next/server';
import { AuthenticationError, AuthorizationError } from './rbac';

/**
 * API Error Handler
 * 
 * Converts RBAC guard errors into appropriate HTTP responses.
 * Standardized error response format for production hardening.
 * 
 * Error Response Format:
 * {
 *   error: {
 *     code: string,
 *     message: string
 *   }
 * }
 */

/**
 * Standardized error response interface
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Create standardized error response
 */
function createErrorResponse(
  code: string,
  message: string,
  status: number
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

/**
 * Handle authentication and authorization errors from RBAC guards
 * @param error - Error thrown by RBAC guards
 * @returns NextResponse with appropriate status code and standardized error format
 */
export function handleAuthError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AuthenticationError) {
    return createErrorResponse('UNAUTHORIZED', error.message, 401);
  }

  if (error instanceof AuthorizationError) {
    return createErrorResponse('FORBIDDEN', error.message, 403);
  }

  // Re-throw unexpected errors
  throw error;
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  message: string
): NextResponse<ApiErrorResponse> {
  return createErrorResponse('VALIDATION_ERROR', message, 400);
}

/**
 * Handle not found errors
 */
export function handleNotFoundError(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse('NOT_FOUND', `${resource} not found`, 404);
}

/**
 * Handle rate limit errors
 */
export function handleRateLimitError(
  retryAfter?: number
): NextResponse<ApiErrorResponse> {
  const response = createErrorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests. Please try again later.',
    429
  );

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

/**
 * Handle internal server errors (never leak stack traces)
 */
export function handleInternalError(
  message: string = 'An internal error occurred'
): NextResponse<ApiErrorResponse> {
  return createErrorResponse('INTERNAL_ERROR', message, 500);
}

