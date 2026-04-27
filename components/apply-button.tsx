'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ApplyForm from '@/components/apply-form';
import { CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Apply Button Component
 * 
 * Client component for applying to jobs.
 * Handles authentication check, application submission, and state management.
 */

interface ApplyButtonProps {
  jobId: string;
  jobTitle?: string;
  hasApplied: boolean;
}

export default function ApplyButton({ jobId, jobTitle, hasApplied }: ApplyButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(hasApplied);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApply = async () => {
    // If we want to strictly require auth, we could do it here, but ApplyForm hits a server action which requires auth anyway
    setIsModalOpen(true);
  };

  if (applied) {
    return (
      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
          Application Submitted
        </h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          You have successfully applied for this position.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-foreground/10 bg-background p-6 space-y-4">
      <button
        onClick={handleApply}
        disabled={isSubmitting}
        className="w-full bg-foreground text-background py-3 px-4 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Applying...</span>
          </>
        ) : (
          'Apply Now'
        )}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <p className="text-xs text-foreground/60 text-center">
        By applying, you agree to share your profile with the employer.
      </p>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <ApplyForm 
              jobId={jobId} 
              jobTitle={jobTitle}
              userId="" 
              onCancel={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
