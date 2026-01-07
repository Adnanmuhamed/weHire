'use client';

/**
 * Application Status Selector Component
 * 
 * Client Component for updating application status.
 * Handles valid transitions, confirmation, optimistic updates, and error handling.
 */

import { useState, useTransition } from 'react';
import { ApplicationStatus } from '@prisma/client';
import { apiPatch } from '@/lib/api';
import ApplicationStatusBadge from '@/components/application-status-badge';

interface ApplicationStatusSelectProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  onStatusUpdate?: (newStatus: ApplicationStatus) => void;
}

/**
 * Valid status transitions (UI-level for UX only)
 * Backend enforces the real rules
 */
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
  [ApplicationStatus.REJECTED]: [], // Terminal state
  [ApplicationStatus.HIRED]: [], // Terminal state
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.APPLIED]: 'Applied',
  [ApplicationStatus.REVIEWING]: 'Reviewing',
  [ApplicationStatus.SHORTLISTED]: 'Shortlisted',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.HIRED]: 'Hired',
};

/**
 * Check if status requires confirmation
 */
function requiresConfirmation(status: ApplicationStatus): boolean {
  return status === ApplicationStatus.REJECTED || status === ApplicationStatus.HIRED;
}

/**
 * Get confirmation message for status change
 */
function getConfirmationMessage(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): string {
  if (newStatus === ApplicationStatus.REJECTED) {
    return `Are you sure you want to reject this application? This action cannot be undone.`;
  }
  if (newStatus === ApplicationStatus.HIRED) {
    return `Are you sure you want to mark this candidate as hired? This action cannot be undone.`;
  }
  return `Change application status from "${STATUS_LABELS[currentStatus]}" to "${STATUS_LABELS[newStatus]}"?`;
}

export default function ApplicationStatusSelect({
  applicationId,
  currentStatus,
  onStatusUpdate,
}: ApplicationStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const validTransitions = VALID_TRANSITIONS[currentStatus];
  const isTerminal = validTransitions.length === 0;

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    // Reset error
    setError(null);

    // Check if confirmation is required
    if (requiresConfirmation(newStatus)) {
      const confirmed = window.confirm(
        getConfirmationMessage(currentStatus, newStatus)
      );
      if (!confirmed) {
        // Reset select to current status
        setSelectedStatus(currentStatus);
        return;
      }
    }

    // Optimistic update
    const previousStatus = selectedStatus;
    setSelectedStatus(newStatus);

    // Call API
    startTransition(async () => {
      try {
        await apiPatch(`/api/applications/${applicationId}`, {
          status: newStatus,
        });

        // Success - notify parent if callback provided
        if (onStatusUpdate) {
          onStatusUpdate(newStatus);
        }
      } catch (err) {
        // Revert optimistic update on failure
        setSelectedStatus(previousStatus);

        // Extract error message
        const apiError = err as Error & { status?: number };
        if (apiError.status === 400) {
          setError(apiError.message || 'Invalid status transition');
        } else if (apiError.status === 403) {
          setError('You do not have permission to update this application');
        } else if (apiError.status === 404) {
          setError('Application not found');
        } else {
          setError('Failed to update status. Please try again.');
        }
      }
    });
  };

  if (isTerminal) {
    // Terminal state - show badge only
    return (
      <div className="flex items-center gap-2">
        <ApplicationStatusBadge status={currentStatus} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <ApplicationStatusBadge status={selectedStatus} />
        <div className="flex items-center gap-1">
          <select
            value={selectedStatus}
            onChange={(e) => {
              const newStatus = e.target.value as ApplicationStatus;
              handleStatusChange(newStatus);
            }}
            disabled={isPending}
            className="text-xs px-2 py-1 border border-foreground/20 rounded bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            aria-label="Update application status"
          >
            <option value={currentStatus}>{STATUS_LABELS[currentStatus]}</option>
            {validTransitions.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {isPending && (
            <svg
              className="w-4 h-4 animate-spin text-foreground/60 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 whitespace-normal" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

