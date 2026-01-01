import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { requireUser, hasRole } from '@/lib/rbac';
import { Role } from '@prisma/client';

/**
 * Dashboard Page - Example Server Component with RBAC
 * 
 * This demonstrates:
 * - Server-side authentication check
 * - Role-based UI rendering
 * - Proper error handling
 * 
 * IMPORTANT: UI role checks are for UX only, NOT security.
 * Security is enforced by middleware and RBAC guards in API routes.
 */
export default async function DashboardPage() {
  // Get current user
  const user = await getCurrentUser();

  // Require authentication (will redirect if not authenticated)
  // In a real app, you might want to handle this more gracefully
  if (!user) {
    redirect('/login');
  }

  // Ensure user has at least USER role
  // This is redundant with middleware but demonstrates the pattern
  try {
    requireUser(user);
  } catch {
    redirect('/login');
  }

  // Role-based UI rendering (UX only, not security)
  const isEmployer = hasRole(user, Role.EMPLOYER);
  const isAdmin = hasRole(user, Role.ADMIN);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="mb-6">
        <p className="text-lg">Welcome, {user.email}!</p>
        <p className="text-sm text-gray-600">Role: {user.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Available to all authenticated users */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">My Profile</h2>
          <p className="text-gray-600 mb-4">View and edit your profile</p>
          <a
            href="/profile"
            className="text-blue-600 hover:underline"
          >
            Go to Profile →
          </a>
        </div>

        {/* Available to all authenticated users */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">My Applications</h2>
          <p className="text-gray-600 mb-4">Track your job applications</p>
          <a
            href="/applications"
            className="text-blue-600 hover:underline"
          >
            View Applications →
          </a>
        </div>

        {/* Only visible to EMPLOYER and ADMIN */}
        {isEmployer && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Post a Job</h2>
            <p className="text-gray-600 mb-4">Create a new job posting</p>
            <a
              href="/jobs/new"
              className="text-blue-600 hover:underline"
            >
              Create Job →
            </a>
          </div>
        )}

        {/* Only visible to EMPLOYER and ADMIN */}
        {isEmployer && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">My Jobs</h2>
            <p className="text-gray-600 mb-4">Manage your job postings</p>
            <a
              href="/jobs/manage"
              className="text-blue-600 hover:underline"
            >
              Manage Jobs →
            </a>
          </div>
        )}

        {/* Only visible to ADMIN */}
        {isAdmin && (
          <div className="border rounded-lg p-6 bg-red-50">
            <h2 className="text-xl font-semibold mb-2">Admin Panel</h2>
            <p className="text-gray-600 mb-4">Platform administration</p>
            <a
              href="/admin"
              className="text-red-600 hover:underline"
            >
              Admin Dashboard →
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> UI role checks are for user experience only.
          All API endpoints are protected by middleware and RBAC guards.
        </p>
      </div>
    </div>
  );
}

