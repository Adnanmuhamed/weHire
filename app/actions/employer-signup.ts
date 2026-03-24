'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createSession } from '@/lib/session';
import { setSessionCookie } from '@/lib/cookies';

export interface RegisterEmployerInput {
  accountType: string;
  mobile: string;
  fullName: string;
  email: string;
  password: string;
  hiringFor: string;
  companyName: string;
  employeeCount: string;
  designation: string;
  pincode: string;
  address: string;
}

export interface RegisterEmployerResult {
  success?: boolean;
  error?: string;
  userId?: string;
}

export async function registerEmployerAction(
  data: RegisterEmployerInput
): Promise<RegisterEmployerResult> {
  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { error: 'Email already registered' };
    }

    const passwordHash = await hashPassword(data.password);

    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: Role.EMPLOYER,
        mobile: data.mobile.trim(),
        designation: data.designation.trim(),
        company: {
          create: {
            name: data.companyName.trim(),
            description: '',
            accountType: data.accountType,
            hiringFor: data.hiringFor,
            employeeCount: data.employeeCount,
            address: data.address.trim(),
            pincode: data.pincode.trim(),
          },
        },
      },
      select: { id: true },
    });

    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    revalidatePath('/employer');
    return { success: true, userId: user.id };
  } catch (e) {
    console.error('registerEmployerAction error:', e);
    return { error: 'Failed to create employer account' };
  }
}
