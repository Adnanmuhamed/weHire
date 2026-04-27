'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { addEducation, deleteEducation, updateEducation } from '@/app/actions/candidate-profile';
import type { AddEducationInput } from '@/app/actions/candidate-profile';

interface EducationItem {
  id: string;
  degree: string;
  college: string;
  stream: string | null;
  startYear: number | null;
  endYear: number | null;
  isFullTime: boolean;
  grade: string | null;
  activities: string | null;
}

interface EducationSectionProps {
  education: EducationItem[];
  readOnly?: boolean;
}

function formatYearRange(start: number | null, end: number | null) {
  if (start == null && end == null) return '';
  const s = start ?? '—';
  const e = end ?? '—';
  return `${s} – ${e}`;
}

export default function EducationSection({ education, readOnly = false }: EducationSectionProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddEducationInput>({
    degree: '',
    college: '',
    stream: '',
    startYear: undefined,
    endYear: undefined,
    isFullTime: true,
    grade: '',
    activities: '',
  });

  const handleEdit = (item: EducationItem) => {
    setEditingId(item.id);
    setForm({
      degree: item.degree,
      college: item.college,
      stream: item.stream || undefined,
      startYear: item.startYear || undefined,
      endYear: item.endYear || undefined,
      isFullTime: item.isFullTime,
      grade: item.grade || '',
      activities: item.activities || '',
    });
    setModalOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      degree: form.degree.trim(),
      college: form.college.trim(),
      stream: form.stream?.trim() || undefined,
      startYear: form.startYear,
      endYear: form.endYear,
      isFullTime: form.isFullTime,
      grade: form.grade?.trim() || undefined,
      activities: form.activities?.trim() || undefined,
    };

    const result = editingId 
      ? await updateEducation(editingId, payload)
      : await addEducation(payload);

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editingId ? 'Education updated' : 'Education added');
    setModalOpen(false);
    setEditingId(null);
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
        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                degree: '',
                college: '',
                stream: '',
                startYear: undefined,
                endYear: undefined,
                isFullTime: true,
                grade: '',
                activities: '',
              });
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-80"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        )}
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
                  {item.grade && (
                    <p className="text-sm text-foreground/80 mt-1">Grade: {item.grade}</p>
                  )}
                  {item.activities && (
                    <p className="text-sm text-foreground/70 mt-1 italic">{item.activities}</p>
                  )}
                </div>
                {!readOnly && (
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-foreground/50 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-foreground/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>

      {!readOnly && modalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setModalOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-background border border-foreground/10 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-foreground/10">
                <h3 className="text-lg font-semibold text-foreground">{editingId ? 'Edit Education' : 'Add Education'}</h3>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setEditingId(null);
                  }}
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
                    checked={form.isFullTime ?? false}
                    onChange={(e) => setForm((f) => ({ ...f, isFullTime: e.target.checked }))}
                    className="rounded border-foreground/20"
                  />
                  <span className="text-sm text-foreground">Full-time</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Grade / Score</label>
                  <input
                    value={form.grade ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g., 3.8 GPA, 85%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Activities & Societies</label>
                  <textarea
                    value={form.activities ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, activities: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g., Chess Club, Student Council"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setEditingId(null);
                    }}
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
