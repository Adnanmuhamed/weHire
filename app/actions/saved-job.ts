'use server';

/**
 * Saved Job Server Actions
 * 
 * Server-side actions for toggling saved job status.
 * Includes validation and revalidation for immediate UI updates.
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { requireUser } from '@/lib/rbac';
import { toggleSavedJob } from '@/services/saved-job.service';

export interface ToggleSavedJobResult {
  success?: boolean;
  isSaved?: boolean;
  error?: string;
}

/**
 * Toggle saved job status
 * 
 * Validates user is authenticated and toggles the saved status.
 */
export async function toggleSavedJobAction(
  jobId: string
): Promise<ToggleSavedJobResult> {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify user is a Seeker (Role.USER)
    const authenticatedUser = requireUser(user);

    // Toggle saved job status
    const isSaved = await toggleSavedJob(authenticatedUser, jobId);

    // Revalidate paths to ensure UI updates immediately
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${jobId}`);

    return { success: true, isSaved };
  } catch (error) {
    console.error('Failed to toggle saved job:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return { error: 'Job not found.' };
      }
      return { error: error.message || 'Failed to toggle saved job. Please try again.' };
    }

    return { error: 'Failed to toggle saved job. Please try again.' };
  }
}

