'use server';

import { db } from '@/lib/db';
import { hashPassword, comparePassword } from '@/lib/password';
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
            mobile: data.mobileNumber ?? undefined,
            email: data.email.toLowerCase(),
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

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserResult {
  success?: boolean;
  error?: string;
  role?: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
}

export async function loginUser(
  input: LoginUserInput
): Promise<LoginUserResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  if (!user.isActive) {
    return { error: 'Your account is deactivated.' };
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);

  if (!isValidPassword) {
    return { error: 'Invalid email or password.' };
  }

  const sessionToken = await createSession(user.id);
  await setSessionCookie(sessionToken);

  let role: LoginUserResult['role'] = 'CANDIDATE';
  if (user.role === Role.EMPLOYER) {
    role = 'RECRUITER';
  } else if (user.role === Role.ADMIN) {
    role = 'ADMIN';
  }

  return {
    success: true,
    role,
  };
}


