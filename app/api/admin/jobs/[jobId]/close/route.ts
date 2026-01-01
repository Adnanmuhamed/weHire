import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';
import { handleAuthError } from '@/lib/api-error';
import { forceCloseJob } from '@/services/admin.service';

/**
 * PATCH /api/admin/jobs/[jobId]/close
 * 
 * Force close a job (admin override)
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireAdmin() - RBAC (ADMIN only)
 * 3. forceCloseJob() - Business logic (assumes RBAC already checked)
 * 
 * Note: This is an admin override action that bypasses ownership checks.
 * The job will be set to CLOSED status regardless of who owns it.
 * 
 * Response:
 * - 200: Job closed successfully
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 * - 404: Job not found
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require admin role only
    requireAdmin(user);

    const { jobId } = await params;

    // Step 3: Call service method (assumes RBAC already checked)
    const updatedJob = await forceCloseJob(jobId);

    return NextResponse.json(
      {
        message: 'Job closed successfully',
        job: updatedJob,
      },
      { status: 200 }
    );
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
      const statusCode = error.message === 'Job not found' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status: statusCode });
    }

    // Handle other errors
    console.error('Job force close error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

