'use server';

/**
 * Settings Server Actions
 * 
 * Server-side actions for updating account settings.
 * Includes validation and revalidation for immediate UI updates.
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { hashPassword, comparePassword } from '@/lib/password';

export interface UpdateAccountDetailsInput {
  email: string;
  mobile: string;
}

export interface UpdateAccountDetailsResult {
  success?: boolean;
  error?: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePasswordResult {
  success?: boolean;
  error?: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate mobile number format (required, basic validation)
 */
function isValidMobile(mobile: string): boolean {
  if (!mobile || mobile.trim().length === 0) {
    return false; // Mobile is required
  }
  // Basic validation: 10-15 digits, may include +, spaces, dashes
  const mobileRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return mobileRegex.test(mobile.trim());
}

/**
 * Validate password strength
 */
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Update account details (email and mobile)
 * 
 * Updates User.email and Profile.mobile in a transaction.
 * Revalidates paths to ensure UI updates immediately.
 */
export async function updateAccountDetails(
  input: UpdateAccountDetailsInput
): Promise<UpdateAccountDetailsResult> {
  try {
    // Validate input
    if (!input.email || input.email.trim().length === 0) {
      return { error: 'Email is required' };
    }

    const trimmedEmail = input.email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return { error: 'Invalid email format' };
    }

    if (trimmedEmail.length > 200) {
      return { error: 'Email must not exceed 200 characters' };
    }

    // Validate mobile number (required)
    if (!input.mobile || input.mobile.trim().length === 0) {
      return { error: 'Mobile number is required' };
    }

    if (!isValidMobile(input.mobile)) {
      return { error: 'Invalid mobile number format' };
    }

    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check if email is already taken by another user
    const existingUser = await db.user.findUnique({
      where: { email: trimmedEmail },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== user.id) {
      return { error: 'Email is already taken' };
    }

    // Update email and mobile in a transaction
    await db.$transaction(async (tx) => {
      // Update user email
      await tx.user.update({
        where: { id: user.id },
        data: { email: trimmedEmail },
      });

      // Update or create profile with mobile
      await tx.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          fullName: trimmedEmail.split('@')[0] || 'User', // Default name
          experience: 0,
          skills: [],
          mobile: input.mobile.trim(),
        },
        update: {
          mobile: input.mobile.trim(),
        },
      });
    });

    // Revalidate paths
    revalidatePath('/settings');
    revalidatePath('/profile');

    return { success: true };
  } catch (error) {
    console.error('Failed to update account details:', error);
    return { error: 'Failed to update account details. Please try again.' };
  }
}

/**
 * Update password
 * 
 * Verifies current password and updates to new password.
 * Revalidates paths to ensure UI updates immediately.
 */
export async function updatePassword(
  input: UpdatePasswordInput
): Promise<UpdatePasswordResult> {
  try {
    // Validate input
    if (!input.currentPassword || input.currentPassword.trim().length === 0) {
      return { error: 'Current password is required' };
    }

    if (!input.newPassword || !isValidPassword(input.newPassword)) {
      return { error: 'New password must be at least 8 characters long' };
    }

    if (input.newPassword !== input.confirmPassword) {
      return { error: 'New password and confirm password do not match' };
    }

    if (input.currentPassword === input.newPassword) {
      return { error: 'New password must be different from current password' };
    }

    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get user with password hash
    const userWithHash = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!userWithHash) {
      return { error: 'User not found' };
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      input.currentPassword,
      userWithHash.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return { error: 'Current password is incorrect' };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(input.newPassword);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Revalidate paths
    revalidatePath('/settings');

    return { success: true };
  } catch (error) {
    console.error('Failed to update password:', error);
    return { error: 'Failed to update password. Please try again.' };
  }
}

