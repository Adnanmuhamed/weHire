import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireUser, requireEmployer } from '@/lib/rbac';
import { requireNotJobOwner, requireJobOwnership } from '@/lib/ownership';
import { handleAuthError, handleValidationError, handleInternalError } from '@/lib/api-error';
import { applyToJob, getJobApplications } from '@/services/application.service';
import { routeWrappers } from '@/lib/request-wrapper';
import { validateJsonBody } from '@/lib/request-validation';

/**
 * POST /api/jobs/[jobId]/applications
 * 
 * Apply to a job (Users can apply to jobs they do NOT own)
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireUser() - RBAC (any authenticated user can apply)
 * 3. requireNotJobOwner() - Ownership guard (cannot apply to own job)
 * 4. applyToJob() - Business logic (assumes RBAC + ownership already checked)
 * 
 * Request body:
 * - coverNote?: string (optional cover letter)
 * 
 * Response:
 * - 201: Application created successfully
 * - 401: Not authenticated
 * - 403: Not authorized (trying to apply to own job)
 * - 404: Job not found
 * - 409: Already applied to this job
 * - 400: Validation error (job not open, etc.)
 */
async function postHandler(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  // Step 1: Authentication check
  const user = await getCurrentUser();

  // Step 2: RBAC - require user role (any authenticated user can apply)
  const authenticatedUser = requireUser(user);

  const { jobId } = await params;

  // Step 3: Ownership check - cannot apply to own job
  // This will throw AuthorizationError if user owns the job
  await requireNotJobOwner(authenticatedUser, jobId);

  // Step 4: Validate JSON body
  const bodyValidation = await validateJsonBody<{ coverNote?: string }>(request);
  if (!bodyValidation.valid) {
    return handleValidationError(bodyValidation.error || 'Invalid request body');
  }

  const body = bodyValidation.data!;

  // Step 5: Call service method (assumes RBAC + ownership already checked)
  const application = await applyToJob(
    authenticatedUser,
    jobId,
    body.coverNote
  );

  return NextResponse.json(
    {
      message: 'Application submitted successfully',
      application,
    },
    { status: 201 }
  );
}

export async function POST(
  request: NextRequest,
  params: { params: Promise<{ jobId: string }> }
) {
  const wrappedHandler = routeWrappers.application(postHandler);
  try {
    return await wrappedHandler(request, params);
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof Error && (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')) {
      return handleAuthError(error);
    }

    // Handle validation errors from service
    if (error instanceof Error && error.message) {
      const statusCode = 
        error.message === 'Job not found' ? 404 :
        error.message.includes('already applied') ? 409 :
        400;
      return NextResponse.json(
        {
          error: {
            code: statusCode === 404 ? 'NOT_FOUND' : statusCode === 409 ? 'DUPLICATE_APPLICATION' : 'VALIDATION_ERROR',
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

/**
 * GET /api/jobs/[jobId]/applications
 * 
 * List applications for a job (Employer can view applications for own jobs)
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireEmployer() - RBAC (allows EMPLOYER or ADMIN)
 * 3. requireJobOwnership() - Ownership guard (admin override handled inside)
 * 4. getJobApplications() - Business logic (assumes RBAC + ownership already checked)
 * 
 * Response:
 * - 200: Applications list
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

    // Step 3: Ownership check - can only view applications for own jobs
    // Admin override is handled inside requireJobOwnership
    await requireJobOwnership(authenticatedUser, jobId);

    // Step 4: Call service method (assumes RBAC + ownership already checked)
    const applications = await getJobApplications(authenticatedUser, jobId);

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

    // Handle validation errors from service
    if (error instanceof Error && error.message) {
      const statusCode = error.message === 'Job not found' ? 404 : 400;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    // Handle other errors
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

