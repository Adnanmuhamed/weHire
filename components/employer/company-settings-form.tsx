'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { updateCompany } from '@/app/actions/company';
import type { UpdateCompanyInput } from '@/app/actions/company';
import { CompanyType } from '@prisma/client';
import { Loader2 } from 'lucide-react';

const COMPANY_TYPES: { value: CompanyType; label: string }[] = [
  { value: 'STARTUP', label: 'Startup' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'FOREIGN_MNC', label: 'Foreign MNC' },
  { value: 'INDIAN_MNC', label: 'Indian MNC' },
  { value: 'GOVT', label: 'Govt' },
  { value: 'OTHERS', label: 'Others' },
];

const SIZE_OPTIONS = [
  { value: '', label: 'Select size' },
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '50-200', label: '50-200' },
  { value: '200+', label: '200+' },
];

interface CompanySettingsFormProps {
  company: {
    id: string;
    name: string;
    description: string;
    website: string | null;
    location: string | null;
    logoUrl: string | null;
    type: CompanyType;
    size: string | null;
  };
}

export default function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const data: UpdateCompanyInput = {
      name: (form.querySelector('[name="name"]') as HTMLInputElement)?.value?.trim() ?? '',
      description: (form.querySelector('[name="description"]') as HTMLTextAreaElement)?.value?.trim() ?? '',
      website: (form.querySelector('[name="website"]') as HTMLInputElement)?.value?.trim() ?? '',
      location: (form.querySelector('[name="location"]') as HTMLInputElement)?.value?.trim() ?? '',
      logoUrl: (form.querySelector('[name="logoUrl"]') as HTMLInputElement)?.value?.trim() ?? '',
      type: (form.querySelector('[name="type"]') as HTMLSelectElement)?.value as CompanyType,
      size: (form.querySelector('[name="size"]') as HTMLSelectElement)?.value?.trim() || undefined,
    };

    const result = await updateCompany(data);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast.success('Company profile updated');
  };

  const defaultType = company.type ?? 'STARTUP';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={company.name}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="Acme Inc."
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-foreground mb-2">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={company.website ?? ''}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
              Company Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={defaultType}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              disabled={isSubmitting}
            >
              {COMPANY_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              defaultValue={company.location ?? ''}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="City, Country"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-foreground/50">
              Used for search filters on the companies directory.
            </p>
          </div>
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-foreground mb-2">
              Company Size
            </label>
            <select
              id="size"
              name="size"
              defaultValue={company.size ?? ''}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              disabled={isSubmitting}
            >
              {SIZE_OPTIONS.map(({ value, label }) => (
                <option key={value || 'empty'} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-foreground mb-2">
              Logo URL
            </label>
            <input
              id="logoUrl"
              name="logoUrl"
              type="url"
              defaultValue={company.logoUrl ?? ''}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="https://example.com/logo.png"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Full width: About Company */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
          About Company
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={2000}
          defaultValue={company.description ?? ''}
          className="w-full px-4 py-2 border border-foreground/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-y"
          placeholder="Describe your company, culture, and what you do..."
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-foreground/50">Max 2000 characters.</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}
