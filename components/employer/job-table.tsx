import Link from 'next/link';
import { JobStatus } from '@prisma/client';

/**
 * Job Table Component
 * 
 * Displays jobs in a table format with status badges.
 * Stateless presentational component.
 */

interface Job {
  id: string;
  title: string;
  status: JobStatus;
  applicationCount: number;
  createdAt: string;
}

interface JobTableProps {
  jobs: Job[];
}

const statusConfig: Record<
  JobStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
  OPEN: {
    label: 'Open',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  PAUSED: {
    label: 'Paused',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function JobTable({ jobs }: JobTableProps) {
  if (jobs.length === 0) {
    return (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No jobs posted</h3>
        <p className="mt-2 text-sm text-foreground/60">
          Get started by creating your first job posting.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-foreground/10">
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
              Job Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
              Applications
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/10">
          {jobs.map((job) => {
            const statusInfo = statusConfig[job.status];
            return (
              <tr
                key={job.id}
                className="hover:bg-foreground/5 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <Link
                    href={`/employer/jobs/${job.id}/applications`}
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    {job.title}
                  </Link>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground/70">
                  {job.applicationCount}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground/60">
                  {formatDate(job.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

