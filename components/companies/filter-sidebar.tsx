'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { CompanyType } from '@prisma/client';

const COMPANY_TYPES: { value: CompanyType; label: string }[] = [
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'FOREIGN_MNC', label: 'Foreign MNC' },
  { value: 'STARTUP', label: 'Startup' },
  { value: 'INDIAN_MNC', label: 'Indian MNC' },
  { value: 'GOVT', label: 'Govt' },
  { value: 'OTHERS', label: 'Others' },
];

const LOCATIONS_VISIBLE_INITIAL = 5;

export interface CompanyLocationCount {
  location: string;
  count: number;
}

interface CompaniesFilterSidebarProps {
  availableLocations: CompanyLocationCount[];
}

export default function CompaniesFilterSidebar({
  availableLocations,
}: CompaniesFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAllLocations, setShowAllLocations] = useState(false);

  const search = searchParams.get('search') ?? '';
  const locations = useMemo(
    () => searchParams.getAll('location').filter(Boolean),
    [searchParams]
  );
  const types = useMemo(
    () =>
      searchParams
        .getAll('type')
        .filter((v): v is CompanyType =>
          ['CORPORATE', 'FOREIGN_MNC', 'STARTUP', 'INDIAN_MNC', 'GOVT', 'OTHERS'].includes(v)
        ),
    [searchParams]
  );

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === undefined || value === '') continue;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
      router.push(`/companies?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleLocation = (loc: string) => {
    const next = locations.includes(loc)
      ? locations.filter((l) => l !== loc)
      : [...locations, loc];
    updateParams({ location: next });
  };

  const toggleType = (type: CompanyType) => {
    const next = types.includes(type)
      ? types.filter((t) => t !== type)
      : [...types, type];
    updateParams({ type: next });
  };

  const locationsToShow = showAllLocations
    ? availableLocations
    : availableLocations.slice(0, LOCATIONS_VISIBLE_INITIAL);
  const hasMoreLocations = availableLocations.length > LOCATIONS_VISIBLE_INITIAL;
  const moreCount = availableLocations.length - LOCATIONS_VISIBLE_INITIAL;

  return (
    <aside className="w-full shrink-0">
      <div className="rounded-lg border border-foreground/10 bg-background p-6 space-y-6 sticky top-24">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-foreground/70" />
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        </div>

        {/* Company Name Search */}
        <div>
          <label
            htmlFor="company-search"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Company Name
          </label>
          <input
            id="company-search"
            type="text"
            defaultValue={search}
            placeholder="Search companies..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = (e.target as HTMLInputElement).value?.trim() ?? '';
                updateParams({ search: value || undefined });
              }
            }}
            className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('company-search') as HTMLInputElement;
              const value = input?.value?.trim() ?? '';
              updateParams({ search: value || undefined });
            }}
            className="mt-2 w-full px-3 py-2 text-sm font-medium border border-foreground/20 rounded-md text-foreground hover:bg-foreground/5 transition-colors"
          >
            Apply Search
          </button>
        </div>

        {/* Location */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-2">
            Location
          </p>
          {availableLocations.length === 0 ? (
            <p className="text-xs text-foreground/50">No locations yet.</p>
          ) : (
            <div className="space-y-2">
              {locationsToShow.map(({ location: loc, count }) => (
                <label
                  key={loc}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={locations.includes(loc)}
                    onChange={() => toggleLocation(loc)}
                    className="w-4 h-4 border-foreground/20 rounded text-foreground focus:ring-2 focus:ring-foreground/20"
                  />
                  <span className="text-sm text-foreground truncate flex-1">
                    {loc}
                  </span>
                  <span className="text-xs text-foreground/50 shrink-0">
                    ({count})
                  </span>
                </label>
              ))}
              {hasMoreLocations && !showAllLocations && (
                <button
                  type="button"
                  onClick={() => setShowAllLocations(true)}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground hover:underline"
                >
                  + {moreCount} more
                </button>
              )}
              {hasMoreLocations && showAllLocations && (
                <button
                  type="button"
                  onClick={() => setShowAllLocations(false)}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground hover:underline"
                >
                  Show less
                </button>
              )}
            </div>
          )}
        </div>

        {/* Company Type */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-2">
            Company Type
          </p>
          <div className="space-y-2">
            {COMPANY_TYPES.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={types.includes(value)}
                  onChange={() => toggleType(value)}
                  className="w-4 h-4 border-foreground/20 rounded text-foreground focus:ring-2 focus:ring-foreground/20"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/companies')}
          className="w-full px-4 py-2 border border-foreground/20 rounded-md font-medium text-foreground hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors text-sm"
        >
          Clear Filters
        </button>
      </div>
    </aside>
  );
}
