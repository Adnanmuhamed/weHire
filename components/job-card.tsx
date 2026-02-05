'use client';

import Link from 'next/link';
import { JobType } from '@prisma/client';
import { Bookmark } from 'lucide-react';
import { toggleSavedJobAction } from '@/app/actions/saved-job';
import { useState } from 'react';

/**
 * Job Card Component
 * 
 * Stateless UI component for displaying job information.
 * Clean card design with hover effects and accessible markup.
 */

export interface JobCardProps {
  jobId: string;
  title: string;
  location: string;
  jobType: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  companyName: string;
  createdAt: Date;
  isSaved?: boolean;
}

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERN: 'Intern',
  CONTRACT: 'Contract',
  REMOTE: 'Remote',
};

function formatDate(date: Date): string {
  const now = new Date();
  const jobDate = new Date(date);
  const diffInMs = now.getTime() - jobDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function formatSalary(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Salary not specified';
  if (min === null) return `Up to $${max!.toLocaleString()}`;
  if (max === null) return `$${min.toLocaleString()}+`;
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

export default function JobCard({
  jobId,
  title,
  location,
  jobType,
  salaryMin,
  salaryMax,
  companyName,
  createdAt,
  isSaved = false,
}: JobCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [isToggling, setIsToggling] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      const result = await toggleSavedJobAction(jobId);
      if (result.success !== undefined) {
        setSaved(result.isSaved || false);
      }
    } catch (error) {
      console.error('Failed to toggle saved job:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative p-6 border border-foreground/10 rounded-lg bg-background hover:border-foreground/20 hover:shadow-md transition-all">
      {/* Bookmark Button */}
      <button
        onClick={handleBookmarkClick}
        disabled={isToggling}
        className="absolute top-4 right-4 p-2 rounded-md hover:bg-foreground/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
        aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
      >
        <Bookmark
          className={`w-5 h-5 ${
            saved
              ? 'fill-foreground text-foreground'
              : 'text-foreground/60'
          }`}
        />
      </button>

      <Link href={`/jobs/${jobId}`}>
        <article>
          <div className="flex flex-col space-y-4">
            {/* Header */}
            <div className="pr-10">
              <h3 className="text-xl font-semibold text-foreground mb-1 hover:underline">
                {title}
              </h3>
              <p className="text-foreground/70 font-medium">{companyName}</p>
            </div>

        {/* Details */}
        <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{location}</span>
          </div>

          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>{jobTypeLabels[jobType]}</span>
          </div>

          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formatSalary(salaryMin, salaryMax)}</span>
          </div>
        </div>

          {/* Footer */}
          <div className="pt-2 border-t border-foreground/10">
            <p className="text-xs text-foreground/50">Posted {formatDate(createdAt)}</p>
          </div>
        </div>
      </article>
      </Link>
    </div>
  );
}

