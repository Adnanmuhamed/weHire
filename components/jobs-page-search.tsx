'use client';

/**
 * Jobs Page Search Component
 * 
 * Simple search form for the /jobs page header.
 * Only includes Designation, Location, and Experience fields.
 * Job Type, Salary, and Sort are handled in the sidebar.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';
import { Search } from 'lucide-react';

// Map experience dropdown options to numbers
const experienceOptions = [
  { label: 'Any Experience', value: '' },
  { label: '0-1 years', value: '1' },
  { label: '1-3 years', value: '3' },
  { label: '3-5 years', value: '5' },
  { label: '5+ years', value: '10' },
];

export default function JobsPageSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize form state from URL params
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');

  // Sync with URL params when they change externally
  useEffect(() => {
    setQuery(searchParams.get('query') || '');
    setLocation(searchParams.get('location') || '');
    setExperience(searchParams.get('experience') || '');
  }, [searchParams]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Build URL with query params
    const params = new URLSearchParams(searchParams.toString());

    // Update search params
    if (query.trim()) {
      params.set('query', query.trim());
    } else {
      params.delete('query');
    }

    if (location.trim()) {
      params.set('location', location.trim());
    } else {
      params.delete('location');
    }

    if (experience) {
      params.set('experience', experience);
    } else {
      params.delete('experience');
    }

    // Reset to page 1 on new search
    params.delete('page');

    // Update URL
    const url = params.toString() ? `/jobs?${params.toString()}` : '/jobs';
    router.push(url);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Designation */}
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, keywords..."
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Experience */}
        <div className="sm:w-48">
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          >
            {experienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="sm:w-48">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-6 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-opacity flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </form>
  );
}

