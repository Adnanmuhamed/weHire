import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { requireJobOwnership } from '@/lib/ownership';
import { getJobApplications } from '@/services/application.service';
import ApplicationRow from '@/components/employer/application-row';
import { ApplicationStatus } from '@prisma/client';

/**
 * Job Applications Page
 * 
 * Server Component that displays applications for a specific job.
 * Protected route - requires authentication and employer role.
 * 
 * FIX: Calls service directly instead of making HTTP request to avoid cookie forwarding issues.
 */

interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  coverNote: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      headline: string | null;
      skills: string[];
      experience: number;
      resumeUrl: string | null;
    } | null;
  };
  job: {
    id: string;
    title: string;
  };
}

interface ApplicationsResponse {
  applications: Application[];
  count: number;
}

interface PageProps {
  params: Promise<{ jobId: string }>;
}

async function fetchApplications(jobId: string): Promise<ApplicationsResponse | null> {
  try {
    // Get current user and validate authentication
    const user = await getCurrentUser();
    const authenticatedUser = requireEmployer(user);

    // Verify job ownership (employers can only view applications for their own jobs)
    await requireJobOwnership(authenticatedUser, jobId);

    // Call service directly instead of HTTP request
    // This ensures cookies are available and avoids redirect loops
    const applications = await getJobApplications(authenticatedUser, jobId);

    // Transform service data to match page interface
    // Service returns Date objects, page expects ISO strings
    const transformedApplications: Application[] = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      userId: app.userId,
      status: app.status,
      coverNote: app.coverNote,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      user: {
        id: app.user.id,
        email: app.user.email,
        profile: app.user.profile
          ? {
              fullName: app.user.profile.fullName,
              headline: app.user.profile.headline,
              skills: app.user.profile.skills,
              experience: app.user.profile.experience,
              resumeUrl: app.user.profile.resumeUrl,
            }
          : null,
      },
      job: {
        id: app.job.id,
        title: app.job.title,
      },
    }));

    return {
      applications: transformedApplications,
      count: transformedApplications.length,
    };
  } catch (error: any) {
    // Handle authentication/authorization errors
    if (error.name === 'AuthenticationError' || error.name === 'AuthorizationError') {
      // Check if it's a "not found" error (job doesn't exist or user doesn't own it)
      if (error.message === 'Job not found' || error.message.includes('not found')) {
        notFound();
      }
      // Preserve redirect param to prevent infinite loops
      // Include the full path with jobId
      redirect(`/login?redirect=/employer/jobs/${jobId}/applications`);
    }
    console.error('Failed to fetch applications:', error);
    return null;
  }
}

export default async function JobApplicationsPage({ params }: PageProps) {
  const { jobId } = await params;
  const data = await fetchApplications(jobId);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
          <div className="text-center py-12">
            <p className="text-foreground/70">Failed to load applications.</p>
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
            Applications
          </h1>
          <p className="text-foreground/70">
            {data.count} {data.count === 1 ? 'application' : 'applications'} received
          </p>
        </div>

        {/* Applications Table */}
        {data.applications.length === 0 ? (
          <div className="p-8 text-center border border-foreground/10 rounded-lg bg-background">
            <svg
              className="mx-auto h-12 w-12 text-foreground/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-foreground">No applications yet</h3>
            <p className="mt-2 text-sm text-foreground/60">
              Applications will appear here when candidates apply to this job.
            </p>
          </div>
        ) : (
          <div className="border border-foreground/10 rounded-lg bg-background overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/10 bg-foreground/5">
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Applied
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10">
                  {data.applications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      applicationId={application.id}
                      candidateEmail={application.user.email}
                      candidateName={application.user.profile?.fullName || null}
                      status={application.status}
                      appliedDate={application.createdAt}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

