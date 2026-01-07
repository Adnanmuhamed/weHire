import Link from 'next/link';
import { ApplicationStatus } from '@prisma/client';
import ApplicationStatusBadge from '@/components/application-status-badge';

/**
 * Recent Applications Component
 * 
 * Displays the last 5 applications received.
 * Stateless presentational component.
 */

interface RecentApplication {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  status: ApplicationStatus;
  createdAt: string;
}

interface RecentApplicationsProps {
  applications: RecentApplication[];
}

function formatDate(date: string): string {
  const now = new Date();
  const appDate = new Date(date);
  const diffInMs = now.getTime() - appDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}

export default function RecentApplications({ applications }: RecentApplicationsProps) {
  if (applications.length === 0) {
    return (
      <div className="p-6 border border-foreground/10 rounded-lg bg-background">
        <p className="text-sm text-foreground/60">No applications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((application) => (
        <Link
          key={application.applicationId}
          href={`/employer/jobs/${application.jobId}/applications`}
          className="block p-4 border border-foreground/10 rounded-lg bg-background hover:border-foreground/20 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground mb-1 truncate">
                {application.jobTitle}
              </h4>
              <p className="text-xs text-foreground/60">
                Applied {formatDate(application.createdAt)}
              </p>
            </div>
            <ApplicationStatusBadge status={application.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}

