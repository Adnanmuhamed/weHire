'use client';

/**
 * Filters Sidebar Component
 * 
 * Advanced filters sidebar for the Jobs page.
 * Includes Job Type, Salary Range, and Sort Order filters.
 * Updates URL params on change using useRouter and useSearchParams.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { JobType } from '@prisma/client';
import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';

export default function FiltersSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize form state from URL params
  const [jobType, setJobType] = useState<JobType | ''>(
    (searchParams.get('jobType') as JobType) || ''
  );
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [maxSalary, setMaxSalary] = useState(searchParams.get('maxSalary') || '');
  const [sort, setSort] = useState<'newest' | 'salary_high' | 'salary_low'>(
    (searchParams.get('sort') as 'newest' | 'salary_high' | 'salary_low') || 'newest'
  );
  const [showSavedOnly, setShowSavedOnly] = useState(
    searchParams.get('saved') === 'true'
  );

  // Sync with URL params when they change externally
  useEffect(() => {
    setJobType((searchParams.get('jobType') as JobType) || '');
    setMinSalary(searchParams.get('minSalary') || '');
    setMaxSalary(searchParams.get('maxSalary') || '');
    setSort(
      (searchParams.get('sort') as 'newest' | 'salary_high' | 'salary_low') || 'newest'
    );
    setShowSavedOnly(searchParams.get('saved') === 'true');
  }, [searchParams]);

  // Update URL params when filters change
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 on filter change
    params.delete('page');

    router.push(`/jobs?${params.toString()}`);
  };

  const handleJobTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setJobType(value as JobType | '');
    updateParams('jobType', value);
  };

  const handleMinSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinSalary(value);
    updateParams('minSalary', value);
  };

  const handleMaxSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxSalary(value);
    updateParams('maxSalary', value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSort(value as 'newest' | 'salary_high' | 'salary_low');
    updateParams('sort', value);
  };

  const handleShowSavedOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowSavedOnly(checked);
    updateParams('saved', checked ? 'true' : '');
  };

  const handleClearFilters = () => {
    setJobType('');
    setMinSalary('');
    setMaxSalary('');
    setSort('newest');
    setShowSavedOnly(false);
    router.push('/jobs');
  };

  return (
    <aside className="w-full">
      <div className="rounded-lg border border-foreground/10 bg-background p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-foreground/70" />
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        </div>

        {/* Job Type */}
        <div>
          <label htmlFor="jobType" className="block text-sm font-medium mb-2 text-foreground">
            Job Type
          </label>
          <select
            id="jobType"
            value={jobType}
            onChange={handleJobTypeChange}
            className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="INTERN">Intern</option>
            <option value="CONTRACT">Contract</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Salary Range
          </label>
          <div className="space-y-2">
            <input
              type="number"
              value={minSalary}
              onChange={handleMinSalaryChange}
              placeholder="Min Salary"
              min="0"
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
            />
            <input
              type="number"
              value={maxSalary}
              onChange={handleMaxSalaryChange}
              placeholder="Max Salary"
              min="0"
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium mb-2 text-foreground">
            Sort By
          </label>
          <select
            id="sort"
            value={sort}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="salary_high">Salary: High to Low</option>
            <option value="salary_low">Salary: Low to High</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={handleClearFilters}
          className="w-full px-4 py-2 border border-foreground/20 rounded-md font-medium text-foreground hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* My Library Section */}
      <div className="mt-6 rounded-lg border border-foreground/10 bg-background p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-foreground/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-foreground">My Library</h2>
        </div>

        {/* Show Saved Jobs Only */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showSavedOnly"
            checked={showSavedOnly}
            onChange={handleShowSavedOnlyChange}
            className="w-4 h-4 border-foreground/20 rounded text-foreground focus:ring-2 focus:ring-foreground/20"
          />
          <label htmlFor="showSavedOnly" className="text-sm font-medium text-foreground cursor-pointer">
            Show Saved Jobs Only
          </label>
        </div>
      </div>
    </aside>
  );
}

