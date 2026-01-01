import { db } from '@/lib/db';
import { ApplicationStatus, JobStatus } from '@prisma/client';
import { AuthenticatedUser } from '@/lib/rbac';

/**
 * Application Service
 * 
 * Business logic layer for job application operations.
 * Assumes RBAC and ownership checks have already been performed.
 * Focuses on data validation, database operations, and domain logic.
 */

export interface ApplicationWithJob {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  coverNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: string;
    title: string;
    status: JobStatus;
    company: {
      id: string;
      name: string;
    };
  };
}

export interface ApplicationWithUser {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  coverNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      headline: string | null;
      skills: string[];
      experience: number;
      resumeUrl: string | null;
    } | null;
  };
  job: {
    id: string;
    title: string;
  };
}

/**
 * Valid application status transitions
 * 
 * Lifecycle: APPLIED → REVIEWING → SHORTLISTED → REJECTED | HIRED
 */
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.APPLIED]: [
    ApplicationStatus.REVIEWING,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.REVIEWING]: [
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.SHORTLISTED]: [
    ApplicationStatus.REJECTED,
    ApplicationStatus.HIRED,
  ],
  [ApplicationStatus.REJECTED]: [], // Terminal state
  [ApplicationStatus.HIRED]: [], // Terminal state
};

/**
 * Validate application status transition
 */
function validateStatusTransition(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): void {
  if (currentStatus === newStatus) {
    throw new Error('Application status is already set to this value');
  }

  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
      `Allowed transitions: ${allowedTransitions.join(', ') || 'none (terminal state)'}`
    );
  }
}

/**
 * Validate cover note
 */
function validateCoverNote(coverNote?: string | null): void {
  if (coverNote !== undefined && coverNote !== null) {
    if (coverNote.trim().length === 0) {
      throw new Error('Cover note cannot be empty');
    }
    if (coverNote.length > 5000) {
      throw new Error('Cover note must not exceed 5000 characters');
    }
  }
}

/**
 * Apply to a job
 * 
 * Assumes:
 * - User is authenticated and has USER role
 * - User does not own the job (ownership check already performed)
 * 
 * @param user - Authenticated user
 * @param jobId - Job ID to apply to
 * @param coverNote - Optional cover letter
 * @returns Created application with job information
 */
export async function applyToJob(
  user: AuthenticatedUser,
  jobId: string,
  coverNote?: string | null
): Promise<ApplicationWithJob> {
  // Validate cover note if provided
  if (coverNote !== undefined) {
    validateCoverNote(coverNote);
  }

  // Check if job exists and is open for applications
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.status !== JobStatus.OPEN) {
    throw new Error('This job is not currently accepting applications');
  }

  // Check if user already applied (enforced by unique constraint, but check for better error)
  const existingApplication = await db.application.findUnique({
    where: {
      jobId_userId: {
        jobId,
        userId: user.id,
      },
    },
  });

  if (existingApplication) {
    throw new Error('You have already applied to this job');
  }

  // Create application
  const application = await db.application.create({
    data: {
      jobId,
      userId: user.id,
      coverNote: coverNote?.trim() || null,
      status: ApplicationStatus.APPLIED,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          status: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return application;
}

/**
 * Get applications submitted by a user
 * 
 * Assumes:
 * - User is authenticated and has USER role
 * 
 * @param user - Authenticated user
 * @returns List of user's applications with job information
 */
export async function getUserApplications(
  user: AuthenticatedUser
): Promise<ApplicationWithJob[]> {
  const applications = await db.application.findMany({
    where: { userId: user.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          status: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return applications;
}

/**
 * Get applications for a specific job
 * 
 * Assumes:
 * - User is authenticated and has EMPLOYER or ADMIN role
 * - User owns the job (ownership check already performed)
 * 
 * @param user - Authenticated user (employer or admin)
 * @param jobId - Job ID
 * @returns List of applications with user information
 */
export async function getJobApplications(
  user: AuthenticatedUser,
  jobId: string
): Promise<ApplicationWithUser[]> {
  // Verify job exists
  const job = await db.job.findUnique({
    where: { id: jobId },
    select: { id: true },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  // Get applications for the job
  const applications = await db.application.findMany({
    where: { jobId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              headline: true,
              skills: true,
              experience: true,
              resumeUrl: true,
            },
          },
        },
      },
      job: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return applications;
}

/**
 * Update application status
 * 
 * Assumes:
 * - User is authenticated and has EMPLOYER or ADMIN role
 * - User owns the job (ownership check already performed)
 * 
 * @param user - Authenticated user (employer or admin)
 * @param applicationId - Application ID to update
 * @param newStatus - New application status
 * @returns Updated application with job and user information
 */
export async function updateApplicationStatus(
  user: AuthenticatedUser,
  applicationId: string,
  newStatus: ApplicationStatus
): Promise<ApplicationWithUser> {
  // Validate status enum
  if (!Object.values(ApplicationStatus).includes(newStatus)) {
    throw new Error('Invalid application status');
  }

  // Fetch application with current status
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  // Validate status transition
  validateStatusTransition(application.status, newStatus);

  // Update application
  const updatedApplication = await db.application.update({
    where: { id: applicationId },
    data: {
      status: newStatus,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
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
              skills: true,
              experience: true,
              resumeUrl: true,
            },
          },
        },
      },
    },
  });

  return updatedApplication;
}

