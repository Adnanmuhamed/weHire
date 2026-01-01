import { db } from '@/lib/db';
import { ApplicationStatus, JobStatus, Role } from '@prisma/client';
import { AuthenticatedUser } from '@/lib/rbac';

/**
 * Employer Dashboard Service
 * 
 * Business logic layer for employer dashboard operations.
 * Assumes RBAC and ownership checks have already been performed.
 * Focuses on efficient aggregation queries and data transformation.
 */

export interface EmployerOverview {
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  applicationsByStatus: {
    status: ApplicationStatus;
    count: number;
  }[];
  recentApplications: {
    applicationId: string;
    jobId: string;
    jobTitle: string;
    status: ApplicationStatus;
    createdAt: Date;
  }[];
}

export interface EmployerJob {
  id: string;
  title: string;
  status: JobStatus;
  applicationCount: number;
  createdAt: Date;
}

export interface EmployerJobStats {
  totalApplications: number;
  applicationsByStatus: {
    status: ApplicationStatus;
    count: number;
  }[];
  lastApplicationAt: Date | null;
}

/**
 * Get company ID for a user
 * For admins, returns null (they can access all data)
 * For employers, returns their company ID
 */
async function getCompanyIdForUser(user: AuthenticatedUser): Promise<string | null> {
  if (user.role === Role.ADMIN) {
    return null; // Admin can see all data
  }

  const company = await db.company.findUnique({
    where: { ownerId: user.id },
    select: { id: true },
  });

  if (!company) {
    throw new Error('Company profile not found');
  }

  return company.id;
}

/**
 * Get employer overview with aggregated statistics
 * 
 * Assumes:
 * - User is authenticated and has EMPLOYER or ADMIN role
 * - Ownership check already performed (if needed)
 * 
 * @param user - Authenticated user (employer or admin)
 * @returns Overview with aggregated stats and recent applications
 */
export async function getEmployerOverview(
  user: AuthenticatedUser
): Promise<EmployerOverview> {
  const companyId = await getCompanyIdForUser(user);

  // Build where clause for jobs
  const jobWhere = companyId ? { companyId } : {};

  // Build where clause for applications (via jobs)
  const applicationWhere = companyId
    ? {
        job: {
          companyId,
        },
      }
    : {};

  // Execute queries in parallel for efficiency
  const [
    totalJobs,
    openJobs,
    totalApplications,
    applicationsByStatus,
    recentApplications,
  ] = await Promise.all([
    // Total jobs count
    db.job.count({
      where: jobWhere,
    }),

    // Open jobs count
    db.job.count({
      where: {
        ...jobWhere,
        status: JobStatus.OPEN,
      },
    }),

    // Total applications count
    db.application.count({
      where: applicationWhere,
    }),

    // Applications grouped by status
    db.application.groupBy({
      by: ['status'],
      where: applicationWhere,
      _count: {
        status: true,
      },
    }),

    // Recent applications (last 5)
    db.application.findMany({
      where: applicationWhere,
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        jobId: true,
        userId: true,
        status: true,
        createdAt: true,
        job: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  // Transform applications by status
  const statusCounts = applicationsByStatus.map((item: { status: ApplicationStatus; _count: { status: number } }) => ({
    status: item.status,
    count: item._count.status,
  }));

  // Ensure all statuses are represented (even with 0 count)
  const allStatuses = Object.values(ApplicationStatus) as ApplicationStatus[];
  const statusCountMap = new Map<ApplicationStatus, number>(
    statusCounts.map((item: { status: ApplicationStatus; count: number }) => [item.status, item.count])
  );

  const applicationsByStatusComplete: { status: ApplicationStatus; count: number }[] = allStatuses.map((status: ApplicationStatus) => ({
    status,
    count: statusCountMap.get(status) || 0,
  }));

  // Transform recent applications to domain-safe DTO
  const recentApplicationsTransformed = recentApplications.map((app: {
    id: string;
    jobId: string;
    status: ApplicationStatus;
    createdAt: Date;
    job: { title: string };
  }) => ({
    applicationId: app.id,
    jobId: app.jobId,
    jobTitle: app.job.title,
    status: app.status,
    createdAt: app.createdAt,
  }));

  return {
    totalJobs,
    openJobs,
    totalApplications,
    applicationsByStatus: applicationsByStatusComplete,
    recentApplications: recentApplicationsTransformed,
  };
}

/**
 * Get all jobs posted by employer with application counts
 * 
 * Assumes:
 * - User is authenticated and has EMPLOYER or ADMIN role
 * - Ownership check already performed (if needed)
 * 
 * @param user - Authenticated user (employer or admin)
 * @returns List of jobs with application counts
 */
export async function getEmployerJobs(
  user: AuthenticatedUser
): Promise<EmployerJob[]> {
  const companyId = await getCompanyIdForUser(user);

  // Build where clause
  const jobWhere = companyId ? { companyId } : {};

  // Get jobs with application counts
  // Using a more efficient approach: get jobs first, then count applications
  const jobs = await db.job.findMany({
    where: jobWhere,
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

  // Transform to DTO
  return jobs.map((job: {
    id: string;
    title: string;
    status: JobStatus;
    createdAt: Date;
    _count: { applications: number };
  }) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    applicationCount: job._count.applications,
    createdAt: job.createdAt,
  }));
}

/**
 * Get statistics for a specific job
 * 
 * Assumes:
 * - User is authenticated and has EMPLOYER or ADMIN role
 * - Ownership check already performed (user owns the job or is admin)
 * 
 * @param user - Authenticated user (employer or admin)
 * @param jobId - Job ID
 * @returns Job statistics with application counts by status
 */
export async function getEmployerJobStats(
  user: AuthenticatedUser,
  jobId: string
): Promise<EmployerJobStats> {
  // Verify job exists and user has access
  const companyId = await getCompanyIdForUser(user);

  const job = await db.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      companyId: true,
    },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  // For non-admin users, verify ownership
  if (companyId && job.companyId !== companyId) {
    throw new Error('Job not found');
  }

  // Execute queries in parallel
  const [totalApplications, applicationsByStatus, lastApplication] =
    await Promise.all([
      // Total applications count
      db.application.count({
        where: { jobId },
      }),

      // Applications grouped by status
      db.application.groupBy({
        by: ['status'],
        where: { jobId },
        _count: {
          status: true,
        },
      }),

      // Last application (if any)
      db.application.findFirst({
        where: { jobId },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

  // Transform applications by status
  const statusCounts = applicationsByStatus.map((item: { status: ApplicationStatus; _count: { status: number } }) => ({
    status: item.status,
    count: item._count.status,
  }));

  // Ensure all statuses are represented (even with 0 count)
  const allStatuses = Object.values(ApplicationStatus) as ApplicationStatus[];
  const statusCountMap = new Map<ApplicationStatus, number>(
    statusCounts.map((item: { status: ApplicationStatus; count: number }) => [item.status, item.count])
  );

  const applicationsByStatusComplete: { status: ApplicationStatus; count: number }[] = allStatuses.map((status: ApplicationStatus) => ({
    status,
    count: statusCountMap.get(status) || 0,
  }));

  return {
    totalApplications,
    applicationsByStatus: applicationsByStatusComplete,
    lastApplicationAt: lastApplication?.createdAt || null,
  };
}

