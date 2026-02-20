import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';

/**
 * Landing Page
 *
 * Logged-in candidates are redirected to /dashboard.
 * Others see the public landing page.
 */

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user?.role === Role.USER) {
    redirect('/dashboard');
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b border-foreground/10 bg-gradient-to-b from-foreground/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Find Your Dream Job Today
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-2xl mx-auto">
              Connect with top employers and opportunities. Discover your next career move.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
              >
                I&apos;m a Job Seeker
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/employer/signup"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-foreground text-foreground rounded-lg font-semibold text-lg hover:bg-foreground/5 transition-colors"
              >
                I&apos;m an Employer
                <Building2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Find Your Next Role */}
      <section className="py-16 border-b border-foreground/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
            Find Your Next Role
          </h2>
          <form
            action="/jobs"
            method="get"
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="search"
              name="query"
              placeholder="Job Title or Keyword"
              className="flex-1 px-4 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              aria-label="Job title or keyword"
            />
            <input
              type="number"
              name="exp"
              min="0"
              placeholder="Experience (Years)"
              className="w-full sm:w-40 px-4 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              aria-label="Experience in years"
            />
            <input
              type="text"
              name="loc"
              placeholder="Location"
              className="w-full sm:w-48 px-4 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              aria-label="Location"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-foreground/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-foreground/70 font-medium">
              Trusted by market leaders
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-foreground/50" />
                <span className="text-sm text-foreground/50">Tech Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-foreground/50" />
                <span className="text-sm text-foreground/50">Startups</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-foreground/50" />
                <span className="text-sm text-foreground/50">Growing Businesses</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Top Companies
              </h3>
              <p className="text-foreground/70">
                Access opportunities from leading companies across industries.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Easy Application
              </h3>
              <p className="text-foreground/70">
                Apply to multiple positions with just a few clicks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Career Growth
              </h3>
              <p className="text-foreground/70">
                Find roles that match your skills and career aspirations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
