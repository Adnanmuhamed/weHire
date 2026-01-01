import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';
import { handleAuthError, handleValidationError, handleInternalError } from '@/lib/api-error';
import { updateUserStatus } from '@/services/admin.service';
import { routeWrappers } from '@/lib/request-wrapper';
import { validateJsonBody } from '@/lib/request-validation';
import { logger, generateRequestId } from '@/lib/logger';

/**
 * PATCH /api/admin/users/[userId]
 * 
 * Update user status (enable/disable user account)
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireAdmin() - RBAC (ADMIN only)
 * 3. updateUserStatus() - Business logic (assumes RBAC already checked)
 * 
 * Request body:
 * - isActive: boolean (required)
 * 
 * Note: Disabling a user will invalidate all their sessions
 * 
 * Response:
 * - 200: User updated successfully
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 * - 404: User not found
 * - 400: Validation error
 */
async function patchHandler(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const requestId = generateRequestId();
  
  // Step 1: Authentication check
  const user = await getCurrentUser();

  // Step 2: RBAC - require admin role only
  const admin = requireAdmin(user);

  const { userId } = await params;

  // Step 3: Validate JSON body
  const bodyValidation = await validateJsonBody<{ isActive?: boolean }>(request);
  if (!bodyValidation.valid) {
    return handleValidationError(bodyValidation.error || 'Invalid request body');
  }

  const body = bodyValidation.data!;

  // Validate request body
  if (typeof body.isActive !== 'boolean') {
    return handleValidationError('isActive must be a boolean');
  }

  // Step 4: Call service method (assumes RBAC already checked)
  const updatedUser = await updateUserStatus(userId, body.isActive);

  // Log admin action
  logger.adminAction(
    requestId,
    'update_user_status',
    admin.id,
    userId,
    { isActive: body.isActive }
  );

  const response = NextResponse.json(
    {
      message: `User ${body.isActive ? 'enabled' : 'disabled'} successfully`,
      user: updatedUser,
    },
    { status: 200 }
  );
  response.headers.set('x-user-id', admin.id);
  return response;
}

export async function PATCH(
  request: NextRequest,
  params: { params: Promise<{ userId: string }> }
) {
  const wrappedHandler = routeWrappers.admin(patchHandler);
  try {
    return await wrappedHandler(request, params);
  } catch (error) {
    // Handle authentication/authorization errors
    if (
      error instanceof Error &&
      (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')
    ) {
      return handleAuthError(error);
    }

    // Handle validation errors from service
    if (error instanceof Error && error.message) {
      const statusCode = error.message === 'User not found' ? 404 : 400;
      return NextResponse.json(
        {
          error: {
            code: statusCode === 404 ? 'NOT_FOUND' : 'VALIDATION_ERROR',
            message: error.message,
          },
        },
        { status: statusCode }
      );
    }

    // Handle other errors
    return handleInternalError();
  }
}

