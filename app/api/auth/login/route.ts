import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/services/auth.service';
import { setSessionCookie } from '@/lib/cookies';
import { routeWrappers } from '@/lib/request-wrapper';
import { validateJsonBody } from '@/lib/request-validation';
import {
  handleValidationError,
  handleInternalError,
  handleAuthError,
} from '@/lib/api-error';
import { logger, generateRequestId } from '@/lib/logger';

/**
 * POST /api/auth/login
 * 
 * Authenticates a user and returns a session token.
 * 
 * Request body:
 * - email: string (required)
 * - password: string (required)
 * 
 * Response:
 * - 200: Login successful
 * - 400: Validation error
 * - 401: Invalid credentials
 * - 429: Rate limit exceeded
 */
async function loginHandler(request: NextRequest) {
  const requestId = generateRequestId();
  const path = request.nextUrl.pathname;

  // Validate JSON body
  const bodyValidation = await validateJsonBody<{
    email?: string;
    password?: string;
  }>(request);

  if (!bodyValidation.valid) {
    logger.authFailure(requestId, path, bodyValidation.error || 'Invalid request');
    return handleValidationError(bodyValidation.error || 'Invalid request body');
  }

  const body = bodyValidation.data!;

  // Validate required fields
  if (!body.email || !body.password) {
    logger.authFailure(requestId, path, 'Missing required fields');
    return handleValidationError('Email and password are required');
  }

  try {
    const result = await login({
      email: body.email,
      password: body.password,
    });

    if (!result.success) {
      logger.authFailure(
        requestId,
        path,
        result.message,
        request.headers.get('x-forwarded-for') || undefined
      );
      const statusCode = result.message.includes('Invalid') ? 401 : 400;
      return NextResponse.json(
        {
          error: {
            code: statusCode === 401 ? 'INVALID_CREDENTIALS' : 'VALIDATION_ERROR',
            message: result.message,
          },
        },
        { status: statusCode }
      );
    }

    // Set session cookie
    if (result.sessionToken) {
      await setSessionCookie(result.sessionToken);
    }

    return NextResponse.json(
      {
        message: result.message,
        user: result.user,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Login error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
      path,
    });
    return handleInternalError();
  }
}

export const POST = routeWrappers.auth(loginHandler);


