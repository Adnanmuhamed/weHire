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
import { toast } from 'sonner';
import Link from 'next/link';
import FileUpload from '@/components/file-upload';

interface ApplyFormProps {
  jobId: string;
  jobTitle?: string;
  onCancel: () => void;
  userId: string;
}

export default function ApplyForm({ jobId, jobTitle, onCancel, userId }: ApplyFormProps) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null);
  const [coverLetterName, setCoverLetterName] = useState<string | null>(null);
  const [replaceResume, setReplaceResume] = useState(false);
  const [replaceCoverLetter, setReplaceCoverLetter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(true);

  // Fetch user's resume URL from profile
  useEffect(() => {
    async function fetchResumeUrl() {
      try {
        const response = await fetch('/api/profile/resume');
        if (response.ok) {
          const data = await response.json();
          setResumeUrl(data.resumeUrl);
          setResumeName(data.resumeName);
          setCoverLetterUrl(data.coverLetterUrl);
          setCoverLetterName(data.coverLetterName);
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
        resumeUrl,
        resumeName,
        coverLetterUrl,
        coverLetterName,
      });

      if (result.error) {
        setError(result.error);
      } else {
        toast.success("Application submitted successfully!");
        onCancel();
        router.refresh();
      }
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="rounded-lg border border-foreground/10 bg-background p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {jobTitle ? `Apply for ${jobTitle}` : 'Apply for this Job'}
        </h3>
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
          ) : !resumeUrl || replaceResume ? (
            <FileUpload 
              folder="resumes" 
              fileType="pdf" 
              onChange={(url, name) => {
                setResumeUrl(url);
                setResumeName(name || null);
                setReplaceResume(false);
              }} 
            />
          ) : (
            <div className="flex items-center justify-between gap-2 bg-background p-3 rounded-md border border-foreground/10">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors truncate block"
                  title={resumeName || 'View Resume'}
                >
                  {resumeName || 'View Resume'}
                </a>
              </div>
              <button
                type="button"
                onClick={() => setReplaceResume(true)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Replace for this job
              </button>
            </div>
          )}
        </div>

        {/* Cover Letter Display */}
        <div className="p-4 border border-foreground/10 rounded-md bg-foreground/5 mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Cover Letter
          </label>
          {isLoadingResume ? (
            <p className="text-sm text-foreground/60">Loading...</p>
          ) : !coverLetterUrl || replaceCoverLetter ? (
            <FileUpload 
              folder="cover-letters" 
              fileType="pdf" 
              onChange={(url, name) => {
                setCoverLetterUrl(url);
                setCoverLetterName(name || null);
                setReplaceCoverLetter(false);
              }} 
            />
          ) : (
            <div className="flex items-center justify-between gap-2 bg-background p-3 rounded-md border border-foreground/10">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                <a
                  href={coverLetterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors truncate block"
                  title={coverLetterName || 'View Cover Letter'}
                >
                  {coverLetterName || 'View Cover Letter'}
                </a>
              </div>
              <button
                type="button"
                onClick={() => setReplaceCoverLetter(true)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Replace for this job
              </button>
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
