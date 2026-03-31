'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
}

/**
 * TagInput — type a skill, press Enter or comma to add it as a tag.
 * Supports suggestions dropdown filtered by current input.
 */
export default function TagInput({
  id,
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Type and press Enter…',
  disabled = false,
  maxTags = 20,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = inputValue.trim()
    ? suggestions
        .filter(
          (s) =>
            s.toLowerCase().includes(inputValue.toLowerCase()) &&
            !value.includes(s)
        )
        .slice(0, 8)
    : [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= maxTags) return;
    onChange([...value, trimmed]);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="relative">
      {/* Tag container */}
      <div
        className={`min-h-[42px] w-full flex flex-wrap gap-1.5 px-3 py-2 border rounded-md bg-background
          focus-within:ring-2 focus-within:ring-foreground/20 focus-within:border-transparent cursor-text
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'border-foreground/20'}`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-foreground/10 text-foreground
              text-xs font-medium rounded-md"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                className="text-foreground/50 hover:text-foreground transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground
            placeholder:text-foreground/40 focus:outline-none"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-background border border-foreground/15
          rounded-md shadow-lg max-h-48 overflow-y-auto text-sm">
          {filteredSuggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                className="w-full px-3 py-2 text-left hover:bg-foreground/8 transition-colors text-foreground"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Counter */}
      {value.length > 0 && (
        <p className="mt-1 text-xs text-foreground/40">
          {value.length} / {maxTags} added
        </p>
      )}
    </div>
  );
}
