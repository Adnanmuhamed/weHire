import { Suspense } from 'react';
import FiltersSidebar from '@/components/filters-sidebar';
import JobList from '@/components/job-list';
import JobsPageSearch from '@/components/jobs-page-search';

/**
 * Jobs Page
 * 
 * Advanced jobs search page with sidebar filters.
 * Public page (no auth required) with 25/75 layout.
 */

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  // Convert searchParams to URLSearchParams for components
  const resolvedParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.set(key, value);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column (25%): Filters Sidebar */}
          <aside className="lg:col-span-1">
            <FiltersSidebar />
          </aside>

          {/* Right Column (75%): Search + Job List */}
          <main className="lg:col-span-3 space-y-6">
            {/* Compact Search Bar */}
            <div className="bg-background border border-foreground/10 rounded-lg p-4">
              <JobsPageSearch />
            </div>

            {/* Section Heading */}
            <div>
              {urlSearchParams.toString() === '' ? (
                <h2 className="text-2xl font-bold text-foreground">Recommended Jobs</h2>
              ) : (
                <h2 className="text-2xl font-bold text-foreground">Search Results</h2>
              )}
            </div>

            {/* Job List */}
            <Suspense
              fallback={
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
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
              <JobList searchParams={urlSearchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

