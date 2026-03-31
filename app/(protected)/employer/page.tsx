import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { JobStatus } from '@prisma/client';
import { ExternalLink, Briefcase } from 'lucide-react';
import { db } from '@/lib/db';
import JobStatusToggle from '@/components/employer/job-status-toggle';

/**
 * Employer Dashboard Overview Page
 *
 * Server Component that displays employer dashboard overview.
 * Protected route - requires authentication and employer role.
 */

export const dynamic = 'force-dynamic';

function formatJobDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default async function EmployerDashboardPage() {
  const user = await getCurrentUser();
  const authenticatedUser = requireEmployer(user);

  const [jobs, company] = await Promise.all([
    db.job.findMany({
      where: { company: { ownerId: authenticatedUser.id } },
      select: {
        id: true,
        title: true,
        location: true,
        status: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.company.findUnique({
      where: { ownerId: authenticatedUser.id },
      select: { id: true },
    }),
  ]);

  const companyId = company?.id || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Manage Jobs
              </h1>
              <p className="text-foreground/70">
                View, track, and manage all your job postings in one place.
              </p>
            </div>
            {companyId && (
              <Link
                href={`/company/${companyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                View Public Profile
              </Link>
            )}
          </div>
        </div>

        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Briefcase className="w-4 h-4" />
            <span>
              {jobs.length === 0
                ? 'You have not posted any jobs yet.'
                : `You have ${jobs.length} job${jobs.length === 1 ? '' : 's'} posted.`}
            </span>
          </div>
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm hover:opacity-90 transition-opacity"
          >
            Post New Job
          </Link>
        </div>

        {/* Jobs table / empty state */}
        {jobs.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-foreground/20 bg-muted/40 px-6 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10">
              <Briefcase className="h-6 w-6 text-foreground/80" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Start hiring with your first job
            </h2>
            <p className="mb-6 max-w-md text-sm text-foreground/70">
              Post your first role in minutes and start receiving quality applications from candidates.
            </p>
            <Link
              href="/employer/jobs/new"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm hover:opacity-90 transition-opacity"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-foreground/10 bg-background shadow-sm">
            <table className="min-w-full divide-y divide-foreground/10 text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/70">
                    Job
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/70">
                    Posted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/70">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/70">
                    Applications
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-foreground/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-foreground">
                        {job.title}
                      </div>
                      <div className="text-xs text-foreground/60 mt-0.5">
                        {job.location ? job.location : 'Location not specified'}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-foreground/70 whitespace-nowrap">
                      {formatJobDate(job.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <JobStatusToggle jobId={job.id} currentStatus={job.status} />
                    </td>
                    <td className="px-4 py-3 align-top text-sm">
                      <Link
                        href={`/employer/jobs/${job.id}/applications`}
                        className="font-medium text-primary hover:underline"
                      >
                        {job._count.applications}{' '}
                        {job._count.applications === 1 ? 'application' : 'applications'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top text-right text-sm">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-foreground/70 hover:text-foreground underline-offset-2 hover:underline"
                        >
                          View
                        </Link>
                        <span className="text-foreground/20">•</span>
                        <Link
                          href={`/employer/jobs/${job.id}/edit`}
                          className="text-foreground/70 hover:text-foreground underline-offset-2 hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
