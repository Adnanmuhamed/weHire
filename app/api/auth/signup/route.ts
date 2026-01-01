import { NextRequest, NextResponse } from 'next/server';
import { signup } from '@/services/auth.service';
import { setSessionCookie } from '@/lib/cookies';
import { routeWrappers } from '@/lib/request-wrapper';
import { validateJsonBody } from '@/lib/request-validation';
import {
  handleValidationError,
  handleInternalError,
} from '@/lib/api-error';
import { logger, generateRequestId } from '@/lib/logger';

/**
 * POST /api/auth/signup
 * 
 * Creates a new user account and returns a session token.
 * 
 * Request body:
 * - email: string (required)
 * - password: string (required, min 8 chars)
 * - role?: Role (optional, defaults to USER)
 * 
 * Response:
 * - 201: User created successfully
 * - 400: Validation error
 * - 409: User already exists
 * - 429: Rate limit exceeded
 */
async function signupHandler(request: NextRequest) {
  const requestId = generateRequestId();
  const path = request.nextUrl.pathname;

  // Validate JSON body
  const bodyValidation = await validateJsonBody<{
    email?: string;
    password?: string;
    role?: string;
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
    const result = await signup({
      email: body.email,
      password: body.password,
      role: body.role as any,
    });

    if (!result.success) {
      // Check if it's a duplicate email error
      if (result.message.includes('already exists')) {
        return NextResponse.json(
          {
            error: {
              code: 'DUPLICATE_EMAIL',
              message: result.message,
            },
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: result.message,
          },
        },
        { status: 400 }
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
      { status: 201 }
    );
  } catch (error) {
    logger.error('Signup error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
      path,
    });
    return handleInternalError();
  }
}

export const POST = routeWrappers.auth(signupHandler);


