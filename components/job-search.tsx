'use client';

/**
 * Job Search Component
 * 
 * Client Component for job search and filtering.
 * Updates URL query params on submit, triggering job list refresh.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';
import { JobType } from '@prisma/client';

export default function JobSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize form state from URL params
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState<JobType | ''>(
    (searchParams.get('jobType') as JobType) || ''
  );
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [maxSalary, setMaxSalary] = useState(searchParams.get('maxSalary') || '');
  const [sort, setSort] = useState<'newest' | 'salary_high' | 'salary_low'>(
    (searchParams.get('sort') as 'newest' | 'salary_high' | 'salary_low') || 'newest'
  );

  // Sync with URL params when they change externally
  useEffect(() => {
    setQuery(searchParams.get('query') || '');
    setLocation(searchParams.get('location') || '');
    setJobType((searchParams.get('jobType') as JobType) || '');
    setMinSalary(searchParams.get('minSalary') || '');
    setMaxSalary(searchParams.get('maxSalary') || '');
    setSort(
      (searchParams.get('sort') as 'newest' | 'salary_high' | 'salary_low') || 'newest'
    );
  }, [searchParams]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Build URL with query params
    const params = new URLSearchParams();

    if (query.trim()) params.set('query', query.trim());
    if (location.trim()) params.set('location', location.trim());
    if (jobType) params.set('jobType', jobType);
    if (minSalary) params.set('minSalary', minSalary);
    if (maxSalary) params.set('maxSalary', maxSalary);
    if (sort !== 'newest') params.set('sort', sort);

    // Reset to page 1 on new search
    params.delete('page');

    // Update URL
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl);
  };

  const handleReset = () => {
    setQuery('');
    setLocation('');
    setJobType('');
    setMinSalary('');
    setMaxSalary('');
    setSort('newest');
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Search Query */}
        <div className="lg:col-span-2">
          <label htmlFor="query" className="block text-sm font-medium mb-2">
            Search Jobs
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State..."
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Job Type */}
        <div>
          <label htmlFor="jobType" className="block text-sm font-medium mb-2">
            Job Type
          </label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value as JobType | '')}
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="INTERN">Intern</option>
            <option value="CONTRACT">Contract</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>

        {/* Min Salary */}
        <div>
          <label htmlFor="minSalary" className="block text-sm font-medium mb-2">
            Min Salary
          </label>
          <input
            id="minSalary"
            type="number"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            placeholder="e.g. 50000"
            min="0"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Max Salary */}
        <div>
          <label htmlFor="maxSalary" className="block text-sm font-medium mb-2">
            Max Salary
          </label>
          <input
            id="maxSalary"
            type="number"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            placeholder="e.g. 150000"
            min="0"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium mb-2">
            Sort By
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as 'newest' | 'salary_high' | 'salary_low')
            }
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="salary_high">Salary: High to Low</option>
            <option value="salary_low">Salary: Low to High</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="px-6 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-opacity"
        >
          Search Jobs
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2 border border-foreground/20 rounded-md font-medium hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </form>
  );
}

