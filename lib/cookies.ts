import { cookies } from 'next/headers';

/**
 * Cookie Management Utilities
 * 
 * Handles setting and clearing HTTP-only cookies for session management.
 * Cookies are configured with security best practices:
 * - HttpOnly: Prevents JavaScript access
 * - SameSite=Lax: CSRF protection
 * - Secure: HTTPS only in production
 */

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_DURATION_DAYS = 7;

/**
 * Get the session token from cookies
 * @returns Session token or undefined
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Set the session token in an HTTP-only cookie
 * @param sessionToken - Session token to set
 */
export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS);

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  });
}

/**
 * Clear the session cookie
 * Sets the cookie with an expired date to ensure it's removed from the browser
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  
  // Delete the cookie by setting it with an expired date
  // This ensures it's properly removed from the browser
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0), // Set to epoch time (Jan 1, 1970) to expire immediately
    path: '/',
  });
}


