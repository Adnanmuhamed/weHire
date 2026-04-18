'use server';

import { db } from '@/lib/db';
import { JobType, JobStatus, WorkMode } from '@prisma/client';

/**
 * Public Job Server Actions
 *
 * Server-side actions for fetching public job listings.
 * These are accessible without authentication.
 */

export interface PublicJobFilters {
  search?: string;
  location?: string | string[];
  maxExperience?: number;
  workMode?: WorkMode | WorkMode[];
  jobType?: JobType | JobType[];
  degree?: string;
  salaryMin?: number;
  salaryMax?: number | null;
  companyId?: string;
  industryType?: string | string[];
  department?: string | string[];
  qualification?: string | string[];
  languages?: string | string[];
}

export interface PublicJob {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  workMode: WorkMode;
  degree: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  minExperience: number | null;
  maxExperience: number | null;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

export interface GetPublicJobsResult {
  success?: boolean;
  error?: string;
  jobs?: PublicJob[];
}

/**
 * Fetch public job listings with optional filters.
 * Only returns jobs with status OPEN.
 */
export async function getPublicJobs(
  filters: PublicJobFilters = {}
): Promise<GetPublicJobsResult> {
  try {
    const where: Record<string, unknown> = {
      status: JobStatus.OPEN,
    };

    const {
      search,
      location,
      maxExperience: expYears,
      workMode,
      jobType,
      degree,
      salaryMin: userSalaryMin,
      salaryMax: userSalaryMax,
      companyId,
      industryType,
      department,
      qualification,
      languages,
    } = filters;

    // Search: title or description (case-insensitive)
    if (search && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    // Location
    if (location) {
      if (Array.isArray(location) && location.length > 0) {
        where.location = { in: location };
      } else if (typeof location === 'string' && location.trim().length > 0) {
        where.location = {
          contains: location.trim(),
          mode: 'insensitive',
        };
      }
    }

    // Experience: user input X years => X >= minExperience AND (X <= maxExperience OR maxExperience is null)
    if (expYears !== undefined && expYears !== null && !Number.isNaN(expYears)) {
      const xYears = Math.floor(Number(expYears));
      where.AND = where.AND || [];
      (where.AND as unknown[]).push({
        AND: [
          {
            OR: [{ minExperience: { lte: xYears } }, { minExperience: null }],
          },
          {
            OR: [{ maxExperience: { gte: xYears } }, { maxExperience: null }],
          },
        ],
      });
    }

    if (workMode !== undefined) {
      where.workMode = Array.isArray(workMode)
        ? { in: workMode }
        : workMode;
    }
    if (jobType !== undefined) {
      where.jobType = Array.isArray(jobType)
        ? { in: jobType }
        : jobType;
    }
    if (degree && degree.trim().length > 0) {
      where.degree = {
        contains: degree.trim(),
        mode: 'insensitive',
      };
    }
    if (companyId && companyId.trim().length > 0) {
      where.companyId = companyId.trim();
    }

    // Salary range overlap: job [jMin, jMax] overlaps user [uMin, uMax] when
    // jMin <= uMax AND (jMax ?? inf) >= uMin
    const uMin = userSalaryMin ?? 0;
    const uMax = userSalaryMax ?? null;
    if (uMax !== undefined && uMax !== null && !Number.isNaN(uMax)) {
      where.AND = where.AND || [];
      (where.AND as unknown[]).push({
        OR: [
          { salaryMin: { lte: uMax } },
          { salaryMin: null },
        ],
      });
      (where.AND as unknown[]).push({
        OR: [
          { salaryMax: { gte: uMin } },
          { salaryMax: null },
        ],
      });
    } else if (uMin > 0) {
      // only min specified (e.g. 10+ LPA)
      where.AND = where.AND || [];
      (where.AND as unknown[]).push({
        OR: [
          { salaryMin: { gte: uMin } },
          { salaryMax: { gte: uMin } },
        ],
      });
    }

    // Industry filter
    if (industryType) {
      if (Array.isArray(industryType) && industryType.length > 0) {
        where.company = {
          ...((where.company as object) || {}),
          industryType: { in: industryType },
        };
      } else if (typeof industryType === 'string' && industryType.trim().length > 0) {
        where.company = {
          ...((where.company as object) || {}),
          industryType: {
            equals: industryType.trim(),
            mode: 'insensitive',
          },
        };
      }
    }

    // Department filter
    if (department) {
      if (Array.isArray(department) && department.length > 0) {
        where.department = { in: department };
      } else if (typeof department === 'string' && department.trim().length > 0) {
        where.department = {
          equals: department.trim(),
          mode: 'insensitive',
        };
      }
    }

    // Qualification filter
    if (qualification) {
      if (Array.isArray(qualification) && qualification.length > 0) {
        where.qualification = { in: qualification };
      } else if (typeof qualification === 'string' && qualification.trim().length > 0) {
        where.qualification = qualification.trim();
      }
    }

    // Languages Known filter
    if (languages) {
      const langArray = Array.isArray(languages) ? languages : [languages.trim()];
      if (langArray.length > 0 && langArray[0] !== '') {
        where.languagesKnown = { hasSome: langArray };
      }
    }

    const jobs = await db.job.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        jobType: true,
        workMode: true,
        degree: true,
        salaryMin: true,
        salaryMax: true,
        minExperience: true,
        maxExperience: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      jobs: jobs as PublicJob[],
    };
  } catch (error) {
    console.error('Failed to fetch public jobs:', error);
    return {
      error: 'Failed to fetch jobs. Please try again.',
    };
  }
}

export interface JobDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  workMode: WorkMode;
  degree: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  minExperience: number | null;
  maxExperience: number | null;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    website: string | null;
    location: string | null;
  };
}

export interface GetJobByIdResult {
  success?: boolean;
  error?: string;
  job?: JobDetail | null;
}

/**
 * Fetch a single job by ID
 * 
 * Only returns jobs with status OPEN.
 * Returns null if job not found or not open.
 */
export async function getJobById(
  id: string
): Promise<GetJobByIdResult> {
  try {
    const job = await db.job.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        jobType: true,
        workMode: true,
        degree: true,
        salaryMin: true,
        salaryMax: true,
        minExperience: true,
        maxExperience: true,
        createdAt: true,
        status: true,
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            location: true,
          },
        },
      },
    });

    // Return null if job not found or not open
    if (!job || job.status !== JobStatus.OPEN) {
      return {
        success: true,
        job: null,
      };
    }

    // Remove status from result (not needed in public API)
    const { status, ...jobWithoutStatus } = job;

    return {
      success: true,
      job: jobWithoutStatus as JobDetail,
    };
  } catch (error) {
    console.error('Failed to fetch job by ID:', error);
    return {
      error: 'Failed to fetch job. Please try again.',
    };
  }
}
