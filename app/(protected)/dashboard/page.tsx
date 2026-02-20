import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { requireUser } from '@/lib/rbac';
import { Role } from '@prisma/client';
import { db } from '@/lib/db';
import {
  getSavedJobs,
  getJobPreferences,
  getRecommendedJobs,
  getLatestJobs,
} from '@/app/actions/job-interaction';
import { getUserApplications } from '@/services/application.service';
import JobCard from '@/components/job-card';
import { JobType } from '@prisma/client';
import { Settings2 } from 'lucide-react';

/** Active = not rejected (still in progress or hired). */
function getActiveApplicationCount(
  applications: Awaited<ReturnType<typeof getUserApplications>>
): number {
  return applications.filter((a) => a.status !== 'REJECTED').length;
}

/**
 * Profile strength: 4 items (Resume, Photo, Skills, Employment), 25% each.
 */
function getProfileStrength(profile: {
  resumeUrl: string | null;
  avatarUrl: string | null;
  skills: string[];
  employment: { id: string }[];
} | null): { percent: number; missing: string[] } {
  if (!profile) return { percent: 0, missing: ['Resume', 'Photo', 'Skills', 'Employment'] };
  const hasResume = Boolean(profile.resumeUrl?.trim());
  const hasPhoto = Boolean(profile.avatarUrl?.trim());
  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
  const hasEmployment = Array.isArray(profile.employment) && profile.employment.length > 0;
  const missing: string[] = [];
  if (!hasResume) missing.push('Resume');
  if (!hasPhoto) missing.push('Photo');
  if (!hasSkills) missing.push('Skills');
  if (!hasEmployment) missing.push('Employment');
  const count = [hasResume, hasPhoto, hasSkills, hasEmployment].filter(Boolean).length;
  return { percent: Math.round((count / 4) * 100), missing };
}

/**
 * Candidate Dashboard – 3-column layout.
 * Protected: USER (candidate) only. Employers redirect to /employer.
 */
export default async function CandidateDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/dashboard');
  if (user.role === Role.EMPLOYER) redirect('/employer');
  if (user.role === Role.ADMIN) redirect('/admin');

  const authUser = requireUser(user);

  const [profile, applications, savedResult, prefsResult, recommendedResult] =
    await Promise.all([
      db.profile.findUnique({
        where: { userId: user.id },
        select: {
          fullName: true,
          avatarUrl: true,
          resumeHeadline: true,
          degree: true,
          college: true,
          location: true,
          currentLocation: true,
          resumeUrl: true,
          skills: true,
          employment: { select: { id: true } },
        },
      }),
      getUserApplications(authUser),
      getSavedJobs(),
      getJobPreferences(),
      getRecommendedJobs(),
    ]);

  const activeApplicationsCount = getActiveApplicationCount(applications);
  const savedJobs = (savedResult.jobs ?? []).slice(0, 3);
  const preferences = prefsResult.preferences ?? null;
  const hasPreferences =
    preferences &&
    (preferences.locations.length > 0 ||
      preferences.titles.length > 0 ||
      preferences.workModes.length > 0);
  const recommendedJobs = recommendedResult.jobs ?? [];
  const showLatestFallback = hasPreferences && recommendedJobs.length === 0;
  const latestResult = showLatestFallback ? await getLatestJobs(15) : null;
  const latestJobs = latestResult?.jobs ?? [];

  const displayJobs = showLatestFallback ? latestJobs : recommendedJobs;
  const sectionTitle = showLatestFallback
    ? 'Latest Jobs'
    : hasPreferences
      ? 'Jobs Recommended for You'
      : 'Latest Jobs';

  const { percent: profileStrengthPercent, missing: profileMissing } =
    getProfileStrength(profile);

  const displayName = profile?.fullName ?? user.email.split('@')[0] ?? 'User';
  const headline =
    profile?.resumeHeadline?.trim() ||
    (profile?.degree && profile?.college
      ? `${profile.degree} · ${profile.college}`
      : null);
  const location = profile?.currentLocation?.trim() || profile?.location?.trim() || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: User snapshot */}
          <aside className="space-y-6">
            <div className="rounded-lg border border-foreground/10 bg-background p-6">
              <div className="flex flex-col items-center text-center">
                {profile?.avatarUrl ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-foreground/5 mb-3">
                    <Image
                      src={profile.avatarUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center text-2xl font-bold text-foreground/60 mb-3">
                    {displayName.charAt(0)}
                  </div>
                )}
                <h2 className="font-semibold text-foreground">{displayName}</h2>
                {headline && (
                  <p className="text-sm text-foreground/70 mt-0.5 line-clamp-2">
                    {headline}
                  </p>
                )}
                {location && (
                  <p className="text-xs text-foreground/60 mt-1">{location}</p>
                )}
                <Link
                  href="/profile"
                  className="mt-3 text-sm font-medium text-foreground/80 hover:underline"
                >
                  View full profile →
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-background p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                My Status
              </h3>
              <p className="text-2xl font-bold text-foreground mb-1">
                {activeApplicationsCount}
              </p>
              <p className="text-xs text-foreground/60 mb-2">Active Applications</p>
              <Link
                href="/applications"
                className="text-sm font-medium text-foreground/80 hover:text-foreground hover:underline"
              >
                View All Applications →
              </Link>
            </div>
            <div className="rounded-lg border border-foreground/10 bg-background p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Saved Jobs
              </h3>
              {savedJobs.length === 0 ? (
                <p className="text-sm text-foreground/60">
                  No saved jobs yet. Browse jobs to save them.
                </p>
              ) : (
                <ul className="space-y-3">
                  {savedJobs.map((job) => (
                    <li key={job.id}>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="block text-sm font-medium text-foreground/90 hover:text-foreground hover:underline line-clamp-1"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-foreground/60">{job.company.name}</p>
                      {job.location && (
                        <p className="text-xs text-foreground/50">{job.location}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {savedJobs.length > 0 && (
                <Link
                  href="/jobs?saved=true"
                  className="mt-2 inline-block text-xs font-medium text-foreground/70 hover:underline"
                >
                  View all saved →
                </Link>
              )}
            </div>
          </aside>

          {/* Column 2: Search + Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-foreground/10 bg-background p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Job Search
              </h3>
              <form
                action="/jobs"
                method="get"
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="search"
                  name="query"
                  placeholder="Job Title or Keyword"
                  className="flex-1 px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm"
                />
                <input
                  type="number"
                  name="exp"
                  min="0"
                  placeholder="Exp (Yrs)"
                  className="w-full sm:w-24 px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm"
                />
                <input
                  type="text"
                  name="loc"
                  placeholder="Location"
                  className="w-full sm:w-36 px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-foreground text-background rounded-md font-medium text-sm hover:opacity-90"
                >
                  Search
                </button>
              </form>
            </div>

            {!hasPreferences && (
              <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-4">
                <p className="text-sm text-foreground/80">
                  Get better recommendations by setting your{' '}
                  <Link
                    href="/preferences"
                    className="font-medium text-foreground underline hover:no-underline"
                  >
                    Job Preferences
                  </Link>
                  .
                </p>
              </div>
            )}

            <section>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {sectionTitle}
                </h3>
                {hasPreferences && (
                  <Link
                    href="/preferences"
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
                    title="Edit preferences"
                  >
                    <Settings2 className="w-4 h-4" />
                    Edit Preferences
                  </Link>
                )}
              </div>
              {displayJobs.length === 0 ? (
                <p className="text-sm text-foreground/60 py-4">
                  No jobs to show. Try setting preferences or search above.
                </p>
              ) : (
                <ul className="space-y-4">
                  {displayJobs.map((job) => (
                    <li key={job.id}>
                      <JobCard
                        jobId={job.id}
                        title={job.title}
                        location={job.location}
                        jobType={job.jobType as JobType}
                        salaryMin={job.salaryMin}
                        salaryMax={job.salaryMax}
                        companyName={job.company.name}
                        createdAt={job.createdAt}
                        isSaved={false}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Column 3: Profile Completeness */}
          <div className="hidden lg:block">
            <div className="rounded-lg border border-foreground/10 bg-background p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Profile Completeness
              </h3>
              <p className="text-2xl font-bold text-foreground text-center">
                {profileStrengthPercent}%
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground transition-all"
                  style={{ width: `${profileStrengthPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-foreground/60 text-center">
                Profile Strength
              </p>
              {profileMissing.length > 0 ? (
                <Link
                  href="/profile"
                  className="mt-3 block text-xs text-foreground/70 hover:underline text-center"
                >
                  Add {profileMissing[0]}
                  {profileMissing.length > 1
                    ? ` and ${profileMissing.length - 1} more`
                    : ''}{' '}
                  to reach 100%
                </Link>
              ) : (
                <p className="mt-3 text-xs text-foreground/60 text-center">
                  Your profile is complete.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
