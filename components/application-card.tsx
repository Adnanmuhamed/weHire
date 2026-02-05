import Link from 'next/link';
import { ApplicationStatus } from '@prisma/client';
import ApplicationStatusBadge from './application-status-badge';

/**
 * Application Card Component
 * Stateless presentational component for displaying application information.
 * Clean card UI with accessible markup.
 */

export interface ApplicationCardProps {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedDate: Date;
  onClick?: () => void;
}

function formatDate(date: Date): string {
  const now = new Date();
  const appliedDate = new Date(date);
  const diffInMs = now.getTime() - appliedDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function formatFullDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ApplicationCard({
  jobId,
  jobTitle,
  companyName,
  status,
  appliedDate,
  onClick,
}: ApplicationCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const cardContent = (
    <article>
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-1">
              {jobTitle}
            </h3>
            <p className="text-foreground/70 font-medium">{companyName}</p>
          </div>
          <ApplicationStatusBadge status={status} />
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-foreground/10">
          <p className="text-xs text-foreground/50">
            Applied {formatDate(appliedDate)} • {formatFullDate(appliedDate)}
          </p>
        </div>
      </div>
    </article>
  );

  if (onClick) {
    return (
      <div
        onClick={handleClick}
        className="block p-6 border border-foreground/10 rounded-lg bg-background hover:border-foreground/20 hover:shadow-md transition-all cursor-pointer"
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/jobs/${jobId}`}
      className="block p-6 border border-foreground/10 rounded-lg bg-background hover:border-foreground/20 hover:shadow-md transition-all"
    >
      {cardContent}
    </Link>
  );
}