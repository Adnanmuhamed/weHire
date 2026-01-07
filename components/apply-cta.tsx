'use client';

/**
 * Apply CTA Component
 * 
 * Client Component that shows apply button or redirects to login.
 * Auth status is passed from server to avoid client-side auth checks.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApplyForm from './apply-form';

interface ApplyCTAProps {
  jobId: string;
  isAuthenticated: boolean;
}

export default function ApplyCTA({ jobId, isAuthenticated }: ApplyCTAProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      // Redirect to login with redirect param
      router.push(`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }

    // Show apply form
    setShowForm(true);
  };

  // If form is shown, render form component
  if (showForm) {
    return <ApplyForm jobId={jobId} onCancel={() => setShowForm(false)} />;
  }

  // Show apply button
  return (
    <button
      onClick={handleApplyClick}
      className="w-full md:w-auto px-6 py-3 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-opacity"
    >
      Apply for this Job
    </button>
  );
}

