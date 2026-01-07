import { Suspense } from 'react';
import { headers } from 'next/headers';
import { apiGet } from '@/lib/api';
import JobCard from './job-card';
import Pagination from './pagination';

/**
 * Job List Component
 * 
 * Server Component that fetches jobs from the API.
 * Reads search params and handles empty states and pagination.
 */

interface JobSearchResponse {
  jobs: Array<{
    jobId: string;
    title: string;
    location: string;
    jobType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    companyName: string;
    createdAt: string;
  }>;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

async function fetchJobs(
  searchParams: URLSearchParams,
  baseUrl: string
): Promise<JobSearchResponse> {
  // Build API URL with query params
  const params = new URLSearchParams();
  
  // Copy all search params to API request
  for (const [key, value] of searchParams.entries()) {
    if (key !== 'page' && key !== 'limit') {
      params.append(key, value);
    }
  }

  // Add pagination
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';
  params.set('page', page);
  params.set('limit', limit);

  const url = `${baseUrl}/api/jobs?${params.toString()}`;
  
  try {
    const response = await apiGet<JobSearchResponse>(url);
    return response;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    // Return empty result on error
    return {
      jobs: [],
      pagination: {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 20,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

function JobListContent({ searchParams }: { searchParams: URLSearchParams }) {
  // This will be wrapped in Suspense
  return <JobListInner searchParams={searchParams} />;
}

async function JobListInner({ searchParams }: { searchParams: URLSearchParams }) {
  // Get base URL for API calls
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  const data = await fetchJobs(searchParams, baseUrl);

  if (data.jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No jobs found</h3>
          <p className="mt-2 text-sm text-foreground/70">
            Try adjusting your search filters or check back later for new opportunities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {data.jobs.map((job) => (
          <JobCard
            key={job.jobId}
            jobId={job.jobId}
            title={job.title}
            location={job.location}
            jobType={job.jobType as any}
            salaryMin={job.salaryMin}
            salaryMax={job.salaryMax}
            companyName={job.companyName}
            createdAt={new Date(job.createdAt)}
          />
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
            hasNextPage={data.pagination.hasNextPage}
            hasPreviousPage={data.pagination.hasPreviousPage}
          />
        </div>
      )}
    </>
  );
}

export default function JobList({ searchParams }: { searchParams: URLSearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 border border-foreground/10 rounded-lg bg-background animate-pulse"
            >
              <div className="h-6 bg-foreground/10 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-foreground/10 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-foreground/10 rounded w-full"></div>
            </div>
          ))}
        </div>
      }
    >
      <JobListContent searchParams={searchParams} />
    </Suspense>
  );
}

