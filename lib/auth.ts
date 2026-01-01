import { getSessionToken } from './cookies';
import { validateSession } from './session';

/**
 * Get the current authenticated user from the session
 * 
 * This is a convenience function for use in server components and API routes.
 * Returns null if no valid session exists.
 * 
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser() {
  const sessionToken = await getSessionToken();
  return validateSession(sessionToken);
}


