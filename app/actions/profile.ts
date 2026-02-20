'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProfileFormSchema } from '@/lib/validators';
import type { ProfileFormInput } from '@/lib/validators';

export type { ProfileFormInput } from '@/lib/validators';

export interface UpdateProfileResult {
  success?: boolean;
  error?: string;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Update candidate profile.
 * Auth: logged-in user. Validates with Zod, updates Profile and optionally User.mobileNumber.
 */
export async function updateProfile(
  data: ProfileFormInput
): Promise<UpdateProfileResult> {
  try {
    const parsed = ProfileFormSchema.safeParse(data);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return { error: first?.message ?? 'Invalid profile data' };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const {
      fullName,
      headline,
      bio,
      skills,
      experience,
      resumeUrl,
      location,
      mobile,
    } = parsed.data;

    const resumeTrimmed = resumeUrl?.trim();
    if (resumeTrimmed && !isValidUrl(resumeTrimmed)) {
      return { error: 'Resume must be a valid URL' };
    }

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await db.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          fullName: fullName.trim(),
          headline: headline?.trim() || null,
          bio: (bio?.trim() ?? '').slice(0, 500) || null,
          skills: skillsArray,
          experience,
          resumeUrl: resumeTrimmed || null,
          location: location?.trim() || null,
          mobile: mobile?.trim() || null,
        },
        update: {
          fullName: fullName.trim(),
          headline: headline?.trim() || null,
          bio: (bio?.trim() ?? '').slice(0, 500) || null,
          skills: skillsArray,
          experience,
          resumeUrl: resumeTrimmed || null,
          location: location?.trim() || null,
          mobile: mobile?.trim() || null,
        },
      });

      if (mobile != null && mobile.trim() !== '') {
        await tx.user.update({
          where: { id: user.id },
          // Sync mobile to User; schema has User.mobileNumber
          data: { mobileNumber: mobile.trim() } as Parameters<typeof tx.user.update>[0]['data'],
        });
      }
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath('/jobs');
    revalidatePath('/applications');

    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile. Please try again.' };
  }
}
