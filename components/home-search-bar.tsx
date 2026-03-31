'use client';

import { useState } from 'react';
import { MIDDLE_EAST_LOCATIONS } from '@/lib/constants/locations';
import { MapPin, Search } from 'lucide-react';

/**
 * Homepage search section with location autocomplete.
 * This is a client component wrapper so the server-rendered home page
 * can use the interactive location autocomplete.
 */

export default function HomeSearchBar() {
  const [query, setQuery] = useState('');
  const [exp, setExp] = useState('');
  const [loc, setLoc] = useState('');
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);

  const filteredLocations = MIDDLE_EAST_LOCATIONS.filter((l) =>
    l.toLowerCase().includes(loc.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('query', query.trim());
    if (exp.trim()) params.set('exp', exp.trim());
    if (loc.trim()) params.set('loc', loc.trim());
    window.location.href = `/jobs?${params.toString()}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Job Title or Keyword"
        className="flex-1 px-4 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
        aria-label="Job title or keyword"
      />
      <input
        type="number"
        value={exp}
        onChange={(e) => setExp(e.target.value)}
        min="0"
        placeholder="Experience (Years)"
        className="w-full sm:w-40 px-4 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
        aria-label="Experience in years"
      />
      {/* Location with autocomplete */}
      <div className="relative w-full sm:w-48">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
        <input
          type="text"
          value={loc}
          onChange={(e) => {
            setLoc(e.target.value);
            setShowLocSuggestions(true);
          }}
          onFocus={() => setShowLocSuggestions(true)}
          onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)}
          placeholder="Location"
          autoComplete="off"
          className="w-full pl-9 pr-3 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          aria-label="Location"
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
      <button
        type="submit"
        className="flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        <Search className="w-4 h-4" />
        Search
      </button>
    </form>
  );
}
