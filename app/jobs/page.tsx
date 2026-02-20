import { Suspense } from 'react';
import { getPublicJobs } from '@/app/actions/public-job';
import { getSalaryRangeForPreset } from '@/lib/job-constants';
import { getAllCompanies } from '@/app/actions/company-public';
import type { PublicJobFilters } from '@/app/actions/public-job';
import { JobType, WorkMode } from '@prisma/client';
import Link from 'next/link';
import { Building2, MapPin, DollarSign, Calendar } from 'lucide-react';
import FilterSidebar from '@/components/jobs/filter-sidebar';

/**
 * Public Job Board Page
 *
 * Main search page with top bar (query, exp, loc) and sidebar filters.
 * URL params: query, exp, loc, workMode, salary, jobType, degree, companyId.
 */

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatSalary(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Not specified';
  if (min === null) return `Up to ₹${max!.toLocaleString()}`;
  if (max === null) return `₹${min.toLocaleString()}+`;
  if (min === max) return `₹${min.toLocaleString()}`;
  return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
}

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERN: 'Intern',
  CONTRACT: 'Contract',
  REMOTE: 'Remote',
};

const workModeLabels: Record<WorkMode, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

function buildFilters(
  params: { [key: string]: string | string[] | undefined }
): PublicJobFilters {
  const get = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const getAll = (k: string) => {
    const v = params[k];
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };
  const query = get('query')?.trim() || get('search')?.trim();
  const location = get('loc')?.trim() || get('location')?.trim();
  const expRaw = get('exp');
  const expNum =
    expRaw !== undefined && expRaw !== ''
      ? Math.max(0, parseInt(expRaw, 10))
      : NaN;
  const experience = Number.isNaN(expNum) ? undefined : expNum;
  const workMode = getAll('workMode').filter((v): v is WorkMode =>
    ['REMOTE', 'HYBRID', 'ONSITE'].includes(v)
  );
  const jobType = getAll('jobType').filter((v): v is JobType =>
    ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'REMOTE'].includes(v)
  );
  const degree = get('degree')?.trim();
  const companyId = get('companyId')?.trim();
  const salaryPreset = get('salary');

  let salaryMin: number | undefined;
  let salaryMax: number | null | undefined;
  if (
    salaryPreset &&
    ['0-3', '3-6', '6-10', '10+'].includes(salaryPreset)
  ) {
    const range = getSalaryRangeForPreset(
      salaryPreset as '0-3' | '3-6' | '6-10' | '10+'
    );
    salaryMin = range.min;
    salaryMax = range.max;
  }

  const filters: PublicJobFilters = {};
  if (query) filters.search = query;
  if (location) filters.location = location;
  if (experience !== undefined && !Number.isNaN(experience))
    filters.experience = experience;
  if (workMode.length) filters.workMode = workMode;
  if (jobType.length) filters.jobType = jobType;
  if (degree) filters.degree = degree;
  if (companyId) filters.companyId = companyId;
  if (salaryMin !== undefined) filters.salaryMin = salaryMin;
  if (salaryMax !== undefined) filters.salaryMax = salaryMax;

  return filters;
}

async function JobList({ filters }: { filters: PublicJobFilters }) {
  const result = await getPublicJobs(filters);

  if (result.error) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/70">{result.error}</p>
      </div>
    );
  }

  const jobs = result.jobs || [];

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/70 mb-4">
          No jobs found matching your criteria.
        </p>
        <p className="text-sm text-foreground/60">
          Try adjusting your search filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="border border-foreground/10 rounded-lg bg-background p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                {job.company.logoUrl ? (
                  <img
                    src={job.company.logoUrl}
                    alt={job.company.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-foreground/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-foreground/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-xl font-semibold text-foreground hover:underline mb-1 block"
                  >
                    {job.title}
                  </Link>
                  <p className="text-foreground/70 font-medium">
                    {job.company.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-foreground/60 mt-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{formatDate(job.createdAt)}</span>
                </div>
                <span className="px-2 py-1 bg-foreground/10 rounded text-xs">
                  {jobTypeLabels[job.jobType]}
                </span>
                {job.workMode && (
                  <span className="px-2 py-1 bg-foreground/10 rounded text-xs">
                    {workModeLabels[job.workMode]}
                  </span>
                )}
              </div>

              <p className="text-sm text-foreground/70 mt-3 line-clamp-2">
                {job.description}
              </p>
            </div>

            <Link
              href={`/jobs/${job.id}`}
              className="px-4 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 transition-opacity text-sm whitespace-nowrap shrink-0 self-start"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedParams = await searchParams;
  const filters = buildFilters(resolvedParams);

  const query =
    typeof resolvedParams.query === 'string'
      ? resolvedParams.query
      : typeof resolvedParams.search === 'string'
        ? resolvedParams.search
        : '';
  const exp =
    typeof resolvedParams.exp === 'string' ? resolvedParams.exp : '';
  const loc =
    typeof resolvedParams.loc === 'string'
      ? resolvedParams.loc
      : typeof resolvedParams.location === 'string'
        ? resolvedParams.location
        : '';

  const [companiesResult] = await Promise.all([getAllCompanies()]);
  const companies = companiesResult.companies ?? [];

  // Collect hidden params to preserve when submitting the top search form
  const hiddenParams: { name: string; value: string }[] = [];
  const workModeArr = resolvedParams.workMode;
  (Array.isArray(workModeArr) ? workModeArr : workModeArr ? [workModeArr] : []).forEach(
    (v) => hiddenParams.push({ name: 'workMode', value: String(v) })
  );
  const jobTypeArr = resolvedParams.jobType;
  (Array.isArray(jobTypeArr) ? jobTypeArr : jobTypeArr ? [jobTypeArr] : []).forEach(
    (v) => hiddenParams.push({ name: 'jobType', value: String(v) })
  );
  if (resolvedParams.salary && typeof resolvedParams.salary === 'string')
    hiddenParams.push({ name: 'salary', value: resolvedParams.salary });
  if (resolvedParams.degree && typeof resolvedParams.degree === 'string')
    hiddenParams.push({ name: 'degree', value: resolvedParams.degree });
  if (resolvedParams.companyId && typeof resolvedParams.companyId === 'string')
    hiddenParams.push({ name: 'companyId', value: resolvedParams.companyId });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Find Your Dream Job
          </h1>
          <p className="text-foreground/70">
            Browse open positions from top companies
          </p>
        </div>

        {/* Top bar: 3 inputs (same as homepage) */}
        <div className="bg-background border border-foreground/10 rounded-lg p-4 mb-6">
          <form action="/jobs" method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {hiddenParams.map((p, i) => (
              <input key={`${p.name}-${i}`} type="hidden" name={p.name} value={p.value} />
            ))}
            <div>
              <label htmlFor="query" className="block text-sm font-medium mb-2 text-foreground">
                Job Title / Keyword
              </label>
              <input
                id="query"
                name="query"
                type="text"
                defaultValue={query}
                placeholder="Job title, skills..."
                className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label htmlFor="exp" className="block text-sm font-medium mb-2 text-foreground">
                Experience (Years)
              </label>
              <input
                id="exp"
                name="exp"
                type="number"
                min="0"
                defaultValue={exp}
                placeholder="e.g. 3"
                className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div>
              <label htmlFor="loc" className="block text-sm font-medium mb-2 text-foreground">
                Location
              </label>
              <input
                id="loc"
                name="loc"
                type="text"
                defaultValue={loc}
                placeholder="City, State..."
                className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-foreground text-background px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 shrink-0">
            <FilterSidebar companies={companies} />
          </div>
          <div className="flex-1 min-w-0">
            <Suspense
              fallback={
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-6 border border-foreground/10 rounded-lg bg-background animate-pulse"
                    >
                      <div className="h-6 bg-foreground/10 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-foreground/10 rounded w-1/2 mb-4" />
                      <div className="h-4 bg-foreground/10 rounded w-full" />
                    </div>
                  ))}
                </div>
              }
            >
              <JobList filters={filters} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
