import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';
import { handleAuthError } from '@/lib/api-error';
import { getUsers } from '@/services/admin.service';
import { Role } from '@prisma/client';

/**
 * GET /api/admin/users
 * 
 * Get paginated list of users
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireAdmin() - RBAC (ADMIN only)
 * 3. getUsers() - Business logic (assumes RBAC already checked)
 * 
 * Query parameters:
 * - page?: number (defaults to 1)
 * - limit?: number (defaults to 20, max 100)
 * - role?: Role (filter by role)
 * - isActive?: boolean (filter by active status)
 * 
 * Response:
 * - 200: Paginated users list
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require admin role only
    requireAdmin(user);

    // Step 3: Parse query parameters
    const { searchParams } = new URL(request.url);

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const roleParam = searchParams.get('role');
    const isActiveParam = searchParams.get('isActive');

    const page = pageParam ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const role = roleParam && Object.values(Role).includes(roleParam as Role) 
      ? (roleParam as Role) 
      : undefined;
    const isActive = isActiveParam !== null 
      ? isActiveParam === 'true' 
      : undefined;

    // Step 4: Call service method (assumes RBAC already checked)
    const result = await getUsers({
      page,
      limit,
      role,
      isActive,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Handle authentication/authorization errors
    if (
      error instanceof Error &&
      (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')
    ) {
      return handleAuthError(error);
    }

    // Handle other errors
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

