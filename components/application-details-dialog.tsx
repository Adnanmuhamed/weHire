'use client';

/**
 * Application Details Dialog Component
 * 
 * Client Component that displays detailed information about a job application
 * in a modal dialog.
 */

import { X, Calendar, FileText, ExternalLink, Briefcase } from 'lucide-react';
import { ApplicationStatus } from '@prisma/client';
import ApplicationStatusBadge from './application-status-badge';
import Link from 'next/link';

interface ApplicationDetailsDialogProps {
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

export default function ApplicationDetailsDialog({
  isOpen,
  onClose,
  application,
}: ApplicationDetailsDialogProps) {
  if (!isOpen || !application) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-background border border-foreground/10 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-foreground/10">
            <h2 className="text-2xl font-bold text-foreground">Application Details</h2>
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

            {/* Status Badge - Large */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Status:</span>
              <div className="scale-125">
                <ApplicationStatusBadge status={application.status} />
              </div>
            </div>

            {/* Applied Date */}
            <div className="pt-4 border-t border-foreground/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-foreground/60" />
                <span className="text-sm font-medium text-foreground">Applied on</span>
              </div>
              <p className="text-sm text-foreground/80">{formatDate(application.appliedDate)}</p>
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
                  <blockquote className="p-4 bg-foreground/5 rounded-md border-l-4 border-foreground/20">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {application.coverNote}
                    </p>
                  </blockquote>
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-md text-sm font-medium text-foreground transition-colors"
                  >
                    View Attached Resume
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <p className="text-sm text-foreground/60 italic">No resume attached</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-foreground/10">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-foreground/20 rounded-md font-medium text-foreground hover:bg-foreground/5 transition-colors"
            >
              Close
            </button>
            <Link
              href={`/jobs/${application.jobId}`}
              className="px-6 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              View Job Posting
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

