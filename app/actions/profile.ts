'use server';

/**
 * Profile Server Actions
 * 
 * Server-side actions for updating user profiles.
 * Includes validation and revalidation for immediate UI updates.
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export interface UpdateProfileInput {
  userId: string;
  fullName: string;
  headline: string | null;
  bio: string | null;
  skills: string[];
  experience: number;
  resumeUrl: string | null;
  avatarUrl: string | null;
  college: string | null;
  degree: string | null;
  currentCompany: string | null;
  location: string | null;
  mobile: string;
}

export interface UpdateProfileResult {
  success?: boolean;
  error?: string;
}

/**
 * Validate profile input
 */
function validateProfileInput(input: UpdateProfileInput): string | null {
  if (!input.fullName || input.fullName.trim().length === 0) {
    return 'Full name is required';
  }
  if (input.fullName.trim().length < 2) {
    return 'Full name must be at least 2 characters long';
  }
  if (input.fullName.length > 200) {
    return 'Full name must not exceed 200 characters';
  }

  if (input.headline && input.headline.length > 200) {
    return 'Headline must not exceed 200 characters';
  }

  if (input.bio && input.bio.length > 5000) {
    return 'Bio must not exceed 5000 characters';
  }

  if (input.experience < 0 || input.experience > 50) {
    return 'Experience must be between 0 and 50 years';
  }

  if (input.skills.length > 50) {
    return 'Maximum 50 skills allowed';
  }

  // Validate mobile number (required)
  if (!input.mobile || input.mobile.trim().length === 0) {
    return 'Mobile number is required';
  }

  // Validate mobile number format (basic validation)
  const mobileRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  if (!mobileRegex.test(input.mobile.trim())) {
    return 'Invalid mobile number format';
  }

  // Validate URLs if provided (only validate non-empty strings)
  if (input.avatarUrl) {
    const trimmed = input.avatarUrl.trim();
    if (trimmed.length > 0 && !isValidUrl(trimmed)) {
      return 'Avatar URL must be a valid URL';
    }
  }

  if (input.resumeUrl) {
    const trimmed = input.resumeUrl.trim();
    if (trimmed.length > 0 && !isValidUrl(trimmed)) {
      return 'Resume URL must be a valid URL';
    }
  }

  return null;
}

/**
 * Simple URL validation
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Update user profile
 * 
 * Creates profile if it doesn't exist, updates if it does.
 * Revalidates paths to ensure UI updates immediately.
 */
export async function updateProfile(
  input: UpdateProfileInput
): Promise<UpdateProfileResult> {
  try {
    // Validate input
    const validationError = validateProfileInput(input);
    if (validationError) {
      return { error: validationError };
    }

    // Verify user is authenticated and matches the userId
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    if (user.id !== input.userId) {
      return { error: 'Unauthorized' };
    }

    // Upsert profile (create if doesn't exist, update if it does)
    await db.profile.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        fullName: input.fullName.trim(),
        headline: input.headline?.trim() || null,
        bio: input.bio?.trim() || null,
        skills: input.skills,
        experience: input.experience,
        resumeUrl: input.resumeUrl?.trim() || null,
        avatarUrl: input.avatarUrl?.trim() || null,
        college: input.college?.trim() || null,
        degree: input.degree?.trim() || null,
        currentCompany: input.currentCompany?.trim() || null,
        location: input.location?.trim() || null,
        mobile: input.mobile.trim(),
      },
      update: {
        fullName: input.fullName.trim(),
        headline: input.headline?.trim() || null,
        bio: input.bio?.trim() || null,
        skills: input.skills,
        experience: input.experience,
        resumeUrl: input.resumeUrl?.trim() || null,
        avatarUrl: input.avatarUrl?.trim() || null,
        college: input.college?.trim() || null,
        degree: input.degree?.trim() || null,
        currentCompany: input.currentCompany?.trim() || null,
        location: input.location?.trim() || null,
        mobile: input.mobile.trim(),
      },
    });

    // Revalidate paths to ensure sidebar and navbar update
    revalidatePath('/profile');
    revalidatePath('/');
    revalidatePath('/jobs');

    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile. Please try again.' };
  }
}

