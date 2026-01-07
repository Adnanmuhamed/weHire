'use client';

/**
 * Client-Side Authentication Helpers
 * 
 * Functions for handling authentication from the client side.
 * Uses session-based auth (cookies) - no tokens stored in localStorage.
 * All functions are client-side only ('use client').
 */

import { apiPost, apiGet } from './api';

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'EMPLOYER' | 'ADMIN';
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: User;
}

export interface AuthError extends Error {
  code?: string;
  status?: number;
}

/**
 * Login with email and password
 * 
 * @param email - User email
 * @param password - User password
 * @returns User data on success
 * @throws AuthError on failure
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await apiPost<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    return response;
  } catch (error) {
    // Re-throw with proper typing
    throw error as AuthError;
  }
}

/**
 * Sign up a new user
 * 
 * @param email - User email
 * @param password - User password (min 8 chars)
 * @param role - User role (optional, defaults to USER)
 * @returns User data on success
 * @throws AuthError on failure
 */
export async function signup(
  email: string,
  password: string,
  role?: 'USER' | 'EMPLOYER'
): Promise<SignupResponse> {
  try {
    const response = await apiPost<SignupResponse>('/api/auth/signup', {
      email,
      password,
      ...(role && { role }),
    });
    return response;
  } catch (error) {
    // Re-throw with proper typing
    throw error as AuthError;
  }
}

/**
 * Logout current user
 * 
 * Clears session cookie on the server.
 * 
 * @throws AuthError on failure
 */
export async function logout(): Promise<void> {
  try {
    await apiPost('/api/auth/logout');
  } catch (error) {
    // Re-throw with proper typing
    throw error as AuthError;
  }
}

