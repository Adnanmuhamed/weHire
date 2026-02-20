'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { CreateJobSchema } from '@/lib/validators/job';
import type { CreateJobInput } from '@/lib/validators/job';
import { JobType, JobStatus, WorkMode } from '@prisma/client';

export type { CreateJobInput } from '@/lib/validators/job';

export interface CreateJobResult {
  success?: boolean;
  error?: string;
  jobId?: string;
}

/**
 * Server action to create a new job posting
 * 
 * Requirements:
 * - User must be authenticated
 * - User must have EMPLOYER role
 * - User must have an associated Company
 * - Job is created with status OPEN by default
 */
export async function createJob(
  input: CreateJobInput
): Promise<CreateJobResult> {
  try {
    // Validate input
    const parsed = CreateJobSchema.safeParse(input);

    if (!parsed.success) {
      const firstError =
        parsed.error.errors[0]?.message || 'Invalid job data';
      return { error: firstError };
    }

    const data = parsed.data;

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'You must be logged in to post a job.' };
    }

    // Check authorization - user must be EMPLOYER or ADMIN
    const authenticatedUser = requireEmployer(user);

    // Resolve company for this recruiter
    const company = await db.company.findUnique({
      where: { ownerId: authenticatedUser.id },
      select: { id: true },
    });

    if (!company) {
      return {
        error: 'Company profile not found. Please contact support.',
      };
    }

    // Create the job
    const job = await db.job.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        location: data.location.trim(),
        jobType: data.jobType as JobType,
        workMode: (data.workMode as WorkMode) ?? 'ONSITE',
        degree: data.degree?.trim() || null,
        status: JobStatus.OPEN,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        experience: data.experience ?? null,
        companyId: company.id,
      },
      select: {
        id: true,
      },
    });

    // Revalidate the employer jobs page
    revalidatePath('/employer/jobs');

    return {
      success: true,
      jobId: job.id,
    };
  } catch (error: any) {
    console.error('Failed to create job:', error);

    // Handle authorization errors
    if (error.name === 'AuthorizationError') {
      return { error: 'You do not have permission to post jobs.' };
    }

    return {
      error:
        'Something went wrong while creating the job. Please try again.',
    };
  }
}

/**
 * Server action to fetch all jobs for the current employer
 * 
 * Returns jobs with application counts, ordered by creation date (newest first).
 */
export interface EmployerJob {
  id: string;
  title: string;
  status: JobStatus;
  applicationCount: number;
  createdAt: Date;
}

export interface GetEmployerJobsResult {
  success?: boolean;
  error?: string;
  jobs?: EmployerJob[];
}

export async function getEmployerJobs(): Promise<GetEmployerJobsResult> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'You must be logged in to view jobs.' };
    }

    // Check authorization - user must be EMPLOYER or ADMIN
    const authenticatedUser = requireEmployer(user);

    // Resolve company for this recruiter
    const company = await db.company.findUnique({
      where: { ownerId: authenticatedUser.id },
      select: { id: true },
    });

    if (!company) {
      return {
        error: 'Company profile not found. Please contact support.',
      };
    }

    // Fetch jobs with application count
    const jobs = await db.job.findMany({
      where: {
        companyId: company.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match interface
    const transformedJobs: EmployerJob[] = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      applicationCount: job._count.applications,
      createdAt: job.createdAt,
    }));

    return {
      success: true,
      jobs: transformedJobs,
    };
  } catch (error: any) {
    console.error('Failed to fetch employer jobs:', error);

    // Handle authorization errors
    if (error.name === 'AuthorizationError') {
      return { error: 'You do not have permission to view jobs.' };
    }

    return {
      error:
        'Something went wrong while fetching jobs. Please try again.',
    };
  }
}
