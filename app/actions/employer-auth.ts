'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createSession } from '@/lib/session';
import { setSessionCookie } from '@/lib/cookies';
import {
  RecruiterSignUpSchema,
  RecruiterSignUpInput,
} from '@/lib/validators';
import { Role } from '@prisma/client';

export interface RegisterRecruiterResult {
  success?: boolean;
  error?: string;
}

export async function registerRecruiter(
  input: RecruiterSignUpInput
): Promise<RegisterRecruiterResult> {
  const parsed = RecruiterSignUpSchema.safeParse(input);

  if (!parsed.success) {
    const firstError =
      parsed.error.errors[0]?.message || 'Invalid signup data';
    return { error: firstError };
  }

  const data = parsed.data;

  const existingUser = await db.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    return { error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(data.password);

  try {
    const user = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          role: Role.EMPLOYER,
          mobileNumber: data.mobileNumber,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      await tx.profile.create({
        data: {
          userId: createdUser.id,
          fullName: data.fullName,
          experience: 0,
          skills: [],
          mobile: data.mobileNumber ?? undefined,
          email: data.email.toLowerCase(),
        },
      });

      await tx.company.create({
        data: {
          name: data.companyName,
          description: '',
          ownerId: createdUser.id,
        },
      });

      return createdUser;
    });

    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    return { success: true };
  } catch (error) {
    console.error('Failed to register recruiter:', error);
    return {
      error:
        'Something went wrong while creating your recruiter account. Please try again.',
    };
  }
}

