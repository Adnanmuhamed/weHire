import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';
import { handleAuthError } from '@/lib/api-error';
import { getJobs } from '@/services/admin.service';
import { JobStatus, JobType } from '@prisma/client';

/**
 * GET /api/admin/jobs
 * 
 * Get all jobs with optional filtering
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireAdmin() - RBAC (ADMIN only)
 * 3. getJobs() - Business logic (assumes RBAC already checked)
 * 
 * Query parameters:
 * - status?: JobStatus (filter by status)
 * - jobType?: JobType (filter by job type)
 * - page?: number (defaults to 1)
 * - limit?: number (defaults to 20, max 100)
 * 
 * Response:
 * - 200: Paginated jobs list
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require admin role only
    requireAdmin(user);

    // Step 3: Parse query parameters
    const { searchParams } = new URL(request.url);

    const statusParam = searchParams.get('status');
    const jobTypeParam = searchParams.get('jobType');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const status =
      statusParam && Object.values(JobStatus).includes(statusParam as JobStatus)
        ? (statusParam as JobStatus)
        : undefined;
    const jobType =
      jobTypeParam && Object.values(JobType).includes(jobTypeParam as JobType)
        ? (jobTypeParam as JobType)
        : undefined;
    const page = pageParam ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Step 4: Call service method (assumes RBAC already checked)
    const result = await getJobs({
      status,
      jobType,
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Handle authentication/authorization errors
    if (
      error instanceof Error &&
      (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')
    ) {
      return handleAuthError(error);
    }

    // Handle other errors
    console.error('Admin jobs fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

