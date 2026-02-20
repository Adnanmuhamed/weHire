import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getEmployerJobs } from '@/app/actions/job';
import JobTable from '@/components/employer/job-table';
import { JobStatus } from '@prisma/client';

/**
 * Employer Jobs Page
 * 
 * Server Component that displays all jobs posted by the employer.
 * Protected route - requires authentication and employer role.
 * 
 * Uses server action to fetch jobs directly.
 */

interface EmployerJob {
  id: string;
  title: string;
  status: JobStatus;
  applicationCount: number;
  createdAt: string;
}

export default async function EmployerJobsPage() {
  const result = await getEmployerJobs();

  // Handle errors
  if (result.error) {
    // If it's an auth error, redirect to login
    if (result.error.includes('logged in') || result.error.includes('permission')) {
      redirect('/login?redirect=/employer/jobs');
    }
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
          <div className="text-center py-12">
            <p className="text-foreground/70">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform Date objects to ISO strings for the component
  const jobs: EmployerJob[] =
    result.jobs?.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      applicationCount: job.applicationCount,
      createdAt: job.createdAt.toISOString(),
    })) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              My Jobs
            </h1>
            <p className="text-foreground/70">
              Manage your job postings and view applications
            </p>
          </div>
          <Link
            href="/employer/jobs/new"
            className="bg-foreground text-background px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity text-sm"
          >
            Post New Job
          </Link>
        </div>

        {/* Jobs Table */}
        <div className="border border-foreground/10 rounded-lg bg-background overflow-hidden">
          <JobTable jobs={jobs} />
        </div>
      </div>
    </div>
  );
}

