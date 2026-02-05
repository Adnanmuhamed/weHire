import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import HomeSearch from '@/components/home-search';
import JobList from '@/components/job-list';
import SeekerSidebar from '@/components/seeker-sidebar';
import RecommendedJobs from '@/components/recommended-jobs';

/**
 * Homepage
 * 
 * Public job listing page with search and filters.
 * Server Component that renders different layouts based on user role:
 * - Guest: Hero, search, and job list
 * - Seeker (USER): 3-column layout with sidebar, search, and recommended jobs
 */

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const user = await getCurrentUser();
  const isSeeker = user?.role === Role.USER;

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

  // Guest Layout (Original)
  if (!isSeeker) {
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
            <HomeSearch />
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

  // Seeker Layout (3-column)
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sidebar */}
          <aside className="lg:col-span-3">
            <SeekerSidebar user={user} />
          </aside>

          {/* Middle Column: Search + Recommended Jobs */}
          <main className="lg:col-span-6 space-y-6">
            {/* Search Section */}
            <div>
              <HomeSearch />
            </div>

            {/* Recommended Jobs */}
            <RecommendedJobs />
          </main>

          {/* Right Column: Future Widgets */}
          <aside className="lg:col-span-3">
            {/* Reserved for future widgets */}
          </aside>
        </div>
      </div>
    </div>
  );
}
