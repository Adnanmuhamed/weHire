import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { apiGet } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import ApplyCTA from '@/components/apply-cta';
import { JobType } from '@prisma/client';

/**
 * Job Details Page
 * 
 * Server Component that displays full job details.
 * Public page - no authentication required.
 */

interface JobDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  status: string;
  salaryMin: number | null;
  salaryMax: number | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    location: string | null;
    website: string | null;
  };
}

interface PageProps {
  params: Promise<{ jobId: string }>;
}

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERN: 'Intern',
  CONTRACT: 'Contract',
  REMOTE: 'Remote',
};

function formatSalary(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Not specified';
  if (min === null) return `Up to $${max!.toLocaleString()}`;
  if (max === null) return `$${min.toLocaleString()}+`;
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

function formatDate(date: string): string {
  const jobDate = new Date(date);
  return jobDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function JobDetailsPage({ params }: PageProps) {
  const { jobId } = await params;

  // Get base URL for API calls
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  // Fetch job details
  let job: JobDetails;
  try {
    const response = await apiGet<{ job: JobDetails }>(`${baseUrl}/api/jobs/${jobId}`);
    job = response.job;
  } catch (error) {
    // Handle 404 or other errors
    const apiError = error as Error & { status?: number };
    if (apiError.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-6 transition-colors"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Job Listings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {job.title}
            </h1>
            <p className="text-xl text-foreground/70 font-medium">{job.company.name}</p>
          </div>

          {/* Job Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-6">
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
              <span>{job.location}</span>
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
              <span>{jobTypeLabels[job.jobType]}</span>
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
              <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Posted {formatDate(job.createdAt)}</span>
            </div>
          </div>

          {/* Apply CTA */}
          <div className="mt-6">
            <ApplyCTA jobId={jobId} isAuthenticated={!!(await getCurrentUser())} />
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-8 p-6 border border-foreground/10 rounded-lg bg-foreground/5">
          <h2 className="text-lg font-semibold text-foreground mb-2">About the Company</h2>
          <p className="text-foreground/70">{job.company.name}</p>
          {job.company.location && (
            <p className="text-sm text-foreground/60 mt-1">{job.company.location}</p>
          )}
          {job.company.website && (
            <a
              href={job.company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground/70 hover:text-foreground mt-2 inline-block"
            >
              Visit website →
            </a>
          )}
        </div>

        {/* Job Description */}
        <div className="prose prose-sm max-w-none">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Job Description</h2>
          <div
            className="text-foreground/80 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }}
          />
        </div>
      </div>
    </div>
  );
}

