import { Suspense } from 'react';
import { getPublicJobs } from '@/app/actions/public-job';
import { getSalaryRangeForPreset } from '@/lib/job-constants';
import { getAllCompanies } from '@/app/actions/company-public';
import type { PublicJobFilters } from '@/app/actions/public-job';
import { JobType, WorkMode } from '@prisma/client';
import Link from 'next/link';
import { Building2, MapPin, DollarSign, Calendar, Bookmark } from 'lucide-react';
import FilterSidebar from '@/components/jobs/filter-sidebar';
import JobsSearchBar from '@/components/jobs/search-bar';
import SaveJobButton from '@/components/jobs/save-job-button';
import { formatToLPA } from '@/lib/utils/format-salary';
import JobCard from '@/components/job-card';

/**
 * Public Job Board Page
 *
 * Main search page with top bar (query, exp, loc) and sidebar filters.
 * URL params: query, exp, loc, workMode, salary, jobType, degree, companyId, industry, department.
 */

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function formatSalary(min: number | null, max: number | null): string {
  return formatToLPA(min, max);
}

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
  
  // Location can be 'loc' or 'location', we get all and merge
  const locationRaw = [...getAll('loc'), ...getAll('location')];
  const location = locationRaw.filter(Boolean).map(v => v.trim());
  
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
  
  const industry = getAll('industry').filter(Boolean).map(v => v.trim());
  const department = getAll('department').filter(Boolean).map(v => v.trim());
  
  const qualification = getAll('qualification').filter(Boolean).map(v => v.trim());
  const languages = getAll('languages').filter(Boolean).map(v => v.trim());
  
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
  if (location.length > 0) filters.location = location;
  if (experience !== undefined && !Number.isNaN(experience))
    filters.maxExperience = experience;
  if (workMode.length > 0) filters.workMode = workMode;
  if (jobType.length > 0) filters.jobType = jobType;
  if (degree) filters.degree = degree;
  if (companyId) filters.companyId = companyId;
  if (industry.length > 0) filters.industryType = industry;
  if (department.length > 0) filters.department = department;
  if (qualification.length > 0) filters.qualification = qualification;
  if (languages.length > 0) filters.languages = languages;
  if (salaryMin !== undefined) filters.salaryMin = salaryMin;
  if (salaryMax !== undefined) filters.salaryMax = salaryMax;

  const savedOnly = get('saved') === 'true';
  if (savedOnly) filters.savedOnly = true;

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
        <li key={job.id} className="list-none">
          <JobCard
            jobId={job.id}
            title={job.title}
            location={job.location}
            jobType={job.jobType}
            workMode={job.workMode}
            salaryMin={job.salaryMin}
            salaryMax={job.salaryMax}
            companyName={job.company.name}
            companyId={job.company.id}
            logoUrl={job.company.logoUrl}
            description={job.description}
            createdAt={job.createdAt}
            isSaved={job.isSaved}
          />
        </li>
      ))}
    </div>
  );
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedParams = await searchParams;
  const filters = buildFilters(resolvedParams);

  const [companiesResult] = await Promise.all([getAllCompanies()]);
  const companies = companiesResult.companies ?? [];

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

        {/* Top bar — client component with location autocomplete */}
        <JobsSearchBar />

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
