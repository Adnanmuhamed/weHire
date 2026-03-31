'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { JobStatus } from '@prisma/client';
import { updateJobStatus } from '@/app/actions/job';

interface JobStatusToggleProps {
  jobId: string;
  currentStatus: JobStatus;
}

const STATUS_OPTIONS: { value: JobStatus; label: string; color: string }[] = [
  { value: 'OPEN',   label: 'Open',   color: '#10b981' },
  { value: 'PAUSED', label: 'Paused', color: '#f59e0b' },
  { value: 'CLOSED', label: 'Closed', color: '#ef4444' },
  { value: 'DRAFT',  label: 'Draft',  color: '#6b7280' },
];

const STATUS_STYLES: Record<JobStatus, string> = {
  OPEN:   'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  PAUSED: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  CLOSED: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  DRAFT:  'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700',
};

export default function JobStatusToggle({ jobId, currentStatus }: JobStatusToggleProps) {
  const [status, setStatus] = useState<JobStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: JobStatus) => {
    if (newStatus === status || isPending) return;

    const label = STATUS_OPTIONS.find((o) => o.value === newStatus)?.label;
    if (newStatus === 'CLOSED') {
      if (!window.confirm(`Close this job? Candidates will no longer be able to apply.`)) return;
    }

    const prev = status;
    setStatus(newStatus);
    startTransition(async () => {
      const result = await updateJobStatus(jobId, newStatus);
      if (result.error) {
        setStatus(prev);
        toast.error(result.error);
      } else {
        toast.success(`Job status updated to ${label}`);
      }
    });
  };

  return (
    <div className="relative inline-flex">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as JobStatus)}
        disabled={isPending}
        className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
          disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200
          ${STATUS_STYLES[status]}`}
        aria-label="Job status"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Custom chevron */}
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}
