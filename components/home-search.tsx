'use client';

/**
 * Home Search Component
 * 
 * Simple 3-field search form for the homepage.
 * Redirects to /jobs with query params on submit.
 */

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';

// Map experience dropdown options to numbers
const experienceOptions = [
  { label: 'Any Experience', value: '' },
  { label: '0-1 years', value: '1' },
  { label: '1-3 years', value: '3' },
  { label: '3-5 years', value: '5' },
  { label: '5+ years', value: '10' },
];

export default function HomeSearch() {
  const router = useRouter();
  const [designation, setDesignation] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Build URL with query params
    const params = new URLSearchParams();

    if (designation.trim()) {
      params.set('query', designation.trim());
    }
    if (location.trim()) {
      params.set('location', location.trim());
    }
    if (experience) {
      params.set('experience', experience);
    }

    // Redirect to /jobs with query params
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
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Job title, keywords..."
            className="w-full px-4 py-3 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Experience */}
        <div className="sm:w-48">
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full px-4 py-3 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-6 py-3 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-opacity flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </form>
  );
}

