import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import { getSessionToken } from '@/lib/cookies';
import { deleteSession } from '@/lib/session';
import { clearSessionCookie } from '@/lib/cookies';
import { db } from '@/lib/db';
import UserProfileDropdown from './user-profile-dropdown';
import EmployerDropdown from './employer-dropdown';
import NavbarMobileMenu from './navbar-mobile-menu';

/**
 * Navigation Bar Component
 *
 * Server Component — auth state is resolved on the server, role-based links
 * are rendered conditionally. Mobile toggle is handled by NavbarMobileMenu
 * (a small Client Component that only owns the open/close state).
 */
export const dynamic = 'force-dynamic';

async function logoutAction() {
  'use server';

  try {
    const sessionToken = await getSessionToken();
    if (sessionToken) {
      await deleteSession(sessionToken);
    }
  } catch { }

  try {
    await clearSessionCookie();
  } catch { }

  redirect('/');
}

const navLinkCls =
  'px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:text-gray-300 rounded-md hover:bg-white/10';

export default async function Navbar() {
  const user = await getCurrentUser();

  let profile = null;
  if (user) {
    try {
      profile = await db.profile.findUnique({
        where: { userId: user.id },
        select: { fullName: true, avatarUrl: true },
      });
    } catch { }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-black border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">

          {/* ── Left: Logo ── */}
          <Link
            href={user?.role === Role.EMPLOYER ? '/employer' : '/'}
            className="text-xl font-bold text-white hover:text-white/80 transition-colors shrink-0"
          >
            JobPortal
          </Link>

          {/* ── Center: unauthenticated public links (desktop only) ── */}
          {!user && (
            <div className="hidden md:flex items-center gap-1">
              <Link href="/jobs" className={navLinkCls}>Find Jobs</Link>
              <Link href="/companies" className={navLinkCls}>Companies</Link>
            </div>
          )}

          {/* ── Right: role-based links + avatar (desktop) / hamburger (mobile) ── */}
          <div className="flex items-center gap-2">

            {/* Desktop right-side links — hidden on mobile (mobile menu handles them) */}
            {user && (
              <div className="hidden md:flex items-center gap-2">
                {user.role === Role.EMPLOYER && (
                  <>
                    <Link href="/employer" className={navLinkCls}>
                      Manage Jobs
                    </Link>
                    <Link
                      href="/employer/jobs/new"
                      className="px-4 py-2 text-sm font-semibold text-white border border-white/20 rounded-md hover:bg-white/10 transition-colors"
                    >
                      Post a Job
                    </Link>
                  </>
                )}
                {user.role === Role.USER && (
                  <>
                    <Link href="/jobs" className={navLinkCls}>Jobs</Link>
                    <Link href="/companies" className={navLinkCls}>Companies</Link>
                  </>
                )}
                {user.role === Role.ADMIN && (
                  <Link href="/admin" className={navLinkCls}>Admin</Link>
                )}
              </div>
            )}

            {/* Auth actions (desktop) */}
            {user ? (
              /* Avatar — always rightmost */
              <UserProfileDropdown
                userEmail={user.email}
                userName={profile?.fullName || null}
                avatarUrl={profile?.avatarUrl || null}
                userRole={user.role}
                logoutAction={logoutAction}
              />
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <EmployerDropdown />
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:text-gray-300 rounded-md hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-md hover:bg-white/10 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger — passes serialisable props to Client Component */}
            <NavbarMobileMenu
              userRole={user?.role ?? null}
              isAuthenticated={!!user}
            />
          </div>

        </div>
      </div>
    </nav>
  );
}