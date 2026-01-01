import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/cookies';
import { deleteSession } from '@/lib/session';
import { clearSessionCookie } from '@/lib/cookies';

/**
 * POST /api/auth/logout
 * 
 * Invalidates the current session and clears the session cookie.
 * 
 * Response:
 * - 200: Logout successful
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = await getSessionToken();

    if (sessionToken) {
      // Delete session from database
      await deleteSession(sessionToken);
    }

    // Clear session cookie
    await clearSessionCookie();

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, clear the cookie
    await clearSessionCookie().catch(() => {
      // Ignore errors during cleanup
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


