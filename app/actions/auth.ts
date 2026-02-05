'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createSession } from '@/lib/session';
import { setSessionCookie } from '@/lib/cookies';
import {
  JobSeekerSignUpSchema,
  JobSeekerSignUpInput,
} from '@/lib/validators';
import { Role, WorkStatus } from '@prisma/client';

export interface RegisterUserResult {
  success?: boolean;
  error?: string;
}

export async function registerUser(
  input: JobSeekerSignUpInput
): Promise<RegisterUserResult> {
  const parsed = JobSeekerSignUpSchema.safeParse(input);

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
    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        role: Role.USER, // Job seeker / candidate role
        mobileNumber: data.mobileNumber,
        workStatus: data.workStatus as WorkStatus,
        profile: {
          create: {
            fullName: data.fullName,
            experience: 0,
            skills: [],
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    return { success: true };
  } catch (error) {
    console.error('Failed to register user:', error);
    return {
      error:
        'Something went wrong while creating your account. Please try again.',
    };
  }
}

