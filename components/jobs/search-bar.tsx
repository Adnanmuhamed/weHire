'use client';

/**
 * Jobs Search Bar (client component)
 *
 * Used on the /jobs page. Includes location autocomplete from ME city list.
 * Preserves existing sidebar filter params when re-searching.
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MIDDLE_EAST_LOCATIONS } from '@/lib/constants/locations';
import { MapPin, Search } from 'lucide-react';

export default function JobsSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(
    searchParams.get('query') || searchParams.get('search') || ''
  );
  const [exp, setExp] = useState(searchParams.get('exp') || '');
  const [loc, setLoc] = useState(
    searchParams.get('loc') || searchParams.get('location') || ''
  );
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);

  const filteredLocations = MIDDLE_EAST_LOCATIONS.filter((l) =>
    l.toLowerCase().includes(loc.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    // Update search params
    if (query.trim()) params.set('query', query.trim());
    else params.delete('query');
    params.delete('search'); // normalize to 'query'

    if (exp.trim()) params.set('exp', exp.trim());
    else params.delete('exp');

    if (loc.trim()) params.set('loc', loc.trim());
    else params.delete('loc');
    params.delete('location'); // normalize to 'loc'

    params.delete('page'); // reset pagination
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="bg-background border border-foreground/10 rounded-lg p-4 mb-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium mb-2 text-foreground">
            Job Title / Keyword
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skills..."
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <div>
          <label htmlFor="exp" className="block text-sm font-medium mb-2 text-foreground">
            Experience (Years)
          </label>
          <input
            id="exp"
            type="number"
            min="0"
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            placeholder="e.g. 3"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <div className="relative">
          <label htmlFor="loc" className="block text-sm font-medium mb-2 text-foreground">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
            <input
              id="loc"
              type="text"
              value={loc}
              onChange={(e) => {
                setLoc(e.target.value);
                setShowLocSuggestions(true);
              }}
              onFocus={() => setShowLocSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)}
              placeholder="City..."
              autoComplete="off"
              className="w-full pl-9 pr-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            {showLocSuggestions && loc.length > 0 && filteredLocations.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-foreground/10 bg-background shadow-lg py-1">
                {filteredLocations.slice(0, 8).map((city) => (
                  <li
                    key={city}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-foreground/5 text-foreground/80"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setLoc(city);
                      setShowLocSuggestions(false);
                    }}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
