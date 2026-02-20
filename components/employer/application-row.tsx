'use client';

import Link from 'next/link';
import { ApplicationStatus } from '@prisma/client';
import StatusSelect from './status-select';
import { ExternalLink } from 'lucide-react';

/**
 * Application Row Component
 * 
 * Displays a single application in a table row.
 * Includes interactive status selector and View Resume link.
 */

interface ApplicationRowProps {
  applicationId: string;
  candidateEmail: string;
  candidateName: string | null;
  candidateMobile: string | null;
  resumeUrl: string | null;
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
  candidateMobile,
  resumeUrl,
  status,
  appliedDate,
}: ApplicationRowProps) {
  const displayName = candidateName || maskEmail(candidateEmail);
  const mobile = candidateMobile || null;

  return (
    <tr className="hover:bg-foreground/5 transition-colors">
      <td className="px-4 py-4">
        <div className="text-sm text-foreground">
          <Link
            href={`/employer/applications/${applicationId}`}
            className="font-medium text-foreground hover:underline"
          >
            {displayName}
          </Link>
          <div className="text-xs text-foreground/60">{candidateEmail}</div>
          {mobile && (
            <div className="text-xs text-foreground/60">{mobile}</div>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground/60">
        {formatDate(appliedDate)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <StatusSelect applicationId={applicationId} currentStatus={status} />
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <Link
          href={`/employer/applications/${applicationId}`}
          className="inline-flex items-center gap-1 text-sm text-foreground hover:underline"
        >
          View profile
          <ExternalLink className="w-3 h-3" />
        </Link>
      </td>
    </tr>
  );
}

