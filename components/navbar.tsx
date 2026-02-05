import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import { getSessionToken } from '@/lib/cookies';
import { deleteSession } from '@/lib/session';
import { clearSessionCookie } from '@/lib/cookies';
import { db } from '@/lib/db';
import UserProfileDropdown from './user-profile-dropdown';

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

  // Fetch user profile for dropdown if user exists
  let profile = null;
  if (user) {
    try {
      profile = await db.profile.findUnique({
        where: { userId: user.id },
        select: {
          fullName: true,
          avatarUrl: true,
        },
      });
    } catch (error) {
      // Ignore errors - profile is optional
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Logo */}
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
                {/* Jobs link - visible only to authenticated users */}
                <Link
                  href="/jobs"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
                >
                  Jobs
                </Link>

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

                {/* User Profile Dropdown */}
                <UserProfileDropdown
                  userEmail={user.email}
                  userName={profile?.fullName || null}
                  avatarUrl={profile?.avatarUrl || null}
                  logoutAction={logoutAction}
                />
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

