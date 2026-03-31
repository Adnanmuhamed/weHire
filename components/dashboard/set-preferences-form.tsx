'use client';

import { useState, FormEvent, KeyboardEvent, useRef } from 'react';
import { toast } from 'sonner';
import { updateJobPreferences } from '@/app/actions/job-interaction';
import { WorkMode } from '@prisma/client';
import { X, Plus, MapPin, Briefcase, Building2, Layers } from 'lucide-react';
import { MIDDLE_EAST_LOCATIONS } from '@/lib/constants/locations';
import { INDUSTRY_LIST, getDepartments } from '@/lib/constants/industries';

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

interface SetPreferencesFormProps {
  initialLocations?: string[];
  initialTitles?: string[];
  initialSalaryMin?: number | null;
  initialSalaryMax?: number | null;
  initialWorkModes?: WorkMode[];
  initialIndustries?: string[];
  initialDepartments?: string[];
  /** If provided, called after successful save instead of reload */
  onSuccess?: () => void;
  /** Optional card title (default: "Set Your Preferences") */
  title?: string;
}

/* ========== Tag Input ========== */
function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
  suggestions,
  icon,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
  suggestions?: string[];
  icon?: React.ReactNode;
}) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(input.toLowerCase()) &&
          !tags.includes(s)
      )
    : [];

  const addTag = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
    }
    setInput('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 border border-foreground/20 rounded-md bg-background min-h-[40px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/10 text-xs font-medium text-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="hover:bg-foreground/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex-1 min-w-[120px] relative">
          <div className="flex items-center gap-1">
            {icon && <span className="text-foreground/40 shrink-0">{icon}</span>}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (suggestions) setShowSuggestions(true);
              }}
              onFocus={() => suggestions && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKey}
              placeholder={tags.length === 0 ? placeholder : 'Add more…'}
              className="w-full text-sm bg-transparent outline-none placeholder:text-foreground/40 text-foreground"
            />
          </div>
        </div>
      </div>
      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-40 overflow-auto rounded-lg border border-foreground/10 bg-background shadow-lg py-1">
          {filtered.slice(0, 8).map((s) => (
            <li
              key={s}
              className="px-3 py-1.5 text-sm cursor-pointer hover:bg-foreground/5 text-foreground/80"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ========== Multi-Select ========== */
function MultiSelect({
  options,
  selected,
  onToggle,
  label,
}: {
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-foreground/20 rounded-md bg-background text-sm text-foreground"
      >
        <span className={selected.length === 0 ? 'text-foreground/40' : ''}>
          {selected.length === 0
            ? `Select ${label}…`
            : `${selected.length} selected`}
        </span>
        <Plus
          className={`w-4 h-4 text-foreground/40 transition-transform ${isOpen ? 'rotate-45' : ''}`}
        />
      </button>
      {isOpen && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-foreground/10 bg-background shadow-lg py-1">
          {options.map((opt) => (
            <li key={opt}>
              <label className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-foreground/5 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => onToggle(opt)}
                  className="w-3.5 h-3.5 border-foreground/20 rounded"
                />
                <span className="text-foreground/80">{opt}</span>
              </label>
            </li>
          ))}
          {options.length === 0 && (
            <li className="px-3 py-2 text-xs text-foreground/50">No options available</li>
          )}
        </ul>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selected.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/10 text-xs font-medium text-foreground"
            >
              {s}
              <button
                type="button"
                onClick={() => onToggle(s)}
                className="hover:bg-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== Main Form ========== */
export default function SetPreferencesForm({
  initialLocations = [],
  initialTitles = [],
  initialSalaryMin = null,
  initialSalaryMax = null,
  initialWorkModes = [],
  initialIndustries = [],
  initialDepartments = [],
  onSuccess,
  title = 'Set Your Preferences',
}: SetPreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<string[]>(initialLocations);
  const [titles, setTitles] = useState<string[]>(initialTitles);
  const [salaryMin, setSalaryMin] = useState(initialSalaryMin ?? '');
  const [salaryMax, setSalaryMax] = useState(initialSalaryMax ?? '');
  const [workModes, setWorkModes] = useState<WorkMode[]>(initialWorkModes);
  const [industries, setIndustries] = useState<string[]>(initialIndustries);
  const [departments, setDepartments] = useState<string[]>(initialDepartments);

  // Compute available departments from selected industries
  const availableDepartments = industries.length > 0
    ? [...new Set(industries.flatMap((ind) => getDepartments(ind)))]
    : [];

  const toggleWorkMode = (mode: WorkMode) => {
    setWorkModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const toggleIndustry = (ind: string) => {
    setIndustries((prev) => {
      const next = prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind];
      // Remove departments that no longer belong to selected industries
      const nextAvailDepts = [...new Set(next.flatMap((i) => getDepartments(i)))];
      setDepartments((d) => d.filter((dep) => nextAvailDepts.includes(dep)));
      return next;
    });
  };

  const toggleDepartment = (dept: string) => {
    setDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const min = salaryMin ? parseInt(String(salaryMin), 10) : null;
    const max = salaryMax ? parseInt(String(salaryMax), 10) : null;
    const result = await updateJobPreferences({
      locations,
      titles,
      expectedSalaryMin: min ?? null,
      expectedSalaryMax: max ?? null,
      workModes,
      industries,
      departments,
    });
    setIsSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Preferences saved.');
    if (onSuccess) onSuccess();
    else window.location.reload();
  };

  return (
    <div className="rounded-lg border border-foreground/10 bg-background p-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-foreground/70 mb-5">
        Get personalised job recommendations based on your preferences.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Preferred Locations — tag input with autocomplete */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Preferred Locations
          </label>
          <TagInput
            tags={locations}
            onAdd={(loc) => setLocations((prev) => [...prev, loc])}
            onRemove={(loc) => setLocations((prev) => prev.filter((l) => l !== loc))}
            placeholder="e.g. Dubai, Riyadh, Remote"
            suggestions={[...MIDDLE_EAST_LOCATIONS]}
          />
        </div>

        {/* Job Titles / Roles — tag input */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            Job Titles / Roles
          </label>
          <TagInput
            tags={titles}
            onAdd={(t) => setTitles((prev) => [...prev, t])}
            onRemove={(t) => setTitles((prev) => prev.filter((x) => x !== t))}
            placeholder="e.g. Software Engineer, Product Manager"
          />
        </div>

        {/* Industries — multi-select */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Industries
          </label>
          <MultiSelect
            options={INDUSTRY_LIST}
            selected={industries}
            onToggle={toggleIndustry}
            label="industries"
          />
        </div>

        {/* Departments — multi-select, shown when industries selected */}
        {industries.length > 0 && availableDepartments.length > 0 && (
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
              <Layers className="w-3.5 h-3.5" />
              Departments
            </label>
            <MultiSelect
              options={availableDepartments}
              selected={departments}
              onToggle={toggleDepartment}
              label="departments"
            />
          </div>
        )}

        {/* Salary */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Min Salary
            </label>
            <input
              type="number"
              min="0"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Max Salary
            </label>
            <input
              type="number"
              min="0"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="e.g. 1500000"
              className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm"
            />
          </div>
        </div>

        {/* Work Mode */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Work Mode
          </label>
          <div className="flex flex-wrap gap-2">
            {WORK_MODES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={workModes.includes(value)}
                  onChange={() => toggleWorkMode(value)}
                  className="w-4 h-4 rounded border-foreground/20"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-foreground text-background rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
