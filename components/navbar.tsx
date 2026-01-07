import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import { getSessionToken } from '@/lib/cookies';
import { deleteSession } from '@/lib/session';
import { clearSessionCookie } from '@/lib/cookies';

/**
 * Navigation Bar Component
 * 
 * Server Component that displays navigation based on authentication state.
 * Responsive top navigation bar with role-based links.
 * Sticky on scroll, minimal but polished styling.
 * 
 * Force dynamic to ensure auth state is always fresh after logout.
 */
export const dynamic = 'force-dynamic';

/**
 * Server Action for logout
 * Directly clears session using server-side utilities (no HTTP call needed)
 */
async function logoutAction() {
  'use server';
  
  try {
    // Get session token from cookies
    const sessionToken = await getSessionToken();
    
    // Delete session from database if it exists
    if (sessionToken) {
      await deleteSession(sessionToken);
    }
  } catch (error) {
    // Ignore errors - we'll still clear the cookie
  }
  
  // Always clear the cookie, even if session deletion failed
  try {
    await clearSessionCookie();
  } catch (error) {
    // Ignore cookie clearing errors
  }
  
  // Redirect to home page after logout
  redirect('/');
}

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / App Name */}
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:opacity-80 transition-opacity"
          >
            JobPortal
          </Link>

          {/* Right side: Auth buttons or user menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Role-based navigation links */}
                {user.role === Role.USER && (
                  <Link
                    href="/applications"
                    className="px-4 py-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
                  >
                    My Applications
                  </Link>
                )}
                {user.role === Role.EMPLOYER && (
                  <Link
                    href="/employer"
                    className="px-4 py-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
                  >
                    Employer Dashboard
                  </Link>
                )}
                {user.role === Role.ADMIN && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
                  >
                    Admin
                  </Link>
                )}

                {/* Logout form */}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

