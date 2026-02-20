'use server';

/**
 * Application Server Actions
 * 
 * Server-side actions for submitting job applications.
 * Includes validation and revalidation for immediate UI updates.
 */

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Role, ApplicationStatus, JobStatus } from '@prisma/client';

export interface ApplyToJobResult {
  success?: boolean;
  error?: string;
}

/**
 * Apply to a job
 * 
 * Requirements:
 * - User must be authenticated
 * - User must have CANDIDATE role (Role.USER)
 * - Job must exist and be OPEN
 * - User must not have already applied
 * - Creates Application record with status APPLIED
 */
export async function applyToJob(
  jobId: string
): Promise<ApplyToJobResult> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'You must be logged in to apply for jobs.' };
    }

    // Check authorization - user must be CANDIDATE (Role.USER)
    if (user.role !== Role.USER) {
      return {
        error: 'Only job seekers can apply for jobs.',
      };
    }

    // Verify job exists and is OPEN
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!job) {
      return { error: 'Job not found.' };
    }

    if (job.status !== JobStatus.OPEN) {
      return {
        error: 'This job is not currently accepting applications.',
      };
    }

    // Check if user has already applied
    const existingApplication = await db.application.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId: user.id,
        },
      },
    });

    if (existingApplication) {
      return { error: 'You have already applied to this job.' };
    }

    // Create the application
    await db.application.create({
      data: {
        jobId,
        userId: user.id,
        status: ApplicationStatus.APPLIED,
      },
    });

    // Revalidate paths to ensure UI updates immediately
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/employer/jobs');
    revalidatePath('/applications');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to apply to job:', error);

    // Handle unique constraint violation (duplicate application)
    if (error.code === 'P2002') {
      return { error: 'You have already applied to this job.' };
    }

    return {
      error: 'Something went wrong while applying. Please try again.',
    };
  }
}

/* ========== Employer ATS: Get applications for a job ========== */

export interface JobApplicationCandidate {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  coverNote: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    mobileNumber: string | null;
    profile: {
      fullName: string;
      resumeUrl: string | null;
      mobile: string | null;
    } | null;
  };
}

export interface GetJobApplicationsResult {
  success?: boolean;
  error?: string;
  jobTitle?: string;
  applications?: JobApplicationCandidate[];
}

/**
 * Get all applications for a job (Employer ATS).
 * Auth: EMPLOYER. Ownership: job must belong to current user's company.
 */
export async function getJobApplications(
  jobId: string
): Promise<GetJobApplicationsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'You must be logged in to view applications.' };
    }
    if (user.role !== Role.EMPLOYER && user.role !== Role.ADMIN) {
      return { error: 'Only employers can view job applications.' };
    }

    // Resolve company
    const company = await db.company.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!company) {
      return { error: 'Company not found.' };
    }

    // Ensure job belongs to this company
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, companyId: true },
    });
    if (!job || job.companyId !== company.id) {
      return { error: 'Job not found or access denied.' };
    }

    const applications = await db.application.findMany({
      where: { jobId },
      select: {
        id: true,
        jobId: true,
        status: true,
        coverNote: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            mobileNumber: true,
            profile: {
              select: {
                fullName: true,
                resumeUrl: true,
                mobile: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const list: JobApplicationCandidate[] = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      status: app.status,
      coverNote: app.coverNote,
      createdAt: app.createdAt,
      user: {
        id: app.user.id,
        email: app.user.email,
        mobileNumber: app.user.mobileNumber,
        profile: app.user.profile
          ? {
              fullName: app.user.profile.fullName,
              resumeUrl: app.user.profile.resumeUrl,
              mobile: app.user.profile.mobile,
            }
          : null,
      },
    }));

    return {
      success: true,
      jobTitle: job.title,
      applications: list,
    };
  } catch (error) {
    console.error('Failed to fetch job applications:', error);
    return {
      error: 'Failed to load applications. Please try again.',
    };
  }
}

/* ========== Employer ATS: Update application status ========== */

export interface UpdateApplicationStatusResult {
  success?: boolean;
  error?: string;
}

/**
 * Update an application's status (Employer ATS).
 * Auth: EMPLOYER. Ownership: application must belong to a job owned by user's company.
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus
): Promise<UpdateApplicationStatusResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'You must be logged in to update applications.' };
    }
    if (user.role !== Role.EMPLOYER && user.role !== Role.ADMIN) {
      return { error: 'Only employers can update application status.' };
    }

    const company = await db.company.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!company) {
      return { error: 'Company not found.' };
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { id: true, jobId: true, job: { select: { companyId: true } } },
    });

    if (!application || application.job.companyId !== company.id) {
      return { error: 'Application not found or access denied.' };
    }

    await db.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    revalidatePath(`/employer/jobs/${application.jobId}/applications`);
    revalidatePath(`/employer/applications/${applicationId}`);
    revalidatePath('/employer/jobs');

    return { success: true };
  } catch (error) {
    console.error('Failed to update application status:', error);
    return {
      error: 'Failed to update status. Please try again.',
    };
  }
}

