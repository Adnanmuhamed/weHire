import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getJobById } from '@/services/job.service';
import { db } from '@/lib/db';
import ApplyCTA from '@/components/apply-cta';
import { JobType, Role } from '@prisma/client';
import { Briefcase, MapPin, Calendar, DollarSign, User, ExternalLink, Building2 } from 'lucide-react';

/**
 * Job Details Page
 * 
 * Server Component that displays full job details.
 * Public page - no authentication required.
 */

function formatRelativeTime(date: Date): string {
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


export default async function JobDetailsPage({ params }: PageProps) {
  const { jobId } = await params;
  const user = await getCurrentUser();

  // Fetch job details using service directly
  const job = await getJobById(jobId);
  
  if (!job) {
    notFound();
  }

  // Check if user has already applied (only for seekers)
  let hasApplied = false;
  if (user?.role === Role.USER) {
    const existingApplication = await db.application.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId: user.id,
        },
      },
    });
    hasApplied = !!existingApplication;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link
            href="/jobs"
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content (Left 2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {job.title}
                </h1>
                <Link
                  href={`/companies/${job.company.id}`}
                  className="text-xl text-foreground/70 font-medium hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  {job.company.name}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Job Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-foreground/60" />
                  <span>{job.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-foreground/60" />
                  <span>{jobTypeLabels[job.jobType]}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-foreground/60" />
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>

                {job.experience !== null && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-foreground/60" />
                    <span>{job.experience}+ years experience</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-foreground/60" />
                  <span>Posted {formatRelativeTime(job.createdAt)}</span>
                </div>
              </div>

              {/* Job Description */}
              <div className="pt-6 border-t border-foreground/10">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Job Description</h2>
                <div className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Sidebar (Right 1/3) */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Company Card */}
              <div className="rounded-lg border border-foreground/10 bg-background p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-foreground/70" />
                  <h3 className="text-lg font-semibold text-foreground">Company</h3>
                </div>
                <div>
                  <p className="font-medium text-foreground">{job.company.name}</p>
                  {job.company.location && (
                    <p className="text-sm text-foreground/70 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.company.location}
                    </p>
                  )}
                  {job.company.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/70 hover:text-foreground mt-2 inline-flex items-center gap-1 transition-colors"
                    >
                      Visit website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Apply CTA */}
              <div className="sticky top-24">
                <ApplyCTA
                  jobId={jobId}
                  currentUser={user}
                  hasApplied={hasApplied}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

