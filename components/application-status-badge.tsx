import { ApplicationStatus } from '@prisma/client';

/**
 * Application Status Badge Component
 * 
 * Reusable component that maps application status to label and color.
 * Type-safe enum handling with no business logic.
 */

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  APPLIED: {
    label: 'Applied',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
  REVIEWING: {
    label: 'Reviewing',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  HIRED: {
    label: 'Hired',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

export default function ApplicationStatusBadge({
  status,
}: ApplicationStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

