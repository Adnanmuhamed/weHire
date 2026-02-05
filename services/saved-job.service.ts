import { db } from '@/lib/db';
import { AuthenticatedUser } from '@/lib/rbac';

/**
 * Saved Job Service
 * 
 * Business logic layer for saved job operations.
 * Assumes RBAC checks have already been performed.
 */

/**
 * Toggle saved job status for a user
 * 
 * If the job is saved, unsave it. If not saved, save it.
 * 
 * @param user - Authenticated user
 * @param jobId - Job ID to toggle
 * @returns true if job is now saved, false if unsaved
 */
export async function toggleSavedJob(
  user: AuthenticatedUser,
  jobId: string
): Promise<boolean> {
  // Check if job exists
  const job = await db.job.findUnique({
    where: { id: jobId },
    select: { id: true },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  // Check if already saved
  const existingSavedJob = await db.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId: user.id,
        jobId,
      },
    },
  });

  if (existingSavedJob) {
    // Unsave the job
    await db.savedJob.delete({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId,
        },
      },
    });
    return false;
  } else {
    // Save the job
    await db.savedJob.create({
      data: {
        userId: user.id,
        jobId,
      },
    });
    return true;
  }
}

/**
 * Get all saved job IDs for a user
 * 
 * @param userId - User ID
 * @returns Array of job IDs that the user has saved
 */
export async function getSavedJobIds(userId: string): Promise<string[]> {
  const savedJobs = await db.savedJob.findMany({
    where: { userId },
    select: { jobId: true },
  });

  return savedJobs.map((sj) => sj.jobId);
}

/**
 * Check if a job is saved by a user
 * 
 * @param userId - User ID
 * @param jobId - Job ID
 * @returns true if job is saved, false otherwise
 */
export async function isJobSaved(userId: string, jobId: string): Promise<boolean> {
  const savedJob = await db.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  return !!savedJob;
}

