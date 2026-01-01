import { db } from './db';
import { randomBytes } from 'crypto';

/**
 * Session Management Utilities
 * 
 * Handles creating, validating, and deleting sessions.
 * Sessions are stored in the database and identified by a unique token.
 */

const SESSION_DURATION_DAYS = 7;
const SESSION_TOKEN_BYTES = 32; // 256 bits

/**
 * Generate a cryptographically secure session token
 */
function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString('hex');
}

/**
 * Calculate session expiration date (7 days from now)
 */
function getSessionExpiration(): Date {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + SESSION_DURATION_DAYS);
  return expiration;
}

/**
 * Create a new session for a user
 * @param userId - User ID
 * @returns Session token
 */
export async function createSession(userId: string): Promise<string> {
  const sessionToken = generateSessionToken();
  const expires = getSessionExpiration();

  await db.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  return sessionToken;
}

/**
 * Validate a session token and return the associated user
 * @param sessionToken - Session token from cookie
 * @returns User object if session is valid, null otherwise
 */
export async function validateSession(sessionToken: string | undefined) {
  if (!sessionToken) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
        },
      },
    },
  });

  // Check if session exists and is not expired
  if (!session || session.expires < new Date()) {
    // Clean up expired session
    if (session) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {
        // Ignore errors during cleanup
      });
    }
    return null;
  }

  // Check if user is active
  if (!session.user.isActive) {
    return null;
  }

  return session.user;
}

/**
 * Delete a session by token
 * @param sessionToken - Session token to delete
 */
export async function deleteSession(sessionToken: string): Promise<void> {
  await db.session.deleteMany({
    where: { sessionToken },
  });
}

/**
 * Delete all sessions for a user
 * Used when password is changed or account is deactivated
 * @param userId - User ID
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({
    where: { userId },
  });
}


