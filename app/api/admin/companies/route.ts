import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';
import { handleAuthError } from '@/lib/api-error';
import { getCompanies } from '@/services/admin.service';

/**
 * GET /api/admin/companies
 * 
 * Get all companies
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireAdmin() - RBAC (ADMIN only)
 * 3. getCompanies() - Business logic (assumes RBAC already checked)
 * 
 * Returns:
 * - Array of companies with:
 *   - companyId
 *   - name
 *   - isVerified
 *   - ownerId
 *   - createdAt
 * 
 * Response:
 * - 200: Companies list
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require admin role only
    requireAdmin(user);

    // Step 3: Call service method (assumes RBAC already checked)
    const companies = await getCompanies();

    return NextResponse.json(
      {
        companies,
        count: companies.length,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle authentication/authorization errors
    if (
      error instanceof Error &&
      (error.name === 'AuthenticationError' || error.name === 'AuthorizationError')
    ) {
      return handleAuthError(error);
    }

    // Handle other errors
    console.error('Admin companies fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

