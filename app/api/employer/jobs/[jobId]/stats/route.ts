import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { requireJobOwnership } from '@/lib/ownership';
import { handleAuthError } from '@/lib/api-error';
import { getEmployerJobStats } from '@/services/employer-dashboard.service';

/**
 * GET /api/employer/jobs/[jobId]/stats
 * 
 * Get statistics for a specific job
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireEmployer() - RBAC (allows EMPLOYER or ADMIN)
 * 3. requireJobOwnership() - Ownership guard (admin override handled inside)
 * 4. getEmployerJobStats() - Business logic (assumes RBAC + ownership already checked)
 * 
 * Returns:
 * - totalApplications: Total number of applications for this job
 * - applicationsByStatus: Count of applications grouped by status
 * - lastApplicationAt: Date of the most recent application (or null)
 * 
 * Response:
 * - 200: Job statistics
 * - 401: Not authenticated
 * - 403: Not authorized (not employer/admin or doesn't own job)
 * - 404: Job not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require employer or admin role
    const authenticatedUser = requireEmployer(user);

    const { jobId } = await params;

    // Step 3: Ownership check - can only view stats for own jobs
    // Admin override is handled inside requireJobOwnership
    await requireJobOwnership(authenticatedUser, jobId);

    // Step 4: Call service method (assumes RBAC + ownership already checked)
    const stats = await getEmployerJobStats(authenticatedUser, jobId);

    return NextResponse.json(stats, { status: 200 });
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
    console.error('Job stats fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

