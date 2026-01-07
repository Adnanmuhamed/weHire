'use client';

/**
 * Apply Form Component
 * 
 * Client Component for submitting job applications.
 * Handles form submission, validation, and success states.
 */

import { useState, FormEvent } from 'react';
import { apiPost } from '@/lib/api';

interface ApplyFormProps {
  jobId: string;
  onCancel: () => void;
}

export default function ApplyForm({ jobId, onCancel }: ApplyFormProps) {
  const [coverNote, setCoverNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiPost(`/api/jobs/${jobId}/applications`, {
        coverNote: coverNote.trim() || undefined,
      });

      setIsSuccess(true);
    } catch (err) {
      const apiError = err as Error & { status?: number; code?: string };
      
      // Handle duplicate application error
      if (apiError.status === 409 || apiError.code === 'DUPLICATE_APPLICATION') {
        setError('You have already applied to this job.');
      } else if (apiError.status === 403) {
        setError('You cannot apply to your own job posting.');
      } else if (apiError.status === 404) {
        setError('Job not found or no longer accepting applications.');
      } else {
        setError(apiError.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
              Application Submitted!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Your application has been successfully submitted. The employer will review it and get back to you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border border-foreground/10 rounded-lg bg-foreground/5">
      <h3 className="text-lg font-semibold text-foreground mb-4">Apply for this Job</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md"
            role="alert"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="coverNote"
            className="block text-sm font-medium mb-2"
          >
            Cover Note <span className="text-foreground/50">(optional)</span>
          </label>
          <textarea
            id="coverNote"
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            rows={6}
            maxLength={5000}
            placeholder="Tell the employer why you're a great fit for this position..."
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent resize-y"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-foreground/60">
            {coverNote.length} / 5000 characters
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-foreground/20 rounded-md font-medium hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

