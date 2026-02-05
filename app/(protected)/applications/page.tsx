import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { requireUser } from '@/lib/rbac';
import { getUserApplications } from '@/services/application.service';
import ApplicationCard from '@/components/application-card';
import ApplicationsList from '@/components/applications-list';
import { ApplicationStatus } from '@prisma/client';

/**
 * My Applications Page
 * 
 * Server Component that displays all applications for the authenticated user.
 * Protected route - requires authentication.
 * 
 * FIX: Calls service directly instead of making HTTP request to avoid cookie forwarding issues.
 */

interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  coverNote: string | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
    };
  };
}

interface ApplicationsResponse {
  applications: Application[];
  count: number;
}

async function fetchApplications(): Promise<ApplicationsResponse> {
  try {
    // Get current user and validate authentication
    const user = await getCurrentUser();
    const authenticatedUser = requireUser(user);

    // Call service directly instead of HTTP request
    // This ensures cookies are available and avoids redirect loops
    const applications = await getUserApplications(authenticatedUser);

    // Transform service data to match page interface
    // Service returns Date objects, page expects ISO strings
    const transformedApplications: Application[] = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      status: app.status,
      coverNote: app.coverNote,
      createdAt: app.createdAt.toISOString(),
      job: {
        id: app.job.id,
        title: app.job.title,
        company: {
          id: app.job.company.id,
          name: app.job.company.name,
        },
      },
    }));

    return {
      applications: transformedApplications,
      count: transformedApplications.length,
    };
  } catch (error: any) {
    // Handle authentication errors
    if (error.name === 'AuthenticationError' || error.name === 'AuthorizationError') {
      // Preserve redirect param to prevent infinite loops
      redirect('/login?redirect=/applications');
    }
    console.error('Failed to fetch applications:', error);
    // Return empty result on error
    return {
      applications: [],
      count: 0,
    };
  }
}

export default async function ApplicationsPage() {
  const data = await fetchApplications();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            My Applications
          </h1>
          <p className="text-foreground/70">
            Track the status of your job applications
          </p>
        </div>

        {/* Applications List */}
        {data.applications.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-16 w-16 text-foreground/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No applications yet
              </h3>
              <p className="mt-2 text-sm text-foreground/70">
                You haven't applied to any jobs yet. Start browsing opportunities
                and apply to positions that match your skills.
              </p>
              <div className="mt-6">
                <Link
                  href="/jobs"
                  className="inline-flex items-center px-6 py-3 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-opacity"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <ApplicationsList applications={data.applications} />
        )}
      </div>
    </div>
  );
}

