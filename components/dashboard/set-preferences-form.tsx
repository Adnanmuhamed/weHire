'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { updateJobPreferences } from '@/app/actions/job-interaction';
import { WorkMode } from '@prisma/client';

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
  /** If provided, called after successful save instead of reload */
  onSuccess?: () => void;
  /** Optional card title (default: "Set Your Preferences") */
  title?: string;
}

export default function SetPreferencesForm({
  initialLocations = [],
  initialTitles = [],
  initialSalaryMin = null,
  initialSalaryMax = null,
  initialWorkModes = [],
  onSuccess,
  title = 'Set Your Preferences',
}: SetPreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState(initialLocations.join(', '));
  const [titles, setTitles] = useState(initialTitles.join(', '));
  const [salaryMin, setSalaryMin] = useState(initialSalaryMin ?? '');
  const [salaryMax, setSalaryMax] = useState(initialSalaryMax ?? '');
  const [workModes, setWorkModes] = useState<WorkMode[]>(initialWorkModes);

  const toggleWorkMode = (mode: WorkMode) => {
    setWorkModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const locs = locations.split(',').map((s) => s.trim()).filter(Boolean);
    const tits = titles.split(',').map((s) => s.trim()).filter(Boolean);
    const min = salaryMin ? parseInt(String(salaryMin), 10) : null;
    const max = salaryMax ? parseInt(String(salaryMax), 10) : null;
    const result = await updateJobPreferences({
      locations: locs,
      titles: tits,
      expectedSalaryMin: min ?? null,
      expectedSalaryMax: max ?? null,
      workModes,
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
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-foreground/70 mb-4">
        Add locations, job titles, and salary range to get personalized recommendations.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Locations (comma-separated)
          </label>
          <input
            type="text"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            placeholder="e.g. Mumbai, Bangalore, Remote"
            className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Job Titles (comma-separated)
          </label>
          <input
            type="text"
            value={titles}
            onChange={(e) => setTitles(e.target.value)}
            placeholder="e.g. Software Engineer, Product Manager"
            className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Min Salary (₹)
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
              Max Salary (₹)
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
          {isSubmitting ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
