'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { updatePersonalDetails } from '@/app/actions/candidate-profile';
import type { UpdatePersonalDetailsInput } from '@/app/actions/candidate-profile';

interface PersonalDetailsSectionProps {
  details: {
    dob: Date | null;
    gender: string | null;
    maritalStatus: string | null;
    availability: string | null;
    currentLocation: string | null;
    languages: string[];
    careerBreak: boolean;
    differentlyAbled: boolean;
  };
}

function formatDate(d: Date | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PersonalDetailsSection({ details }: PersonalDetailsSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdatePersonalDetailsInput>({
    dob: details.dob ? new Date(details.dob).toISOString().slice(0, 10) : '',
    gender: details.gender ?? '',
    maritalStatus: details.maritalStatus ?? '',
    availability: details.availability ?? '',
    currentLocation: details.currentLocation ?? '',
    languages: details.languages?.length ? details.languages : [],
    careerBreak: details.careerBreak,
    differentlyAbled: details.differentlyAbled,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updatePersonalDetails({
      dob: form.dob?.trim() || null,
      gender: form.gender?.trim() || null,
      maritalStatus: form.maritalStatus?.trim() || null,
      availability: form.availability?.trim() || null,
      currentLocation: form.currentLocation?.trim() || null,
      languages: Array.isArray(form.languages) ? form.languages.filter(Boolean) : [],
      careerBreak: form.careerBreak,
      differentlyAbled: form.differentlyAbled,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Personal details updated');
    setIsEditing(false);
    router.refresh();
  };

  const rows = [
    { label: 'Date of Birth', value: formatDate(details.dob) },
    { label: 'Gender', value: details.gender ?? '—' },
    { label: 'Marital Status', value: details.maritalStatus ?? '—' },
    { label: 'Availability', value: details.availability ?? '—' },
    { label: 'Current Location', value: details.currentLocation ?? '—' },
    { label: 'Languages', value: details.languages?.length ? details.languages.join(', ') : '—' },
    { label: 'Career Break', value: details.careerBreak ? 'Yes' : 'No' },
    { label: 'Differently Abled', value: details.differentlyAbled ? 'Yes' : 'No' },
  ];

  return (
    <section className="border-b border-foreground/10 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
            Personal Details
          </h2>
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">DOB</label>
                  <input
                    type="date"
                    value={typeof form.dob === 'string' ? form.dob : ''}
                    onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
                  <input
                    type="text"
                    value={form.gender ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g., Male"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Marital Status
                  </label>
                  <input
                    type="text"
                    value={form.maritalStatus ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, maritalStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g., Single"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Availability
                  </label>
                  <input
                    type="text"
                    value={form.availability ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g., Immediate"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Current Location
                  </label>
                  <input
                    type="text"
                    value={form.currentLocation ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, currentLocation: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="City, State"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Languages (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(form.languages) ? form.languages.join(', ') : ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      }))
                    }
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="English, Hindi"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.careerBreak ?? false}
                    onChange={(e) => setForm((f) => ({ ...f, careerBreak: e.target.checked }))}
                    className="rounded border-foreground/20"
                  />
                  <span className="text-sm text-foreground">Career break</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.differentlyAbled ?? false}
                    onChange={(e) => setForm((f) => ({ ...f, differentlyAbled: e.target.checked }))}
                    className="rounded border-foreground/20"
                  />
                  <span className="text-sm text-foreground">Differently abled</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-md"
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map(({ label, value }) => (
                    <tr key={label} className="border-b border-foreground/5">
                      <td className="py-2 pr-4 font-medium text-foreground/70 align-top w-40">
                        {label}
                      </td>
                      <td className="py-2 text-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-2 text-foreground/60 hover:bg-foreground/10 rounded-md shrink-0"
            aria-label="Edit personal details"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
