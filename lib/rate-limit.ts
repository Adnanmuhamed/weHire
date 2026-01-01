import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limiting Utility
 * 
 * In-memory rate limiting implementation for production hardening.
 * For production at scale, consider using Redis-based rate limiting.
 * 
 * Features:
 * - Per-IP and per-key rate limiting
 * - Configurable limits and windows
 * - Automatic cleanup of expired entries
 * - Retry-After header support
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: NextRequest) => string;
}

// In-memory store (consider Redis for production at scale)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

  return ip;
}

/**
 * Check rate limit and return result
 */
function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment count
  entry.count++;
  return { allowed: true };
}

/**
 * Rate limit middleware factory
 * 
 * @param config - Rate limit configuration
 * @returns Middleware function
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : getClientId(request);

    const result = checkRateLimit(key, config);

    if (!result.allowed) {
      const response = NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        },
        { status: 429 }
      );

      if (result.retryAfter) {
        response.headers.set('Retry-After', result.retryAfter.toString());
      }

      return response;
    }

    return null; // Allow request to proceed
  };
}

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limiter for authentication endpoints
   * 5 requests per 15 minutes per IP
   */
  auth: createRateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }),

  /**
   * Standard rate limiter for job creation
   * 10 requests per hour per IP
   */
  jobCreation: createRateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),

  /**
   * Standard rate limiter for applications
   * 20 requests per hour per IP
   */
  application: createRateLimiter({
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),

  /**
   * Very strict rate limiter for admin endpoints
   * 100 requests per minute per IP
   */
  admin: createRateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  }),
};

