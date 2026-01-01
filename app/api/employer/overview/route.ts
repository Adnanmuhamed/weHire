import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { handleAuthError } from '@/lib/api-error';
import { getEmployerOverview } from '@/services/employer-dashboard.service';

/**
 * GET /api/employer/overview
 * 
 * Get employer dashboard overview with aggregated statistics
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireEmployer() - RBAC (allows EMPLOYER or ADMIN)
 * 3. getEmployerOverview() - Business logic (assumes RBAC already checked)
 * 
 * Returns:
 * - totalJobs: Total number of jobs posted
 * - openJobs: Number of jobs with OPEN status
 * - totalApplications: Total number of applications received
 * - applicationsByStatus: Count of applications grouped by status
 * - recentApplications: Last 5 applications received
 * 
 * Response:
 * - 200: Overview data
 * - 401: Not authenticated
 * - 403: Not authorized (not employer or admin)
 * - 400: Company profile not found (for employers)
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require employer or admin role
    const authenticatedUser = requireEmployer(user);

    // Step 3: Call service method (assumes RBAC already checked)
    const overview = await getEmployerOverview(authenticatedUser);

    return NextResponse.json(overview, { status: 200 });
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
      const statusCode = error.message.includes('Company profile not found') ? 400 : 400;
      return NextResponse.json({ error: error.message }, { status: statusCode });
    }

    // Handle other errors
    console.error('Employer overview fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

