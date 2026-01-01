import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/rbac';
import { handleAuthError } from '@/lib/api-error';
import { verifyCompany } from '@/services/admin.service';

/**
 * PATCH /api/admin/companies/[companyId]
 * 
 * Verify or unverify a company
 * 
 * Enforcement order:
 * 1. getCurrentUser() - Authentication check
 * 2. requireAdmin() - RBAC (ADMIN only)
 * 3. verifyCompany() - Business logic (assumes RBAC already checked)
 * 
 * Request body:
 * - isVerified: boolean (required)
 * 
 * Response:
 * - 200: Company verification status updated successfully
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 * - 404: Company not found
 * - 400: Validation error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    // Step 1: Authentication check
    const user = await getCurrentUser();

    // Step 2: RBAC - require admin role only
    requireAdmin(user);

    const { companyId } = await params;

    // Step 3: Parse request body
    const body = await request.json();

    // Validate request body
    if (typeof body.isVerified !== 'boolean') {
      return NextResponse.json(
        { error: 'isVerified must be a boolean' },
        { status: 400 }
      );
    }

    // Step 4: Call service method (assumes RBAC already checked)
    const updatedCompany = await verifyCompany(companyId, body.isVerified);

    return NextResponse.json(
      {
        message: `Company ${body.isVerified ? 'verified' : 'unverified'} successfully`,
        company: updatedCompany,
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

    // Handle validation errors from service
    if (error instanceof Error && error.message) {
      const statusCode = error.message === 'Company not found' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status: statusCode });
    }

    // Handle other errors
    console.error('Company verification update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

