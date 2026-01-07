import { Suspense } from 'react';
import JobSearch from '@/components/job-search';
import JobList from '@/components/job-list';

/**
 * Homepage
 * 
 * Public job listing page with search and filters.
 * Server Component that renders hero, search, and job list.
 */

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
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
      {/* Hero Section */}
      <section className="border-b border-foreground/10 bg-foreground/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-lg md:text-xl text-foreground/70">
              Discover opportunities from top companies. Search, filter, and apply
              to jobs that match your skills and interests.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <JobSearch />
        </div>
      </section>

      {/* Job List Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="max-w-6xl mx-auto">
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
        </div>
      </section>
    </div>
  );
}
