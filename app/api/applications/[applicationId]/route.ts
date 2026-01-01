import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer, requireUser } from '@/lib/rbac';
import { requireJobOwnership } from '@/lib/ownership';
import { handleAuthError } from '@/lib/api-error';
import { updateApplicationStatus } from '@/services/application.service';
import { ApplicationStatus } from '@prisma/client';
import { db } from '@/lib/db';

/**
 * PATCH /api/applications/[applicationId]
 * 
 * Update application status (Employer can update applications for own jobs)
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireEmployer() - RBAC (allows EMPLOYER or ADMIN)
 * 3. requireJobOwnership() - Ownership guard via application's job (admin override handled inside)
 * 4. updateApplicationStatus() - Business logic (assumes RBAC + ownership already checked)
 * 
 * Request body:
 * - status: ApplicationStatus (required)
 * 
 * Response:
 * - 200: Application updated successfully
 * - 401: Not authenticated
 * - 403: Not authorized (not employer/admin or doesn't own job)
 * - 404: Application not found
 * - 400: Validation error (invalid status or invalid transition)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require employer or admin role
    const authenticatedUser = requireEmployer(user);

    const { applicationId } = await params;

    // Fetch application with job info for ownership check
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Step 3: Ownership check - can only update applications for own jobs
    // Admin override is handled inside requireJobOwnership
    await requireJobOwnership(authenticatedUser, {
      id: application.job.id,
      companyId: application.job.companyId,
      company: application.job.company,
    });

    // Step 4: Parse request body
    const body = await request.json();

    // Validate status enum
    if (!body.status || !Object.values(ApplicationStatus).includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid application status' },
        { status: 400 }
      );
    }

    // Step 5: Call service method (assumes RBAC + ownership already checked)
    const updatedApplication = await updateApplicationStatus(
      authenticatedUser,
      applicationId,
      body.status
    );

    return NextResponse.json(
      {
        message: 'Application updated successfully',
        application: updatedApplication,
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
      const statusCode = 
        error.message === 'Application not found' ? 404 :
        error.message.includes('Invalid') || error.message.includes('transition') ? 400 :
        400;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    // Handle other errors
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications/[applicationId]
 * 
 * Get a single application
 * - User can view their own applications
 * - Employer can view applications for their own jobs
 * - Admin can view any application
 * 
 * This demonstrates multiple ownership scenarios:
 * - User ownership (application.userId === user.id)
 * - Job ownership (application.job.company.ownerId === user.id)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();
    requireUser(user); // Any authenticated user can view

    const authenticatedUser = user!;
    const { applicationId } = await params;

    // Fetch application with job info
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              select: {
                ownerId: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                headline: true,
                bio: true,
                skills: true,
                experience: true,
                resumeUrl: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check ownership: user owns application OR user owns the job
    const isAdmin = authenticatedUser.role === 'ADMIN';
    const ownsApplication = application.userId === authenticatedUser.id;
    const ownsJob = application.job.company.ownerId === authenticatedUser.id;

    if (!isAdmin && !ownsApplication && !ownsJob) {
      return NextResponse.json(
        { error: 'You do not have permission to view this application' },
        { status: 403 }
      );
    }

    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof Error && (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')) {
      return handleAuthError(error);
    }

    // Handle other errors
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

