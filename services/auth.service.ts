import { db } from '@/lib/db';
import { hashPassword, comparePassword } from '@/lib/password';
import { createSession, deleteAllUserSessions } from '@/lib/session';
import { Role } from '@prisma/client';

/**
 * Authentication Service
 * 
 * Business logic layer for authentication operations.
 * Handles signup, login, logout, and password changes.
 */

export interface SignupInput {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  sessionToken?: string;
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: at least 8 characters
 */
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Sign up a new user
 * @param input - Signup credentials
 * @returns Auth result with session token if successful
 */
export async function signup(input: SignupInput): Promise<AuthResult> {
  // Validate input
  if (!input.email || !input.password) {
    return {
      success: false,
      message: 'Email and password are required',
    };
  }

  if (!isValidEmail(input.email)) {
    return {
      success: false,
      message: 'Invalid email format',
    };
  }

  if (!isValidPassword(input.password)) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    return {
      success: false,
      message: 'User with this email already exists',
    };
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Create user
  const user = await db.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role || Role.USER,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  // Create session
  const sessionToken = await createSession(user.id);

  return {
    success: true,
    message: 'User created successfully',
    sessionToken,
    user,
  };
}

/**
 * Log in an existing user
 * @param input - Login credentials
 * @returns Auth result with session token if successful
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  // Validate input
  if (!input.email || !input.password) {
    return {
      success: false,
      message: 'Email and password are required',
    };
  }

  // Find user
  const user = await db.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: 'Invalid email or password',
    };
  }

  // Check if user is active
  if (!user.isActive) {
    return {
      success: false,
      message: 'Account is deactivated',
    };
  }

  // Verify password
  const passwordValid = await comparePassword(input.password, user.passwordHash);

  if (!passwordValid) {
    return {
      success: false,
      message: 'Invalid email or password',
    };
  }

  // Create session
  const sessionToken = await createSession(user.id);

  return {
    success: true,
    message: 'Login successful',
    sessionToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Change user password and invalidate all sessions
 * @param userId - User ID
 * @param currentPassword - Current password for verification
 * @param newPassword - New password
 * @returns Success status and message
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  // Validate new password
  if (!isValidPassword(newPassword)) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Get user with password hash
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    return {
      success: false,
      message: 'User not found',
    };
  }

  // Verify current password
  const passwordValid = await comparePassword(currentPassword, user.passwordHash);

  if (!passwordValid) {
    return {
      success: false,
      message: 'Current password is incorrect',
    };
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password and invalidate all sessions
  await Promise.all([
    db.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    }),
    deleteAllUserSessions(userId),
  ]);

  return {
    success: true,
    message: 'Password changed successfully. Please log in again.',
  };
}


