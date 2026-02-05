import { Suspense } from 'react';
import JobList from './job-list';

/**
 * Recommended Jobs Component
 * 
 * Wrapper around JobList that displays the latest OPEN jobs.
 * Used in the seeker dashboard layout.
 */

export default function RecommendedJobs() {
  // Force specific search params for recommended jobs
  const searchParams = new URLSearchParams();
  searchParams.set('sort', 'newest');
  searchParams.set('limit', '5');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Recommended Jobs
        </h2>
        <p className="text-sm text-foreground/70">
          Discover the latest opportunities matching your profile
        </p>
      </div>

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
        <JobList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

