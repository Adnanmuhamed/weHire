import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getJobById } from '@/app/actions/public-job';
import { db } from '@/lib/db';
import { JobType, Role } from '@prisma/client';
import { Briefcase, MapPin, Calendar, IndianRupee, User, ExternalLink, Building2, Tag, Layers, GraduationCap, Globe, Bookmark } from 'lucide-react';
import ApplyButton from '@/components/apply-button';
import { formatToLPA } from '@/lib/utils/format-salary';

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

const workModeLabels: Record<string, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

function formatSalary(min: number | null, max: number | null): string {
  return formatToLPA(min, max);
}


export default async function JobDetailsPage({ params }: PageProps) {
  const { jobId } = await params;
  const user = await getCurrentUser();

  // Fetch job details including ownerId to check access
  const rawJob = await db.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      jobType: true,
      workMode: true,
      salaryMin: true,
      salaryMax: true,
      minExperience: true,
      maxExperience: true,
      degreeRequired: true,
      degree: true,
      qualification: true,
      jobRole: true,
      skillsRequired: true,
      languagesKnown: true,
      industryType: true,
      department: true,
      createdAt: true,
      status: true,
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          website: true,
          location: true,
          ownerId: true,
        },
      },
    },
  });
  
  if (!rawJob) {
    notFound();
  }

  // Allow access if job is OPEN, OR if current user is the owner
  const isOwner = user?.id === rawJob.company.ownerId;
  if (rawJob.status !== 'OPEN' && !isOwner) {
    notFound();
  }

  const { status, ...job } = rawJob;

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
                  href={`/company/${job.company.id}`}
                  className="text-xl text-foreground/70 font-medium hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  {job.company.name}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Job Meta Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 border-y border-foreground/10 py-8">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Salary (LPA)</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Experience</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <User className="w-4 h-4 text-primary" />
                    <span>
                      {(job.minExperience !== null || job.maxExperience !== null) ? (
                        <>
                          {job.minExperience ?? 0}
                          {job.maxExperience !== null ? `–${job.maxExperience}` : '+'} years
                        </>
                      ) : 'Any'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Work Mode</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>{workModeLabels[job.workMode] || job.workMode}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Education</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span className="truncate" title={job.qualification || job.degreeRequired || job.degree || 'Any'}>
                      {job.qualification || job.degreeRequired || job.degree || 'Any'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Industry</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>{job.industryType || 'Not specified'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Department</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>{job.department || 'Not specified'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Job Role</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Tag className="w-4 h-4 text-primary" />
                    <span>{job.jobRole || 'Not specified'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Location</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="truncate" title={job.location}>{job.location}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Job Type</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span>{jobTypeLabels[job.jobType]}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Languages</p>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="truncate" title={job.languagesKnown?.join(', ') || 'Not specified'}>
                      {job.languagesKnown && job.languagesKnown.length > 0
                        ? job.languagesKnown.join(', ')
                        : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div className="py-6 border-b border-foreground/10">
                  <h3 className="text-sm font-semibold text-foreground/40 uppercase tracking-wider mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-foreground/5 text-foreground/80 rounded-full text-sm font-medium border border-foreground/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-foreground/50">
                <Calendar className="w-3.5 h-3.5" />
                <span>Posted {formatRelativeTime(job.createdAt)}</span>
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
                <div className="flex flex-col gap-3">
                  <Link
                    href={`/company/${job.company.id}`}
                    className="font-medium text-foreground hover:text-foreground/80 hover:underline transition-colors block"
                  >
                    {job.company.name}
                  </Link>
                  {job.company.location && (
                    <p className="text-sm text-foreground/70 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.company.location}
                    </p>
                  )}
                  {job.company.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/70 hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                      Visit website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <Link
                    href={`/company/${job.company.id}`}
                    className="text-sm text-foreground/70 hover:text-foreground mt-2 inline-flex items-center gap-1 transition-colors font-medium border border-foreground/10 px-3 py-1.5 rounded-md hover:bg-foreground/5 w-fit"
                  >
                    View Company Profile →
                  </Link>
                </div>
              </div>

              {/* Apply CTA */}
              <div className="sticky top-24">
                <ApplyButton jobId={jobId} hasApplied={hasApplied} jobTitle={job.title} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

