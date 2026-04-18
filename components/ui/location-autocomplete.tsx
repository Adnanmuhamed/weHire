'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { LOCATION_OPTIONS } from '@/lib/constants/company-fields';
import { ChevronDown, X, MapPin } from 'lucide-react';

/**
 * Location Autocomplete Component
 *
 * Searchable dropdown backed by the canonical ME city list.
 * Keyboard-navigable, closes on outside click.
 * Drop-in replacement for <input type="text" /> on location fields.
 */

interface LocationAutocompleteProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  /** If true, allow free-text that isn't in the list */
  allowCustom?: boolean;
  /** Optional custom locations array, defaults to LOCATION_OPTIONS */
  locations?: readonly string[];
}

export default function LocationAutocomplete({
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Select a city…',
  disabled = false,
  className = '',
  id,
  name,
  allowCustom = false,
  locations = LOCATION_OPTIONS,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initialValue = value !== undefined ? value : defaultValue;
  const [inputValue, setInputValue] = useState(initialValue);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync external value → internal
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const filtered = locations.filter((loc) =>
    loc.toLowerCase().includes(inputValue.toLowerCase())
  );

  const select = useCallback(
    (loc: string) => {
      setInputValue(loc);
      if (onChange) onChange(loc);
      setIsOpen(false);
      setHighlightIdx(-1);
    },
    [onChange]
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        // If the user typed something that isn't in the list, either keep it (allowCustom) or revert
        if (!allowCustom && !locations.includes(inputValue)) {
          setInputValue(value !== undefined ? value : defaultValue);
        } else if (allowCustom && inputValue !== (value !== undefined ? value : defaultValue) && inputValue.trim().length > 0) {
          if (onChange) onChange(inputValue);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [allowCustom, inputValue, onChange, value, locations]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      items[highlightIdx]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && filtered[highlightIdx]) {
          select(filtered[highlightIdx]);
        } else if (allowCustom) {
          if (onChange) onChange(inputValue);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightIdx(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setHighlightIdx(-1);
    if (!isOpen) setIsOpen(true);
    // Note: To make it work uncontrolled perfectly as typing, we can optimistically call onChange
    if (allowCustom && onChange) {
      onChange(val);
    }
  };

  const clearValue = () => {
    setInputValue('');
    if (onChange) onChange('');
    inputRef.current?.focus();
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full pl-9 pr-16 py-2 border border-foreground/20 rounded-md bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={clearValue}
              className="p-0.5 rounded hover:bg-foreground/10 text-foreground/40 hover:text-foreground/60 transition-colors"
              tabIndex={-1}
              aria-label="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-foreground/40 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-foreground/10 bg-background shadow-lg py-1"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-foreground/50">
              {allowCustom
                ? 'No match — press Enter to use custom value'
                : 'No matching location'}
            </li>
          ) : (
            filtered.map((loc, idx) => (
              <li
                key={loc}
                role="option"
                aria-selected={loc === (value !== undefined ? value : inputValue)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  idx === highlightIdx
                    ? 'bg-foreground/10 text-foreground'
                    : loc === (value !== undefined ? value : inputValue)
                      ? 'bg-foreground/5 text-foreground font-medium'
                      : 'text-foreground/80 hover:bg-foreground/5'
                }`}
                onClick={() => select(loc)}
                onMouseEnter={() => setHighlightIdx(idx)}
              >
                {loc}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
