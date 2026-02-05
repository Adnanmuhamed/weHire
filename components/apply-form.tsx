'use client';

/**
 * Apply Form Component
 * 
 * Client Component for submitting job applications.
 * Shows resume URL from profile and uses server action.
 */

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitApplication } from '@/app/actions/application';
import { FileText, Link as LinkIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ApplyFormProps {
  jobId: string;
  onCancel: () => void;
  userId: string;
}

export default function ApplyForm({ jobId, onCancel, userId }: ApplyFormProps) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(true);

  // Fetch user's resume URL from profile
  useEffect(() => {
    async function fetchResumeUrl() {
      try {
        const response = await fetch('/api/profile/resume');
        if (response.ok) {
          const data = await response.json();
          setResumeUrl(data.resumeUrl);
        }
      } catch (err) {
        // Ignore errors - resume is optional
      } finally {
        setIsLoadingResume(false);
      }
    }
    fetchResumeUrl();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await submitApplication({
        jobId,
        coverNote: coverNote.trim() || null,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setIsSuccess(true);
        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-600 dark:bg-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
              Application Submitted!
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Your application has been successfully submitted. The employer will review it and get back to you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-foreground/10 bg-background p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Apply for this Job</h3>
        <p className="text-sm text-foreground/70">
          Complete your application below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Resume Display */}
        <div className="p-4 border border-foreground/10 rounded-md bg-foreground/5">
          <label className="block text-sm font-medium text-foreground mb-2">
            Resume
          </label>
          {isLoadingResume ? (
            <p className="text-sm text-foreground/60">Loading...</p>
          ) : resumeUrl ? (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-foreground/60" />
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                View Resume
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-foreground/60">
                No resume uploaded yet
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                <LinkIcon className="w-3 h-3" />
                Update Profile to add resume
              </Link>
            </div>
          )}
        </div>

        {/* Cover Note */}
        <div>
          <label
            htmlFor="coverNote"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Cover Note <span className="text-foreground/50 font-normal">(optional)</span>
          </label>
          <textarea
            id="coverNote"
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            rows={6}
            maxLength={5000}
            placeholder="Tell the employer why you're a great fit for this position..."
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent resize-y"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-foreground/60">
            {coverNote.length} / 5000 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-foreground/20 rounded-md font-medium text-foreground hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
