'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ApplicationStatus } from '@prisma/client';
import { updateApplicationStatus } from '@/app/actions/application';
import { Loader2 } from 'lucide-react';

interface StatusSelectProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.APPLIED]: 'Applied',
  [ApplicationStatus.REVIEWING]: 'Reviewing',
  [ApplicationStatus.SHORTLISTED]: 'Shortlisted',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.HIRED]: 'Hired',
};

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.APPLIED]: [
    ApplicationStatus.REVIEWING,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.REVIEWING]: [
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.SHORTLISTED]: [
    ApplicationStatus.HIRED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.HIRED]: [],
};

function requiresConfirmation(status: ApplicationStatus): boolean {
  return status === ApplicationStatus.REJECTED || status === ApplicationStatus.HIRED;
}

export default function StatusSelect({
  applicationId,
  currentStatus,
}: StatusSelectProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = VALID_TRANSITIONS[currentStatus];
  const isTerminal = options.length === 0;

  const handleChange = async (newStatus: ApplicationStatus) => {
    setError(null);
    if (requiresConfirmation(newStatus)) {
      const msg =
        newStatus === ApplicationStatus.REJECTED
          ? 'Reject this application? This cannot be undone.'
          : 'Mark this candidate as hired? This cannot be undone.';
      if (!window.confirm(msg)) return;
    }

    const prev = status;
    setStatus(newStatus);
    setIsLoading(true);

    const result = await updateApplicationStatus(applicationId, newStatus);

    setIsLoading(false);
    if (result.error) {
      setStatus(prev);
      setError(result.error);
      return;
    }
    toast.success('Candidate status updated.');
  };

  if (isTerminal) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-foreground/10 text-foreground">
        {STATUS_LABELS[currentStatus]}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value as ApplicationStatus)}
          disabled={isLoading}
          className="text-sm px-3 py-1.5 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 min-w-[130px]"
          aria-label="Application status"
        >
          <option value={currentStatus}>{STATUS_LABELS[currentStatus]}</option>
          {options.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-foreground/60" aria-hidden />
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
