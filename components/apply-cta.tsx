'use client';

/**
 * Apply CTA Component
 * 
 * Smart component that handles different user states:
 * - Guest: "Sign in to Apply" button
 * - Employer: Hidden/disabled with tooltip
 * - Seeker & Already Applied: "Applied" badge (disabled)
 * - Seeker & Not Applied: "Apply Now" button -> Opens ApplyForm
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';
import { CheckCircle, LogIn, AlertCircle } from 'lucide-react';
import ApplyForm from './apply-form';

interface ApplyCTAProps {
  jobId: string;
  currentUser: {
    id: string;
    email: string;
    role: Role;
  } | null;
  hasApplied: boolean;
}

export default function ApplyCTA({ jobId, currentUser, hasApplied }: ApplyCTAProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  // Guest: Show "Sign in to Apply" button
  if (!currentUser) {
    return (
      <button
        onClick={() => {
          router.push(`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`);
        }}
        className="w-full px-6 py-3 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-opacity flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign in to Apply
      </button>
    );
  }

  // Employer: Hidden or disabled with tooltip
  if (currentUser.role === Role.EMPLOYER || currentUser.role === Role.ADMIN) {
    return (
      <div className="w-full px-6 py-3 border border-foreground/20 rounded-md bg-foreground/5 text-foreground/60 text-center flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Employers cannot apply</span>
      </div>
    );
  }

  // Seeker & Already Applied: Show "Applied" badge
  if (hasApplied) {
    return (
      <div className="w-full px-6 py-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md font-medium flex items-center justify-center gap-2 border border-green-200 dark:border-green-800">
        <CheckCircle className="w-4 h-4" />
        Applied
      </div>
    );
  }

  // Seeker & Not Applied: Show form or button
  if (showForm) {
    return <ApplyForm jobId={jobId} onCancel={() => setShowForm(false)} userId={currentUser.id} />;
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full px-6 py-3 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-opacity"
    >
      Apply Now
    </button>
  );
}
