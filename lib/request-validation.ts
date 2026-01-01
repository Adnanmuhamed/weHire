import { NextRequest } from 'next/server';

/**
 * Request Validation Utilities
 * 
 * Defensive checks for incoming requests:
 * - JSON body validation
 * - Payload size limits
 * - Query parameter validation
 * - Malformed input detection
 */

const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
const MAX_QUERY_STRING_LENGTH = 2048; // 2KB

/**
 * Validate and parse JSON body
 */
export async function validateJsonBody<T = unknown>(
  request: NextRequest
): Promise<{ valid: boolean; data?: T; error?: string }> {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return {
        valid: false,
        error: 'Content-Type must be application/json',
      };
    }

    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > MAX_PAYLOAD_SIZE) {
        return {
          valid: false,
          error: `Payload too large. Maximum size is ${MAX_PAYLOAD_SIZE} bytes`,
        };
      }
    }

    // Read and parse body
    const text = await request.text();

    // Check actual size
    if (text.length > MAX_PAYLOAD_SIZE) {
      return {
        valid: false,
        error: `Payload too large. Maximum size is ${MAX_PAYLOAD_SIZE} bytes`,
      };
    }

    // Parse JSON
    const data = JSON.parse(text) as T;

    return { valid: true, data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        valid: false,
        error: 'Invalid JSON format',
      };
    }

    return {
      valid: false,
      error: 'Failed to parse request body',
    };
  }
}

/**
 * Validate query string length
 */
export function validateQueryString(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  const queryString = request.nextUrl.search;
  if (queryString.length > MAX_QUERY_STRING_LENGTH) {
    return {
      valid: false,
      error: `Query string too long. Maximum length is ${MAX_QUERY_STRING_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: string | null,
  enumObject: Record<string, T>
): { valid: boolean; value?: T; error?: string } {
  if (!value) {
    return { valid: false, error: 'Value is required' };
  }

  const enumValues = Object.values(enumObject);
  if (!enumValues.includes(value as T)) {
    return {
      valid: false,
      error: `Invalid value. Must be one of: ${enumValues.join(', ')}`,
    };
  }

  return { valid: true, value: value as T };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  pageParam: string | null,
  limitParam: string | null
): {
  valid: boolean;
  page?: number;
  limit?: number;
  error?: string;
} {
  let page: number | undefined;
  let limit: number | undefined;

  if (pageParam) {
    page = parseInt(pageParam, 10);
    if (isNaN(page) || page < 1) {
      return { valid: false, error: 'Page must be a positive integer' };
    }
  }

  if (limitParam) {
    limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return {
        valid: false,
        error: 'Limit must be between 1 and 100',
      };
    }
  }

  return { valid: true, page, limit };
}

/**
 * Validate boolean parameter
 */
export function validateBoolean(
  value: string | null
): { valid: boolean; value?: boolean; error?: string } {
  if (value === null) {
    return { valid: true, value: undefined };
  }

  if (value === 'true') {
    return { valid: true, value: true };
  }

  if (value === 'false') {
    return { valid: true, value: false };
  }

  return { valid: false, error: 'Value must be "true" or "false"' };
}

