'use client';

import { ApplicationStatus } from '@prisma/client';
import ApplicationStatusSelect from './application-status-select';

/**
 * Application Row Component
 * 
 * Displays a single application in a table row.
 * Includes interactive status selector for employers.
 */

interface ApplicationRowProps {
  applicationId: string;
  candidateEmail: string;
  candidateName: string | null;
  status: ApplicationStatus;
  appliedDate: string;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedLocal = localPart.length > 2
    ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`
    : localPart;
  
  return `${maskedLocal}@${domain}`;
}

export default function ApplicationRow({
  applicationId,
  candidateEmail,
  candidateName,
  status,
  appliedDate,
}: ApplicationRowProps) {
  const displayName = candidateName || maskEmail(candidateEmail);

  return (
    <tr className="hover:bg-foreground/5 transition-colors">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-foreground">
          <div className="font-medium">{displayName}</div>
          {candidateName && (
            <div className="text-xs text-foreground/60">{maskEmail(candidateEmail)}</div>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <ApplicationStatusSelect
          applicationId={applicationId}
          currentStatus={status}
        />
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground/60">
        {formatDate(appliedDate)}
      </td>
    </tr>
  );
}

