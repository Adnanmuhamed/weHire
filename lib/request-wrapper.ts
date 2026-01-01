import { NextRequest, NextResponse } from 'next/server';
import { generateRequestId, logger } from './logger';
import { rateLimiters } from './rate-limit';

/**
 * Request Wrapper Utility
 * 
 * Wraps route handlers with:
 * - Request ID generation
 * - Request logging
 * - Rate limiting
 * - Error handling
 * - Duration tracking
 */

interface RouteHandlerOptions {
  rateLimiter?: (request: NextRequest) => NextResponse | null;
  logRequest?: boolean;
  logErrors?: boolean;
}

/**
 * Wrap a route handler with production hardening features
 */
export function withHardening<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: RouteHandlerOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as NextRequest;
    const requestId = generateRequestId();
    const startTime = Date.now();

    try {
      // Apply rate limiting if configured
      if (options.rateLimiter) {
        const rateLimitResponse = options.rateLimiter(request);
        if (rateLimitResponse) {
          if (options.logRequest) {
            logger.request(
              requestId,
              request.method,
              request.nextUrl.pathname,
              429,
              Date.now() - startTime
            );
          }
          return rateLimitResponse;
        }
      }

      // Execute handler
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      // Log request if enabled
      if (options.logRequest) {
        // Extract user ID from response headers if set
        const userId = response.headers.get('x-user-id') || undefined;

        logger.request(
          requestId,
          request.method,
          request.nextUrl.pathname,
          response.status,
          duration,
          userId
        );
      }

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error if enabled
      if (options.logErrors !== false) {
        logger.error(
          'Unhandled route error',
          error instanceof Error ? error : new Error(String(error)),
          {
            requestId,
            method: request.method,
            path: request.nextUrl.pathname,
            duration,
          }
        );
      }

      // Re-throw to be handled by Next.js error boundary
      throw error;
    }
  }) as T;
}

/**
 * Pre-configured wrappers for common use cases
 */
export const routeWrappers = {
  /**
   * Wrapper for authentication routes (strict rate limiting)
   */
  auth: <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T => {
    return withHardening(handler, {
      rateLimiter: rateLimiters.auth,
      logRequest: true,
      logErrors: true,
    });
  },

  /**
   * Wrapper for job creation routes
   */
  jobCreation: <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T => {
    return withHardening(handler, {
      rateLimiter: rateLimiters.jobCreation,
      logRequest: true,
      logErrors: true,
    });
  },

  /**
   * Wrapper for application routes
   */
  application: <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T => {
    return withHardening(handler, {
      rateLimiter: rateLimiters.application,
      logRequest: true,
      logErrors: true,
    });
  },

  /**
   * Wrapper for admin routes (very strict rate limiting)
   */
  admin: <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T => {
    return withHardening(handler, {
      rateLimiter: rateLimiters.admin,
      logRequest: true,
      logErrors: true,
    });
  },

  /**
   * Wrapper for standard routes (no rate limiting, just logging)
   */
  standard: <T extends (...args: any[]) => Promise<NextResponse>>(
    handler: T
  ): T => {
    return withHardening(handler, {
      logRequest: true,
      logErrors: true,
    });
  },
};

