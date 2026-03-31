'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectProps {
  id?: string;
  options: string[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxHeight?: number;
}

/**
 * MultiSelect — a dropdown with checkboxes for selecting multiple options.
 * Searchable, keyboard-accessible, shows selected count in trigger.
 */
export default function MultiSelect({
  id,
  options,
  value = [],
  onChange,
  placeholder = 'Select options…',
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const removeTag = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full min-h-[42px] flex items-center justify-between gap-2 px-3 py-2
          border rounded-md bg-background text-sm text-left
          focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent
          disabled:opacity-60 disabled:cursor-not-allowed
          ${open ? 'border-foreground/40' : 'border-foreground/20'}`}
      >
        <span className={value.length === 0 ? 'text-foreground/40' : 'text-foreground'}>
          {value.length === 0
            ? placeholder
            : `${value.length} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-foreground/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-foreground/10 text-foreground
                text-xs font-medium rounded-md"
            >
              {v}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(v)}
                  className="text-foreground/50 hover:text-foreground"
                  aria-label={`Remove ${v}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-foreground/15
          rounded-md shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-foreground/10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full px-2 py-1.5 text-sm bg-foreground/5 rounded border border-foreground/15
                focus:outline-none placeholder:text-foreground/40 text-foreground"
              autoFocus
            />
          </div>
          {/* Options */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-foreground/50">No options found</li>
            ) : (
              filtered.map((option) => {
                const selected = value.includes(option);
                return (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => toggle(option)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                        transition-colors hover:bg-foreground/8
                        ${selected ? 'text-foreground font-medium' : 'text-foreground/80'}`}
                    >
                      <span className={`w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center
                        ${selected ? 'bg-foreground border-foreground' : 'border-foreground/30'}`}>
                        {selected && <Check className="w-3 h-3 text-background" />}
                      </span>
                      {option}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
