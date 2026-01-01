import { JobType } from '@prisma/client';
import { JobSortOption } from '@/services/job-search.service';

/**
 * Job Search Validation Utilities
 * 
 * Validates search parameters for job search endpoints.
 * Ensures type safety and prevents invalid combinations.
 */

export interface ValidatedSearchParams {
  query?: string;
  location?: string;
  jobType?: JobType;
  minSalary?: number;
  maxSalary?: number;
  sort?: JobSortOption;
  page: number;
  limit: number;
}

export interface ValidationResult {
  valid: boolean;
  params?: ValidatedSearchParams;
  error?: string;
}

/**
 * Validate and parse job search parameters
 */
export function validateJobSearchParams(
  searchParams: URLSearchParams
): ValidationResult {
  const params: Partial<ValidatedSearchParams> = {};

  // Validate query (text search)
  const query = searchParams.get('query');
  if (query !== null) {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      if (trimmed.length > 200) {
        return {
          valid: false,
          error: 'Search query must not exceed 200 characters',
        };
      }
      params.query = trimmed;
    }
  }

  // Validate location
  const location = searchParams.get('location');
  if (location !== null) {
    const trimmed = location.trim();
    if (trimmed.length > 0) {
      if (trimmed.length > 200) {
        return {
          valid: false,
          error: 'Location must not exceed 200 characters',
        };
      }
      params.location = trimmed;
    }
  }

  // Validate jobType enum
  const jobTypeParam = searchParams.get('jobType');
  if (jobTypeParam !== null) {
    if (!Object.values(JobType).includes(jobTypeParam as JobType)) {
      return {
        valid: false,
        error: `Invalid jobType. Must be one of: ${Object.values(JobType).join(', ')}`,
      };
    }
    params.jobType = jobTypeParam as JobType;
  }

  // Validate minSalary
  const minSalaryParam = searchParams.get('minSalary');
  if (minSalaryParam !== null) {
    const minSalary = parseInt(minSalaryParam, 10);
    if (isNaN(minSalary) || minSalary < 0) {
      return {
        valid: false,
        error: 'minSalary must be a non-negative integer',
      };
    }
    if (minSalary > 10000000) {
      return {
        valid: false,
        error: 'minSalary exceeds maximum allowed value',
      };
    }
    params.minSalary = minSalary;
  }

  // Validate maxSalary
  const maxSalaryParam = searchParams.get('maxSalary');
  if (maxSalaryParam !== null) {
    const maxSalary = parseInt(maxSalaryParam, 10);
    if (isNaN(maxSalary) || maxSalary < 0) {
      return {
        valid: false,
        error: 'maxSalary must be a non-negative integer',
      };
    }
    if (maxSalary > 10000000) {
      return {
        valid: false,
        error: 'maxSalary exceeds maximum allowed value',
      };
    }
    params.maxSalary = maxSalary;
  }

  // Validate salary range combination
  if (params.minSalary !== undefined && params.maxSalary !== undefined) {
    if (params.minSalary > params.maxSalary) {
      return {
        valid: false,
        error: 'minSalary cannot be greater than maxSalary',
      };
    }
  }

  // Validate sort option
  const sortParam = searchParams.get('sort');
  if (sortParam !== null) {
    const validSorts: JobSortOption[] = ['newest', 'salary_high', 'salary_low'];
    if (!validSorts.includes(sortParam as JobSortOption)) {
      return {
        valid: false,
        error: `Invalid sort option. Must be one of: ${validSorts.join(', ')}`,
      };
    }
    params.sort = sortParam as JobSortOption;
  }

  // Validate pagination
  const pageParam = searchParams.get('page');
  if (pageParam !== null) {
    const page = parseInt(pageParam, 10);
    if (isNaN(page) || page < 1) {
      return {
        valid: false,
        error: 'page must be a positive integer',
      };
    }
    params.page = page;
  } else {
    params.page = 1; // Default
  }

  const limitParam = searchParams.get('limit');
  if (limitParam !== null) {
    const limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return {
        valid: false,
        error: 'limit must be between 1 and 50',
      };
    }
    params.limit = limit;
  } else {
    params.limit = 20; // Default
  }

  return {
    valid: true,
    params: params as ValidatedSearchParams,
  };
}

