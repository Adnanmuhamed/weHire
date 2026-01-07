import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { getEmployerJobs } from '@/services/employer-dashboard.service';
import JobTable from '@/components/employer/job-table';
import { JobStatus } from '@prisma/client';

/**
 * Employer Jobs Page
 * 
 * Server Component that displays all jobs posted by the employer.
 * Protected route - requires authentication and employer role.
 * 
 * FIX: Calls service directly instead of making HTTP request to avoid cookie forwarding issues.
 */

interface EmployerJob {
  id: string;
  title: string;
  status: JobStatus;
  applicationCount: number;
  createdAt: string;
}

interface EmployerJobsResponse {
  jobs: EmployerJob[];
  count: number;
}

async function fetchJobs(): Promise<EmployerJobsResponse | null> {
  try {
    // Get current user and validate authentication
    const user = await getCurrentUser();
    const authenticatedUser = requireEmployer(user);

    // Call service directly instead of HTTP request
    // This ensures cookies are available and avoids redirect loops
    const jobs = await getEmployerJobs(authenticatedUser);

    // Transform service data to match page interface
    // Service returns Date objects, page expects ISO strings
    const transformedJobs: EmployerJob[] = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      applicationCount: job.applicationCount,
      createdAt: job.createdAt.toISOString(),
    }));

    return {
      jobs: transformedJobs,
      count: transformedJobs.length,
    };
  } catch (error: any) {
    // Handle authentication/authorization errors
    if (error.name === 'AuthenticationError' || error.name === 'AuthorizationError') {
      // Preserve redirect param to prevent infinite loops
      redirect('/login?redirect=/employer/jobs');
    }
    console.error('Failed to fetch employer jobs:', error);
    return null;
  }
}

export default async function EmployerJobsPage() {
  const data = await fetchJobs();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            My Jobs
          </h1>
          <p className="text-foreground/70">
            Manage your job postings and view applications
          </p>
        </div>

        {/* Jobs Table */}
        {data ? (
          <div className="border border-foreground/10 rounded-lg bg-background overflow-hidden">
            <JobTable jobs={data.jobs} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground/70">Failed to load jobs.</p>
          </div>
        )}
      </div>
    </div>
  );
}

