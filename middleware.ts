import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware - Path-Based Authentication Guard
 * 
 * Simple path-based middleware that only checks cookie existence and format.
 * 
 * Behavior:
 * - API routes (/api/*): Return 401 JSON when unauthenticated
 * - Page routes: Redirect to /login?redirect=<pathname> when unauthenticated
 * 
 * Rules:
 * - Do NOT check /login or /signup inside logic (matcher excludes them)
 * - Do NOT validate session in middleware
 * - Only check cookie existence + format
 * - NEVER redirect API routes to pages
 */

export const config = {
  matcher: [
    '/((?!api/auth|api/jobs|login|signup|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session_token')?.value;

  const isValid =
    typeof token === 'string' &&
    /^[a-f0-9]{64}$/i.test(token);

  // Allow root path (/) for unauthenticated users (public homepage)
  if (pathname === '/') {
    return NextResponse.next();
  }

  if (!isValid) {
    // API routes return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Page routes redirect to login with redirect param
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

