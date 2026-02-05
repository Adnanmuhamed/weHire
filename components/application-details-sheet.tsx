'use client';

/**
 * Application Details Sheet Component
 * 
 * Client Component that displays detailed information about a job application
 * in a slide-over sheet/dialog.
 */

import { X, Calendar, FileText, ExternalLink, Briefcase } from 'lucide-react';
import { ApplicationStatus } from '@prisma/client';
import ApplicationStatusBadge from './application-status-badge';
import Link from 'next/link';

interface ApplicationDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    status: ApplicationStatus;
    coverNote: string | null;
    appliedDate: Date;
    resumeUrl: string | null;
  } | null;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ApplicationDetailsSheet({
  isOpen,
  onClose,
  application,
}: ApplicationDetailsSheetProps) {
  if (!isOpen || !application) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-background border-l border-foreground/10 z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-foreground/10">
          <h2 className="text-xl font-semibold text-foreground">Application Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-foreground/10 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-foreground/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Job Title & Company */}
          <div>
            <Link
              href={`/jobs/${application.jobId}`}
              className="block group"
            >
              <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:underline">
                {application.jobTitle}
              </h3>
              <div className="flex items-center gap-2 text-foreground/70">
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">{application.companyName}</span>
              </div>
            </Link>
          </div>

          {/* Timeline */}
          <div className="space-y-4 pt-4 border-t border-foreground/10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-foreground/60" />
                <span className="text-sm font-medium text-foreground">Date Applied</span>
              </div>
              <p className="text-sm text-foreground/80">{formatDate(application.appliedDate)}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground">Current Status</span>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </div>
          </div>

          {/* My Submission */}
          <div className="pt-4 border-t border-foreground/10 space-y-4">
            <h4 className="text-lg font-semibold text-foreground">My Submission</h4>

            {/* Cover Note */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-foreground/60" />
                <span className="text-sm font-medium text-foreground">Cover Note</span>
              </div>
              {application.coverNote ? (
                <div className="p-4 bg-foreground/5 rounded-md border border-foreground/10">
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                    {application.coverNote}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-foreground/60 italic">No cover note provided</p>
              )}
            </div>

            {/* Resume */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-foreground/60" />
                <span className="text-sm font-medium text-foreground">Resume</span>
              </div>
              {application.resumeUrl ? (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-md text-sm text-foreground transition-colors"
                >
                  View Resume
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p className="text-sm text-foreground/60 italic">No resume attached</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

