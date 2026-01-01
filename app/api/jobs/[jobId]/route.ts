import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { requireJobOwnership } from '@/lib/ownership';
import { handleAuthError } from '@/lib/api-error';
import { getJobById, updateJob, deleteJob } from '@/services/job.service';
import { JobType, JobStatus } from '@prisma/client';

/**
 * GET /api/jobs/[jobId]
 * 
 * Get a single job by ID (Public endpoint - no auth required)
 * 
 * Returns job regardless of status. Caller can filter if needed.
 * 
 * Response:
 * - 200: Job found
 * - 404: Job not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    // Call service method
    const job = await getJobById(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error('Job fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/jobs/[jobId]
 * 
 * Update a job (Employer can update own jobs, Admin can update any job)
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireEmployer() - RBAC (allows EMPLOYER or ADMIN)
 * 3. requireJobOwnership() - Ownership guard (admin override handled inside)
 * 4. updateJob() - Business logic (assumes RBAC + ownership already checked)
 * 
 * Request body (all fields optional):
 * - title?: string
 * - description?: string
 * - location?: string
 * - jobType?: JobType
 * - status?: JobStatus
 * - salaryMin?: number
 * - salaryMax?: number
 * 
 * Response:
 * - 200: Job updated successfully
 * - 401: Not authenticated
 * - 403: Not authorized (not employer/admin or doesn't own job)
 * - 404: Job not found
 * - 400: Validation error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require employer or admin role
    const authenticatedUser = requireEmployer(user);

    const { jobId } = await params;

    // Step 3: Ownership check - employer can only update own jobs
    // Admin override is handled inside requireJobOwnership
    await requireJobOwnership(authenticatedUser, jobId);

    // Step 4: Parse request body
    const body = await request.json();

    // Step 5: Call service method (assumes RBAC + ownership already checked)
    const updatedJob = await updateJob(authenticatedUser, jobId, {
      title: body.title,
      description: body.description,
      location: body.location,
      jobType: body.jobType,
      status: body.status,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
    });

    return NextResponse.json(
      {
        message: 'Job updated successfully',
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof Error && (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')) {
      return handleAuthError(error);
    }

    // Handle validation errors from service
    if (error instanceof Error && error.message) {
      const statusCode = error.message === 'Job not found' ? 404 : 400;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    // Handle other errors
    console.error('Job update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs/[jobId]
 * 
 * Delete a job (Employer can delete own jobs, Admin can delete any job)
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireEmployer() - RBAC (allows EMPLOYER or ADMIN)
 * 3. requireJobOwnership() - Ownership guard (admin override handled inside)
 * 4. deleteJob() - Business logic (assumes RBAC + ownership already checked)
 * 
 * Note: This is a destructive operation. Applications will be cascade deleted.
 * 
 * Response:
 * - 200: Job deleted successfully
 * - 401: Not authenticated
 * - 403: Not authorized (not employer/admin or doesn't own job)
 * - 404: Job not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require employer or admin role
    const authenticatedUser = requireEmployer(user);

    const { jobId } = await params;

    // Step 3: Ownership check - employer can only delete own jobs
    // Admin override is handled inside requireJobOwnership
    await requireJobOwnership(authenticatedUser, jobId);

    // Step 4: Call service method (assumes RBAC + ownership already checked)
    await deleteJob(authenticatedUser, jobId);

    return NextResponse.json(
      { message: 'Job deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof Error && (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')) {
      return handleAuthError(error);
    }

    // Handle validation errors from service
    if (error instanceof Error && error.message) {
      const statusCode = error.message === 'Job not found' ? 404 : 400;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    // Handle other errors
    console.error('Job deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

