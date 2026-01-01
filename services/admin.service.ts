import { db } from '@/lib/db';
import { ApplicationStatus, JobStatus, JobType, Role } from '@prisma/client';
import { deleteAllUserSessions } from '@/lib/session';

/**
 * Admin Service
 * 
 * Business logic layer for admin moderation operations.
 * Assumes RBAC checks have already been performed (requireAdmin).
 * Focuses on platform-wide management and oversight.
 */

export interface AdminOverview {
  totalUsers: number;
  totalEmployers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  jobsByStatus: {
    status: JobStatus;
    count: number;
  }[];
  applicationsByStatus: {
    status: ApplicationStatus;
    count: number;
  }[];
}

export interface AdminUser {
  userId: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface AdminCompany {
  companyId: string;
  name: string;
  isVerified: boolean;
  ownerId: string;
  createdAt: Date;
}

export interface AdminJob {
  jobId: string;
  title: string;
  status: JobStatus;
  jobType: JobType;
  companyId: string;
  companyName: string;
  createdAt: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UserListParams extends PaginationParams {
  role?: Role;
  isActive?: boolean;
}

export interface JobListParams {
  status?: JobStatus;
  jobType?: JobType;
  page?: number;
  limit?: number;
}

/**
 * Get admin overview with platform-wide statistics
 * 
 * Assumes:
 * - User is authenticated and has ADMIN role
 * 
 * @returns Platform-wide aggregated statistics
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  // Execute queries in parallel for efficiency
  const [
    totalUsers,
    totalEmployers,
    totalCompanies,
    totalJobs,
    totalApplications,
    jobsByStatus,
    applicationsByStatus,
  ] = await Promise.all([
    // Total users count
    db.user.count(),

    // Total employers count
    db.user.count({
      where: {
        role: Role.EMPLOYER,
      },
    }),

    // Total companies count
    db.company.count(),

    // Total jobs count
    db.job.count(),

    // Total applications count
    db.application.count(),

    // Jobs grouped by status
    db.job.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    }),

    // Applications grouped by status
    db.application.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    }),
  ]);

  // Transform jobs by status
  const jobsByStatusCounts = jobsByStatus.map(
    (item: { status: JobStatus; _count: { status: number } }) => ({
      status: item.status,
      count: item._count.status,
    })
  );

  // Ensure all job statuses are represented
  const allJobStatuses = Object.values(JobStatus) as JobStatus[];
  const jobStatusCountMap = new Map<JobStatus, number>(
    jobsByStatusCounts.map((item: { status: JobStatus; count: number }) => [
      item.status,
      item.count,
    ])
  );

  const jobsByStatusComplete: { status: JobStatus; count: number }[] =
    allJobStatuses.map((status: JobStatus) => ({
      status,
      count: jobStatusCountMap.get(status) || 0,
    }));

  // Transform applications by status
  const applicationsByStatusCounts = applicationsByStatus.map(
    (item: { status: ApplicationStatus; _count: { status: number } }) => ({
      status: item.status,
      count: item._count.status,
    })
  );

  // Ensure all application statuses are represented
  const allApplicationStatuses = Object.values(
    ApplicationStatus
  ) as ApplicationStatus[];
  const applicationStatusCountMap = new Map<ApplicationStatus, number>(
    applicationsByStatusCounts.map(
      (item: { status: ApplicationStatus; count: number }) => [
        item.status,
        item.count,
      ]
    )
  );

  const applicationsByStatusComplete: {
    status: ApplicationStatus;
    count: number;
  }[] = allApplicationStatuses.map((status: ApplicationStatus) => ({
    status,
    count: applicationStatusCountMap.get(status) || 0,
  }));

  return {
    totalUsers,
    totalEmployers,
    totalCompanies,
    totalJobs,
    totalApplications,
    jobsByStatus: jobsByStatusComplete,
    applicationsByStatus: applicationsByStatusComplete,
  };
}

/**
 * Get paginated list of users
 * 
 * Assumes:
 * - User is authenticated and has ADMIN role
 * 
 * @param params - Pagination and filter parameters
 * @returns Paginated list of users with metadata
 */
export async function getUsers(
  params?: UserListParams
): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = params?.page || 1;
  const limit = Math.min(params?.limit || 20, 100); // Max 100 per page
  const skip = (page - 1) * limit;

  // Build where clause
  const where: {
    role?: Role;
    isActive?: boolean;
  } = {};

  if (params?.role) {
    where.role = params.role;
  }

  if (params?.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  // Execute queries in parallel
  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    db.user.count({ where }),
  ]);

  // Transform to domain-safe DTOs
  const usersDto: AdminUser[] = users.map((user) => ({
    userId: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }));

  return {
    users: usersDto,
    total,
    page,
    limit,
  };
}

/**
 * Update user status (enable/disable)
 * 
 * Assumes:
 * - User is authenticated and has ADMIN role
 * 
 * @param userId - User ID to update
 * @param isActive - New active status
 * @returns Updated user
 */
export async function updateUserStatus(
  userId: string,
  isActive: boolean
): Promise<AdminUser> {
  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Update user status
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  // If disabling user, invalidate all sessions
  if (!isActive) {
    await deleteAllUserSessions(userId);
  }

  // Transform to domain-safe DTO
  return {
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    isActive: updatedUser.isActive,
    createdAt: updatedUser.createdAt,
  };
}

/**
 * Get all companies
 * 
 * Assumes:
 * - User is authenticated and has ADMIN role
 * 
 * @returns List of all companies
 */
export async function getCompanies(): Promise<AdminCompany[]> {
  const companies = await db.company.findMany({
    select: {
      id: true,
      name: true,
      isVerified: true,
      ownerId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Transform to domain-safe DTOs
  return companies.map((company) => ({
    companyId: company.id,
    name: company.name,
    isVerified: company.isVerified,
    ownerId: company.ownerId,
    createdAt: company.createdAt,
  }));
}

/**
 * Verify or unverify a company
 * 
 * Assumes:
 * - User is authenticated and has ADMIN role
 * 
 * @param companyId - Company ID to update
 * @param isVerified - New verification status
 * @returns Updated company
 */
export async function verifyCompany(
  companyId: string,
  isVerified: boolean
): Promise<AdminCompany> {
  // Check if company exists
  const existingCompany = await db.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!existingCompany) {
    throw new Error('Company not found');
  }

  // Update company verification status
  const updatedCompany = await db.company.update({
    where: { id: companyId },
    data: { isVerified },
    select: {
      id: true,
      name: true,
      isVerified: true,
      ownerId: true,
      createdAt: true,
    },
  });

  // Transform to domain-safe DTO
  return {
    companyId: updatedCompany.id,
    name: updatedCompany.name,
    isVerified: updatedCompany.isVerified,
    ownerId: updatedCompany.ownerId,
    createdAt: updatedCompany.createdAt,
  };
}

/**
 * Get all jobs with optional filtering
 * 
 * Assumes:
 * - User is authenticated and has ADMIN role
 * 
 * @param params - Filter and pagination parameters
 * @returns Paginated list of jobs with metadata
 */
export async function getJobs(
  params?: JobListParams
): Promise<{
  jobs: AdminJob[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = params?.page || 1;
  const limit = Math.min(params?.limit || 20, 100); // Max 100 per page
  const skip = (page - 1) * limit;

  // Build where clause
  const where: {
    status?: JobStatus;
    jobType?: JobType;
  } = {};

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.jobType) {
    where.jobType = params.jobType;
  }

  // Execute queries in parallel
  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        jobType: true,
        companyId: true,
        createdAt: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    db.job.count({ where }),
  ]);

  // Transform to domain-safe DTOs
  const jobsDto: AdminJob[] = jobs.map((job) => ({
    jobId: job.id,
    title: job.title,
    status: job.status,
    jobType: job.jobType,
    companyId: job.companyId,
    companyName: job.company.name,
    createdAt: job.createdAt,
  }));

  return {
    jobs: jobsDto,
    total,
    page,
    limit,
  };
}

/**
 * Force close a job (admin override)
 * 
 * Assumes:
 * - User is authenticated and has ADMIN role
 * 
 * @param jobId - Job ID to close
 * @returns Updated job
 */
export async function forceCloseJob(jobId: string): Promise<AdminJob> {
  // Check if job exists
  const existingJob = await db.job.findUnique({
    where: { id: jobId },
    select: { id: true },
  });

  if (!existingJob) {
    throw new Error('Job not found');
  }

  // Force close job (admin override)
  const updatedJob = await db.job.update({
    where: { id: jobId },
    data: { status: JobStatus.CLOSED },
    select: {
      id: true,
      title: true,
      status: true,
      jobType: true,
      companyId: true,
      createdAt: true,
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  // Transform to domain-safe DTO
  return {
    jobId: updatedJob.id,
    title: updatedJob.title,
    status: updatedJob.status,
    jobType: updatedJob.jobType,
    companyId: updatedJob.companyId,
    companyName: updatedJob.company.name,
    createdAt: updatedJob.createdAt,
  };
}

