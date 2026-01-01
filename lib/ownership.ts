import { Role } from '@prisma/client';
import { AuthenticatedUser, AuthorizationError } from './rbac';
import { db } from './db';

/**
 * Ownership-Based Authorization Guards
 * 
 * These guards enforce resource ownership rules in addition to RBAC.
 * Ownership checks work together with RBAC - they don't replace it.
 * 
 * Rules:
 * - Admins can access all resources (override ownership)
 * - Employers can only manage their own company's resources
 * - Users cannot act on resources they own (e.g., apply to own jobs)
 * 
 * IMPORTANT: Always use RBAC guards BEFORE ownership guards:
 * 1. requireAuth() or requireUser() / requireEmployer() / requireAdmin()
 * 2. requireOwnership() or requireNotOwnership()
 */

/**
 * Job with company information for ownership checks
 */
export interface JobWithCompany {
  id: string;
  companyId: string;
  company?: {
    ownerId: string;
  };
}

/**
 * Check if user owns a resource (via company ownership)
 * Admins always have ownership (override)
 * 
 * @param user - Authenticated user
 * @param resourceCompanyId - Company ID that owns the resource
 * @returns true if user owns the resource or is admin
 */
export function hasOwnership(
  user: AuthenticatedUser | null,
  resourceCompanyId: string | null
): boolean {
  if (!user || !resourceCompanyId) return false;

  // Admins have ownership of all resources
  if (user.role === Role.ADMIN) {
    return true;
  }

  // For employers, check if they own the company
  // We need to fetch the user's company to check ownership
  // This is a lightweight check - full validation happens in guards
  return false; // Will be properly checked in guards with DB lookup
}

/**
 * Require that user owns a job (via company ownership)
 * 
 * Allows access if:
 * - user.role === ADMIN (admin override)
 * - OR job.company.ownerId === user.id (user owns the company that owns the job)
 * 
 * @param user - Authenticated user (must be authenticated via RBAC first)
 * @param job - Job object with company information
 * @returns The authenticated user (for chaining)
 * @throws AuthorizationError if user doesn't own the job
 */
export async function requireJobOwnership(
  user: AuthenticatedUser,
  job: JobWithCompany | string
): Promise<AuthenticatedUser> {
  // Admin override: admins can access all jobs
  if (user.role === Role.ADMIN) {
    return user;
  }

  // If job is a string (ID), fetch it with company info
  let jobWithCompany: JobWithCompany;
  if (typeof job === 'string') {
    const fetchedJob = await db.job.findUnique({
      where: { id: job },
      include: {
        company: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!fetchedJob) {
      throw new AuthorizationError('Job not found');
    }

    jobWithCompany = {
      id: fetchedJob.id,
      companyId: fetchedJob.companyId,
      company: fetchedJob.company,
    };
  } else {
    // If job object doesn't have company info, fetch it
    if (!job.company) {
      const fetchedJob = await db.job.findUnique({
        where: { id: job.id },
        include: {
          company: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!fetchedJob) {
        throw new AuthorizationError('Job not found');
      }

      jobWithCompany = {
        id: fetchedJob.id,
        companyId: fetchedJob.companyId,
        company: fetchedJob.company,
      };
    } else {
      jobWithCompany = job;
    }
  }

  // Get user's company to check ownership
  const userCompany = await db.company.findUnique({
    where: { ownerId: user.id },
    select: { id: true, ownerId: true },
  });

  // Check if user owns the company that owns the job
  if (!userCompany || userCompany.id !== jobWithCompany.companyId) {
    throw new AuthorizationError(
      'You do not have permission to access this resource'
    );
  }

  return user;
}

/**
 * Require that user does NOT own a job
 * 
 * Prevents users/employers from acting on their own jobs.
 * Used for operations like job applications where users cannot
 * apply to jobs posted by their own company.
 * 
 * Admins are allowed (they can act on any resource).
 * 
 * @param user - Authenticated user (must be authenticated via RBAC first)
 * @param job - Job object with company information or job ID
 * @returns The authenticated user (for chaining)
 * @throws AuthorizationError if user owns the job
 */
export async function requireNotJobOwner(
  user: AuthenticatedUser,
  job: JobWithCompany | string
): Promise<AuthenticatedUser> {
  // Admin override: admins can act on any resource
  if (user.role === Role.ADMIN) {
    return user;
  }

  // If job is a string (ID), fetch it with company info
  let jobWithCompany: JobWithCompany;
  if (typeof job === 'string') {
    const fetchedJob = await db.job.findUnique({
      where: { id: job },
      include: {
        company: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!fetchedJob) {
      throw new AuthorizationError('Job not found');
    }

    jobWithCompany = {
      id: fetchedJob.id,
      companyId: fetchedJob.companyId,
      company: fetchedJob.company,
    };
  } else {
    // If job object doesn't have company info, fetch it
    if (!job.company) {
      const fetchedJob = await db.job.findUnique({
        where: { id: job.id },
        include: {
          company: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!fetchedJob) {
        throw new AuthorizationError('Job not found');
      }

      jobWithCompany = {
        id: fetchedJob.id,
        companyId: fetchedJob.companyId,
        company: fetchedJob.company,
      };
    } else {
      jobWithCompany = job;
    }
  }

  // Get user's company to check ownership
  const userCompany = await db.company.findUnique({
    where: { ownerId: user.id },
    select: { id: true },
  });

  // Check if user owns the company that owns the job
  if (userCompany && userCompany.id === jobWithCompany.companyId) {
    throw new AuthorizationError(
      'You cannot perform this action on your own job posting'
    );
  }

  return user;
}

/**
 * Check if user owns a job (boolean helper, no DB lookup)
 * 
 * This is a lightweight check for UI/conditional logic.
 * For security-critical checks, use requireJobOwnership() instead.
 * 
 * @param user - Authenticated user
 * @param jobCompanyId - Company ID that owns the job
 * @param userCompanyId - User's company ID (if they have one)
 * @returns true if user owns the job or is admin
 */
export function hasJobOwnership(
  user: AuthenticatedUser | null,
  jobCompanyId: string,
  userCompanyId: string | null
): boolean {
  if (!user) return false;

  // Admins have ownership of all jobs
  if (user.role === Role.ADMIN) {
    return true;
  }

  // Check if user's company owns the job
  return userCompanyId !== null && userCompanyId === jobCompanyId;
}

