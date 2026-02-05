import { db } from '@/lib/db';
import { JobType, JobStatus, Prisma } from '@prisma/client';

/**
 * Job Search Service
 * 
 * Provides scalable job search and filtering functionality.
 * Only returns OPEN jobs (public search).
 * Uses efficient Prisma queries with proper indexing.
 */

export interface JobSearchFilters {
  query?: string; // Text search on title and description
  location?: string;
  jobType?: JobType;
  minSalary?: number;
  maxSalary?: number;
  experience?: number; // Max experience filter (jobs where experience <= this value)
}

export type JobSortOption = 'newest' | 'salary_high' | 'salary_low';

export interface JobSearchParams {
  filters?: JobSearchFilters;
  sort?: JobSortOption;
  page?: number;
  limit?: number;
  userId?: string; // For checking saved status and filtering saved jobs
  savedOnly?: boolean; // Filter to only show saved jobs
}

export interface JobSearchResult {
  jobId: string;
  title: string;
  location: string;
  jobType: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  companyName: string;
  createdAt: Date;
  isSaved?: boolean; // Whether the job is saved by the current user
}

export interface JobSearchResponse {
  jobs: JobSearchResult[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Build Prisma where clause for job search
 */
function buildWhereClause(
  filters?: JobSearchFilters,
  userId?: string,
  savedOnly?: boolean
): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = {
    // Only return OPEN jobs for public search
    status: JobStatus.OPEN,
  };

  // Filter by saved jobs if requested
  if (savedOnly && userId) {
    where.savedJobs = {
      some: {
        userId,
      },
    };
  }

  // Text search on title and description (case-insensitive)
  if (filters?.query && filters.query.trim().length > 0) {
    const searchTerm = filters.query.trim();
    where.OR = [
      {
        title: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Location filter (case-insensitive partial match)
  if (filters?.location && filters.location.trim().length > 0) {
    where.location = {
      contains: filters.location.trim(),
      mode: 'insensitive',
    };
  }

  // Job type filter (exact match)
  if (filters?.jobType) {
    where.jobType = filters.jobType;
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

    // Combine salary conditions with AND
    if (salaryConditions.length > 0) {
      const existingAnd = where.AND
        ? Array.isArray(where.AND)
          ? where.AND
          : [where.AND]
        : [];
      where.AND = [...existingAnd, ...salaryConditions];
    }
  }

  // Experience filtering
  // Jobs where experience <= maxExperience (or null, meaning no requirement)
  if (filters?.experience !== undefined) {
    const existingAnd = where.AND
      ? Array.isArray(where.AND)
        ? where.AND
        : [where.AND]
      : [];
    where.AND = [
      ...existingAnd,
      {
        OR: [
          { experience: { lte: filters.experience } },
          { experience: null },
        ],
      },
    ];
  }

  return where;
}

/**
 * Build Prisma orderBy clause for sorting
 */
function buildOrderBy(
  sort?: JobSortOption
): Prisma.JobOrderByWithRelationInput | Prisma.JobOrderByWithRelationInput[] {
  switch (sort) {
    case 'salary_high':
      return [
        { salaryMax: 'desc' },
        { salaryMin: 'desc' },
        { createdAt: 'desc' },
      ];
    case 'salary_low':
      return [
        { salaryMin: 'asc' },
        { salaryMax: 'asc' },
        { createdAt: 'desc' },
      ];
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

/**
 * Search jobs with filtering, sorting, and pagination
 * 
 * Only returns jobs with status = OPEN (public search).
 * 
 * @param params - Search parameters (filters, sort, pagination)
 * @returns Paginated job search results with domain-safe DTOs
 */
export async function searchJobs(
  params?: JobSearchParams
): Promise<JobSearchResponse> {
  // Default pagination values
  const page = Math.max(1, params?.page || 1);
  const limit = Math.min(Math.max(1, params?.limit || 20), 50); // Max 50 per page
  const skip = (page - 1) * limit;

  // Build where clause
  const where = buildWhereClause(params?.filters, params?.userId, params?.savedOnly);

  // Build orderBy clause
  const orderBy = buildOrderBy(params?.sort);

  // Get saved job IDs if user is logged in
  let savedJobIds: string[] = [];
  if (params?.userId) {
    const savedJobs = await db.savedJob.findMany({
      where: { userId: params.userId },
      select: { jobId: true },
    });
    savedJobIds = savedJobs.map((sj) => sj.jobId);
  }

  // Execute queries in parallel for efficiency
  const [jobs, totalCount] = await Promise.all([
    // Get jobs with company information (single query, no N+1)
    db.job.findMany({
      where,
      select: {
        id: true,
        title: true,
        location: true,
        jobType: true,
        salaryMin: true,
        salaryMax: true,
        createdAt: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    // Get total count for pagination
    db.job.count({ where }),
  ]);

  // Transform to domain-safe DTOs
  const jobsDto: JobSearchResult[] = jobs.map((job) => ({
    jobId: job.id,
    title: job.title,
    location: job.location,
    jobType: job.jobType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    companyName: job.company.name,
    createdAt: job.createdAt,
    isSaved: params?.userId ? savedJobIds.includes(job.id) : undefined,
  }));

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    jobs: jobsDto,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage,
      hasPreviousPage,
    },
  };
}

