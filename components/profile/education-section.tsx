'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { addEducation, deleteEducation } from '@/app/actions/candidate-profile';
import type { AddEducationInput } from '@/app/actions/candidate-profile';

interface EducationItem {
  id: string;
  degree: string;
  college: string;
  stream: string | null;
  startYear: number | null;
  endYear: number | null;
  isFullTime: boolean;
}

interface EducationSectionProps {
  education: EducationItem[];
}

function formatYearRange(start: number | null, end: number | null) {
  if (start == null && end == null) return '';
  const s = start ?? '—';
  const e = end ?? '—';
  return `${s} – ${e}`;
}

export default function EducationSection({ education }: EducationSectionProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AddEducationInput>({
    degree: '',
    college: '',
    stream: '',
    startYear: undefined,
    endYear: undefined,
    isFullTime: true,
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await addEducation({
      degree: form.degree.trim(),
      college: form.college.trim(),
      stream: form.stream?.trim() || undefined,
      startYear: form.startYear,
      endYear: form.endYear,
      isFullTime: form.isFullTime,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Education added');
    setModalOpen(false);
    setForm({
      degree: '',
      college: '',
      stream: '',
      startYear: undefined,
      endYear: undefined,
      isFullTime: true,
    });
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this education?')) return;
    const result = await deleteEducation(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success('Removed');
      router.refresh();
    }
  };

  return (
    <section className="border-b border-foreground/10 pb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide">
          Education
        </h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-80"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>
      <ul className="space-y-4">
        {education.length === 0 ? (
          <li className="text-foreground/60 text-sm">No education added yet.</li>
        ) : (
          education.map((item) => {
            return (
              <li
                key={item.id}
                className="flex gap-4 py-2 border-l-2 border-foreground/10 pl-4 relative group"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {item.degree}
                    {item.stream ? `, ${item.stream}` : ''}
                  </p>
                  <p className="text-sm text-foreground/60">{item.college}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    {formatYearRange(item.startYear, item.endYear)}
                    {item.isFullTime ? ' · Full-time' : ' · Part-time'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-foreground/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })
        )}
      </ul>

      {modalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setModalOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-background border border-foreground/10 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-foreground/10">
                <h3 className="text-lg font-semibold text-foreground">Add Education</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-foreground/10 rounded-md"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Degree *</label>
                  <input
                    required
                    value={form.degree}
                    onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g., B.Tech"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">College *</label>
                  <input
                    required
                    value={form.college}
                    onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="College or University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Stream</label>
                  <input
                    value={form.stream ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, stream: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Start Year</label>
                    <input
                      type="number"
                      min={1900}
                      max={2100}
                      value={form.startYear ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          startYear: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">End Year</label>
                    <input
                      type="number"
                      min={1900}
                      max={2100}
                      value={form.endYear ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          endYear: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isFullTime}
                    onChange={(e) => setForm((f) => ({ ...f, isFullTime: e.target.checked }))}
                    className="rounded border-foreground/20"
                  />
                  <span className="text-sm text-foreground">Full-time</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Adding…' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium border border-foreground/20 rounded-md text-foreground hover:bg-foreground/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
