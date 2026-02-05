import { db } from '@/lib/db';
import { JobType, JobStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '@/lib/rbac';

/**
 * Job Service
 * 
 * Business logic layer for job operations.
 * Assumes RBAC and ownership checks have already been performed.
 * Focuses on data validation, database operations, and domain logic.
 */

export interface CreateJobInput {
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  status?: JobStatus;
  salaryMin?: number;
  salaryMax?: number;
  experience?: number;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  location?: string;
  jobType?: JobType;
  status?: JobStatus;
  salaryMin?: number;
  salaryMax?: number;
  experience?: number;
}

export interface JobFilters {
  status?: JobStatus;
  jobType?: JobType;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  maxExperience?: number;
  companyId?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface JobWithCompany {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  status: JobStatus;
  salaryMin: number | null;
  salaryMax: number | null;
  experience: number | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  company: {
    id: string;
    name: string;
    location: string | null;
    website: string | null;
  };
}

/**
 * Validate job title
 */
function validateTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new Error('Job title is required');
  }
  if (title.trim().length < 3) {
    throw new Error('Job title must be at least 3 characters long');
  }
  if (title.length > 200) {
    throw new Error('Job title must not exceed 200 characters');
  }
}

/**
 * Validate job description
 */
function validateDescription(description: string): void {
  if (!description || description.trim().length === 0) {
    throw new Error('Job description is required');
  }
  if (description.trim().length < 50) {
    throw new Error('Job description must be at least 50 characters long');
  }
  if (description.length > 10000) {
    throw new Error('Job description must not exceed 10000 characters');
  }
}

/**
 * Validate location
 */
function validateLocation(location: string): void {
  if (!location || location.trim().length === 0) {
    throw new Error('Job location is required');
  }
  if (location.length > 200) {
    throw new Error('Job location must not exceed 200 characters');
  }
}

/**
 * Validate salary range
 */
function validateSalaryRange(salaryMin?: number, salaryMax?: number): void {
  if (salaryMin !== undefined && salaryMin !== null) {
    if (salaryMin < 0) {
      throw new Error('Minimum salary cannot be negative');
    }
    if (salaryMin > 10000000) {
      throw new Error('Minimum salary exceeds maximum allowed value');
    }
  }

  if (salaryMax !== undefined && salaryMax !== null) {
    if (salaryMax < 0) {
      throw new Error('Maximum salary cannot be negative');
    }
    if (salaryMax > 10000000) {
      throw new Error('Maximum salary exceeds maximum allowed value');
    }
  }

  if (
    salaryMin !== undefined &&
    salaryMin !== null &&
    salaryMax !== undefined &&
    salaryMax !== null &&
    salaryMin > salaryMax
  ) {
    throw new Error('Minimum salary cannot be greater than maximum salary');
  }
}

/**
 * Validate job type enum
 */
function validateJobType(jobType: JobType): void {
  if (!Object.values(JobType).includes(jobType)) {
    throw new Error('Invalid job type');
  }
}

/**
 * Validate job status enum
 */
function validateJobStatus(status: JobStatus): void {
  if (!Object.values(JobStatus).includes(status)) {
    throw new Error('Invalid job status');
  }
}

/**
 * Create a new job posting
 * 
 * Assumes:
 * - User is authenticated and has EMPLOYER or ADMIN role
 * - User has a company profile
 * 
 * @param user - Authenticated user (must be employer)
 * @param data - Job creation data
 * @returns Created job with company information
 */
export async function createJob(
  user: AuthenticatedUser,
  data: CreateJobInput
): Promise<JobWithCompany> {
  // Validate input
  validateTitle(data.title);
  validateDescription(data.description);
  validateLocation(data.location);
  validateJobType(data.jobType);
  validateSalaryRange(data.salaryMin, data.salaryMax);

  if (data.status) {
    validateJobStatus(data.status);
  }

  // Get user's company
  const company = await db.company.findUnique({
    where: { ownerId: user.id },
    select: { id: true },
  });

  if (!company) {
    throw new Error('Company profile not found. Please create a company profile first.');
  }

  // Create job
  const job = await db.job.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      jobType: data.jobType,
      status: data.status || JobStatus.DRAFT,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      experience: data.experience ?? null,
      companyId: company.id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          location: true,
          website: true,
        },
      },
    },
  });

  return job;
}

/**
 * Get public jobs with optional filtering and pagination
 * 
 * This is a public endpoint - no authentication required.
 * Only returns jobs with OPEN status by default.
 * 
 * @param filters - Optional filters for jobs
 * @param pagination - Optional pagination parameters
 * @returns List of jobs with company information
 */
export async function getPublicJobs(
  filters?: JobFilters,
  pagination?: PaginationParams
): Promise<{ jobs: JobWithCompany[]; total: number; page: number; limit: number }> {
  const page = pagination?.page || 1;
  const limit = Math.min(pagination?.limit || 20, 100); // Max 100 per page
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.JobWhereInput = {
    // Default to OPEN status if not specified
    status: filters?.status || JobStatus.OPEN,
  };

  if (filters?.jobType) {
    where.jobType = filters.jobType;
  }

  if (filters?.location) {
    where.location = {
      contains: filters.location,
      mode: 'insensitive',
    };
  }

  if (filters?.companyId) {
    where.companyId = filters.companyId;
  }

  // Salary range filtering
  // A job matches if its salary range overlaps with the requested range
  if (filters?.minSalary !== undefined || filters?.maxSalary !== undefined) {
    const salaryConditions: Prisma.JobWhereInput[] = [];

    if (filters.minSalary !== undefined) {
      // Job's max salary must be >= requested min (or null, meaning no upper limit)
      salaryConditions.push({
        OR: [
          { salaryMax: { gte: filters.minSalary } },
          { salaryMax: null },
        ],
      });
    }

    if (filters.maxSalary !== undefined) {
      // Job's min salary must be <= requested max (or null, meaning no lower limit)
      salaryConditions.push({
        OR: [
          { salaryMin: { lte: filters.maxSalary } },
          { salaryMin: null },
        ],
      });
    }

    // Combine conditions with AND
    if (salaryConditions.length > 0) {
      const existingAnd = where.AND 
        ? (Array.isArray(where.AND) ? where.AND : [where.AND])
        : [];
      where.AND = [...existingAnd, ...salaryConditions];
    }
  }

  // Experience filtering
  // Jobs where experience <= maxExperience (or null, meaning no requirement)
  if (filters?.maxExperience !== undefined) {
    const existingAnd = where.AND 
      ? (Array.isArray(where.AND) ? where.AND : [where.AND])
      : [];
    where.AND = [
      ...existingAnd,
      {
        OR: [
          { experience: { lte: filters.maxExperience } },
          { experience: null },
        ],
      },
    ];
  }

  // Get jobs and total count
  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            location: true,
            website: true,
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

  return {
    jobs,
    total,
    page,
    limit,
  };
}

/**
 * Get a single job by ID
 * 
 * This is a public endpoint - no authentication required.
 * Returns job regardless of status (caller can filter if needed).
 * 
 * @param jobId - Job ID
 * @returns Job with company information, or null if not found
 */
export async function getJobById(jobId: string): Promise<JobWithCompany | null> {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          location: true,
          website: true,
        },
      },
    },
  });

  return job;
}

/**
 * Update a job posting
 * 
 * Assumes:
 * - User is authenticated and has EMPLOYER or ADMIN role
 * - Ownership check has been performed (user owns the job or is admin)
 * 
 * @param user - Authenticated user
 * @param jobId - Job ID to update
 * @param data - Partial job data to update
 * @returns Updated job with company information
 */
export async function updateJob(
  user: AuthenticatedUser,
  jobId: string,
  data: UpdateJobInput
): Promise<JobWithCompany> {
  // Check if job exists
  const existingJob = await db.job.findUnique({
    where: { id: jobId },
    select: { id: true },
  });

  if (!existingJob) {
    throw new Error('Job not found');
  }

  // Validate provided fields
  if (data.title !== undefined) {
    validateTitle(data.title);
  }

  if (data.description !== undefined) {
    validateDescription(data.description);
  }

  if (data.location !== undefined) {
    validateLocation(data.location);
  }

  if (data.jobType !== undefined) {
    validateJobType(data.jobType);
  }

  if (data.status !== undefined) {
    validateJobStatus(data.status);
  }

  // Validate salary range if either is provided
  if (data.salaryMin !== undefined || data.salaryMax !== undefined) {
    // Get existing values if not provided
    const currentJob = await db.job.findUnique({
      where: { id: jobId },
      select: { salaryMin: true, salaryMax: true },
    });

    validateSalaryRange(
      data.salaryMin !== undefined ? data.salaryMin : currentJob?.salaryMin ?? undefined,
      data.salaryMax !== undefined ? data.salaryMax : currentJob?.salaryMax ?? undefined
    );
  }

  // Build update data
  const updateData: Prisma.JobUpdateInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title.trim();
  }

  if (data.description !== undefined) {
    updateData.description = data.description.trim();
  }

  if (data.location !== undefined) {
    updateData.location = data.location.trim();
  }

  if (data.jobType !== undefined) {
    updateData.jobType = data.jobType;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.salaryMin !== undefined) {
    updateData.salaryMin = data.salaryMin ?? null;
  }

  if (data.salaryMax !== undefined) {
    updateData.salaryMax = data.salaryMax ?? null;
  }

  if (data.experience !== undefined) {
    updateData.experience = data.experience ?? null;
  }

  // Update job
  const updatedJob = await db.job.update({
    where: { id: jobId },
    data: updateData,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          location: true,
          website: true,
        },
      },
    },
  });

  return updatedJob;
}

/**
 * Delete a job posting
 * 
 * Assumes:
 * - User is authenticated and has EMPLOYER or ADMIN role
 * - Ownership check has been performed (user owns the job or is admin)
 * 
 * Note: This is a destructive operation. Applications will be
 * cascade deleted due to foreign key constraints.
 * 
 * @param user - Authenticated user
 * @param jobId - Job ID to delete
 */
export async function deleteJob(user: AuthenticatedUser, jobId: string): Promise<void> {
  // Check if job exists
  const existingJob = await db.job.findUnique({
    where: { id: jobId },
    select: { id: true },
  });

  if (!existingJob) {
    throw new Error('Job not found');
  }

  // Delete job (cascade will handle applications)
  await db.job.delete({
    where: { id: jobId },
  });
}

