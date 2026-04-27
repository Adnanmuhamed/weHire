'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { JobType, WorkMode } from '@prisma/client';
import { Building2, MapPin, IndianRupee, Calendar } from 'lucide-react';
import { formatToLPA } from '@/lib/utils/format-salary';
import SaveJobButton from '@/components/jobs/save-job-button';

/**
 * Job Card Component
 * 
 * Centralized reusable UI component for displaying job information.
 * "Rich" version including company logo, description, and status badges.
 */

export interface JobCardProps {
  jobId: string;
  title: string;
  location: string;
  jobType: JobType;
  workMode?: WorkMode | string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  companyName: string;
  companyId: string;
  logoUrl?: string | null;
  description?: string | null;
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

const workModeLabels: Record<string, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatSalary(min: number | null, max: number | null): string {
  return formatToLPA(min, max);
}

export default function JobCard({
  jobId,
  title,
  location,
  jobType,
  workMode,
  salaryMin,
  salaryMax,
  companyName,
  companyId,
  logoUrl,
  description,
  createdAt,
  isSaved = false,
}: JobCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/jobs/${jobId}`)}
      className="border border-foreground/10 rounded-lg bg-background p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-12 h-12 rounded object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-foreground/10 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-foreground/40" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link
                href={`/jobs/${jobId}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-xl font-semibold text-foreground hover:underline mb-1 block truncate"
              >
                {title}
              </Link>
              <Link
                href={`/company/${companyId}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-foreground/70 font-medium hover:underline"
              >
                {companyName}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-foreground/60 mt-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4 shrink-0" />
              <span>{formatSalary(salaryMin, salaryMax)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{formatDate(createdAt)}</span>
            </div>
            <span className="px-2 py-1 bg-foreground/10 rounded text-xs">
              {jobTypeLabels[jobType]}
            </span>
            {workMode && (
              <span className="px-2 py-1 bg-foreground/10 rounded text-xs">
                {workModeLabels[workMode] || workMode}
              </span>
            )}
          </div>

          {description && (
            <p className="text-sm text-foreground/70 mt-3 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <div className="shrink-0 flex items-start gap-2">
          <SaveJobButton jobId={jobId} isSaved={isSaved} />
          <Link
            href={`/jobs/${jobId}`}
            onClick={(e) => e.stopPropagation()}
            className="px-4 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 transition-opacity text-sm whitespace-nowrap self-start"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
