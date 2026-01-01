import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware - Authentication Guard
 * 
 * This middleware runs on protected routes and enforces authentication.
 * It does NOT perform role checks - that's handled by RBAC guards in route handlers.
 * 
 * IMPORTANT: Middleware runs on Edge runtime, which doesn't support Prisma.
 * This middleware performs a lightweight check (cookie existence and format).
 * Full session validation happens in route handlers via getCurrentUser().
 * 
 * Configuration:
 * - Excludes public routes (auth endpoints, static assets)
 * - Redirects unauthenticated users to /login (pages) or returns 401 (API routes)
 */

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/* (authentication endpoints)
     * - /login, /signup (public auth pages)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - /public (public assets)
     */
    '/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookie
  const sessionToken = request.cookies.get('session_token')?.value;

  // Lightweight check: verify cookie exists and has valid format
  // Session token should be a hex string (64 chars for 256-bit token)
  const isValidFormat = sessionToken && /^[a-f0-9]{64}$/i.test(sessionToken);

  // If no valid session cookie, handle based on route type
  if (!isValidFormat) {
    // API routes return 401 JSON response
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Page routes redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie exists and has valid format
  // Full validation (DB check, expiration, user status) happens in route handlers
  // Role checks are handled by RBAC guards in route handlers
  return NextResponse.next();
}

