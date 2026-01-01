import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';
import { handleAuthError, handleInternalError } from '@/lib/api-error';
import { getAdminOverview } from '@/services/admin.service';
import { routeWrappers } from '@/lib/request-wrapper';

/**
 * GET /api/admin/overview
 * 
 * Get admin dashboard overview with platform-wide statistics
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireAdmin() - RBAC (ADMIN only)
 * 3. getAdminOverview() - Business logic (assumes RBAC already checked)
 * 
 * Returns:
 * - totalUsers: Total number of users
 * - totalEmployers: Total number of employers
 * - totalCompanies: Total number of companies
 * - totalJobs: Total number of jobs
 * - totalApplications: Total number of applications
 * - jobsByStatus: Count of jobs grouped by status
 * - applicationsByStatus: Count of applications grouped by status
 * 
 * Response:
 * - 200: Overview data
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 */
async function getHandler(request: NextRequest) {
  // Step 1: Authentication check
  const user = await getCurrentUser();

  // Step 2: RBAC - require admin role only
  const admin = requireAdmin(user);

  // Step 3: Call service method (assumes RBAC already checked)
  const overview = await getAdminOverview();

  const response = NextResponse.json(overview, { status: 200 });
  response.headers.set('x-user-id', admin.id);
  return response;
}

export const GET = routeWrappers.admin(async (request: NextRequest) => {
  try {
    return await getHandler(request);
  } catch (error) {
    // Handle authentication/authorization errors
    if (
      error instanceof Error &&
      (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')
    ) {
      return handleAuthError(error);
    }

    // Handle other errors
    return handleInternalError();
  }
});

