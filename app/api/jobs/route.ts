import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { handleAuthError, handleValidationError, handleInternalError } from '@/lib/api-error';
import { createJob } from '@/services/job.service';
import { searchJobs } from '@/services/job-search.service';
import { validateJobSearchParams } from '@/lib/job-search-validation';
import { routeWrappers } from '@/lib/request-wrapper';
import { validateJsonBody } from '@/lib/request-validation';

/**
 * POST /api/jobs
 * 
 * Create a new job posting (Employer or Admin only)
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireEmployer() - RBAC (allows EMPLOYER or ADMIN)
 * 3. createJob() - Business logic (assumes RBAC already checked)
 * 
 * Ownership: Implicit - job is created for employer's company
 * 
 * Request body:
 * - title: string (required)
 * - description: string (required)
 * - location: string (required)
 * - jobType: JobType (required)
 * - status?: JobStatus (optional, defaults to DRAFT)
 * - salaryMin?: number (optional)
 * - salaryMax?: number (optional)
 * 
 * Response:
 * - 201: Job created successfully
 * - 401: Not authenticated
 * - 403: Not authorized (not an employer or admin)
 * - 400: Validation error
 */
async function postHandler(request: NextRequest) {
  // Step 1: Authentication check
  const user = await getCurrentUser();

  // Step 2: RBAC - require employer or admin role
  const authenticatedUser = requireEmployer(user);

  // Step 3: Validate JSON body
  const bodyValidation = await validateJsonBody(request);
  if (!bodyValidation.valid) {
    return handleValidationError(bodyValidation.error || 'Invalid request body');
  }

  const body = bodyValidation.data as any;

  // Step 4: Call service method (assumes RBAC already checked)
  const job = await createJob(authenticatedUser, {
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
      message: 'Job created successfully',
      job,
    },
    { status: 201 }
  );
}

export const POST = routeWrappers.jobCreation(async (request: NextRequest) => {
  try {
    return await postHandler(request);
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof Error && (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')) {
      return handleAuthError(error);
    }

    // Handle validation errors from service
    if (error instanceof Error && error.message) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return handleInternalError();
  }
});

/**
 * GET /api/jobs
 * 
 * Search and filter jobs (Public endpoint - no auth required)
 * 
 * Only returns jobs with status = OPEN (public search).
 * 
 * Query parameters:
 * - query?: string - Text search on title and description (case-insensitive)
 * - location?: string - Location filter (case-insensitive partial match)
 * - jobType?: JobType - Filter by job type (exact match)
 * - minSalary?: number - Minimum salary filter (non-negative integer)
 * - maxSalary?: number - Maximum salary filter (non-negative integer)
 * - sort?: 'newest' | 'salary_high' | 'salary_low' - Sort option (default: newest)
 * - page?: number - Page number (default: 1, min: 1)
 * - limit?: number - Results per page (default: 20, max: 50)
 * 
 * Response:
 * - 200: Jobs list with pagination metadata
 * - 400: Validation error
 */
async function getHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Validate all search parameters
  const validation = validateJobSearchParams(searchParams);
  if (!validation.valid) {
    return handleValidationError(validation.error || 'Invalid search parameters');
  }

  const params = validation.params!;

  // Build search parameters
  const searchParams_obj = {
    filters: {
      ...(params.query && { query: params.query }),
      ...(params.location && { location: params.location }),
      ...(params.jobType && { jobType: params.jobType }),
      ...(params.minSalary !== undefined && { minSalary: params.minSalary }),
      ...(params.maxSalary !== undefined && { maxSalary: params.maxSalary }),
    },
    ...(params.sort && { sort: params.sort }),
    page: params.page,
    limit: params.limit,
  };

  // Call search service
  const result = await searchJobs(searchParams_obj);

  return NextResponse.json(result, { status: 200 });
}

export const GET = routeWrappers.standard(async (request: NextRequest) => {
  try {
    return await getHandler(request);
  } catch (error) {
    return handleInternalError();
  }
});

