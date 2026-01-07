import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { getEmployerOverview } from '@/services/employer-dashboard.service';
import OverviewCards from '@/components/employer/overview-cards';
import RecentApplications from '@/components/employer/recent-applications';
import { ApplicationStatus } from '@prisma/client';

/**
 * Employer Dashboard Overview Page
 * 
 * Server Component that displays employer dashboard overview.
 * Protected route - requires authentication and employer role.
 * 
 * FIX: Calls service directly instead of making HTTP request to avoid cookie forwarding issues.
 */

interface RecentApplication {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  status: ApplicationStatus;
  createdAt: string;
}

interface EmployerOverview {
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  applicationsByStatus: {
    status: ApplicationStatus;
    count: number;
  }[];
  recentApplications: RecentApplication[];
}

async function fetchOverview(): Promise<EmployerOverview | null> {
  try {
    // Get current user and validate authentication
    const user = await getCurrentUser();
    const authenticatedUser = requireEmployer(user);

    // Call service directly instead of HTTP request
    // This ensures cookies are available and avoids redirect loops
    const overview = await getEmployerOverview(authenticatedUser);

    // Transform service data to match page interface
    // Service returns Date objects, page expects ISO strings
    const transformedOverview: EmployerOverview = {
      totalJobs: overview.totalJobs,
      openJobs: overview.openJobs,
      totalApplications: overview.totalApplications,
      applicationsByStatus: overview.applicationsByStatus,
      recentApplications: overview.recentApplications.map((app) => ({
        applicationId: app.applicationId,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      })),
    };

    return transformedOverview;
  } catch (error: any) {
    // Handle authentication/authorization errors
    if (error.name === 'AuthenticationError' || error.name === 'AuthorizationError') {
      // Preserve redirect param to prevent infinite loops
      redirect('/login?redirect=/employer');
    }
    console.error('Failed to fetch employer overview:', error);
    return null;
  }
}

export default async function EmployerDashboardPage() {
  const overview = await fetchOverview();

  if (!overview) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
          <div className="text-center py-12">
            <p className="text-foreground/70">Failed to load dashboard data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Employer Dashboard
          </h1>
          <p className="text-foreground/70">
            Overview of your job postings and applications
          </p>
        </div>

        {/* Overview Cards */}
        <div className="mb-8">
          <OverviewCards
            totalJobs={overview.totalJobs}
            openJobs={overview.openJobs}
            totalApplications={overview.totalApplications}
          />
        </div>

        {/* Recent Applications */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Recent Applications
          </h2>
          <RecentApplications applications={overview.recentApplications} />
        </div>
      </div>
    </div>
  );
}

