'use server';

/**
 * Application Server Actions
 * 
 * Server-side actions for submitting job applications.
 * Includes validation and revalidation for immediate UI updates.
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { requireUser } from '@/lib/rbac';
import { applyToJob } from '@/services/application.service';

export interface SubmitApplicationInput {
  jobId: string;
  coverNote: string | null;
}

export interface SubmitApplicationResult {
  success?: boolean;
  error?: string;
}

/**
 * Submit a job application
 * 
 * Validates user is a Seeker, checks for duplicate applications,
 * and creates the Application record.
 */
export async function submitApplication(
  input: SubmitApplicationInput
): Promise<SubmitApplicationResult> {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify user is a Seeker (Role.USER)
    const authenticatedUser = requireUser(user);

    // Call service to apply to job
    // Service will:
    // - Check if job exists and is OPEN
    // - Check if user already applied (enforced by unique constraint)
    // - Create the application
    await applyToJob(authenticatedUser, input.jobId, input.coverNote);

    // Revalidate paths to ensure UI updates immediately
    revalidatePath(`/jobs/${input.jobId}`);
    revalidatePath('/applications');

    return { success: true };
  } catch (error) {
    console.error('Failed to submit application:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('already applied')) {
        return { error: 'You have already applied to this job.' };
      }
      if (error.message.includes('not found')) {
        return { error: 'Job not found or no longer accepting applications.' };
      }
      if (error.message.includes('not currently accepting')) {
        return { error: 'This job is not currently accepting applications.' };
      }
      return { error: error.message || 'Failed to submit application. Please try again.' };
    }

    return { error: 'Failed to submit application. Please try again.' };
  }
}

