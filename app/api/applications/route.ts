import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireUser } from '@/lib/rbac';
import { handleAuthError } from '@/lib/api-error';
import { getUserApplications } from '@/services/application.service';

/**
 * GET /api/applications
 * 
 * Get applications submitted by the current user
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireUser() - RBAC (any authenticated user can view their own applications)
 * 3. getUserApplications() - Business logic (assumes RBAC already checked)
 * 
 * Response:
 * - 200: List of user's applications
 * - 401: Not authenticated
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require user role (any authenticated user)
    const authenticatedUser = requireUser(user);

    // Step 3: Call service method (assumes RBAC already checked)
    const applications = await getUserApplications(authenticatedUser);

    return NextResponse.json(
      {
        applications,
        count: applications.length,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof Error && (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')) {
      return handleAuthError(error);
    }

    // Handle other errors
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

