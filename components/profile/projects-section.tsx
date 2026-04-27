'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, ExternalLink, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { addProject, deleteProject, updateProject } from '@/app/actions/candidate-profile';
import type { AddProjectInput } from '@/app/actions/candidate-profile';

interface ProjectItem {
  id: string;
  title: string;
  description: string | null;
  role: string | null;
  projectLink: string | null;
  startDate: Date | null;
  endDate: Date | null;
  skills: string[];
}

interface ProjectsSectionProps {
  projects: ProjectItem[];
  readOnly?: boolean;
}

export default function ProjectsSection({ projects, readOnly = false }: ProjectsSectionProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddProjectInput>({
    title: '',
    description: '',
    role: '',
    projectLink: '',
    startDate: '',
    endDate: '',
    skills: [],
  });

  const handleEdit = (item: ProjectItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || '',
      role: item.role || '',
      projectLink: item.projectLink || '',
      startDate: item.startDate ? new Date(item.startDate).toISOString().substring(0, 10) : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().substring(0, 10) : '',
      skills: item.skills || [],
    });
    setModalOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      role: form.role?.trim() || null,
      projectLink: form.projectLink?.trim() || null,
      startDate: form.startDate?.trim() || null,
      endDate: form.endDate?.trim() || null,
      skills: form.skills || [],
    };

    const result = editingId
      ? await updateProject(editingId, payload)
      : await addProject(payload);

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editingId ? 'Project updated' : 'Project added');
    setModalOpen(false);
    setEditingId(null);
    setForm({ title: '', description: '', role: '', projectLink: '', startDate: '', endDate: '' });
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this project?')) return;
    const result = await deleteProject(id);
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
          Projects
        </h2>
        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', description: '', role: '', projectLink: '', startDate: '', endDate: '', skills: [] });
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-80"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        )}
      </div>
      <ul className="space-y-4">
        {projects.length === 0 ? (
          <li className="text-foreground/60 text-sm">No projects added yet.</li>
        ) : (
          projects.map((p) => {
            return (
              <li
                key={p.id}
                className="flex gap-4 py-2 border-l-2 border-foreground/10 pl-4 relative group"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{p.title}</p>
                  {p.role && (
                    <p className="text-sm text-foreground/60">{p.role}</p>
                  )}
                  {p.description && (
                    <p className="text-sm text-foreground/80 mt-1">{p.description}</p>
                  )}
                  {p.projectLink && (
                    <a
                      href={p.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/70 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {p.skills && p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 text-xs font-medium bg-foreground/5 border border-foreground/10 rounded-md text-foreground/80">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!readOnly && (
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="p-1.5 text-foreground/50 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
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
                <h3 className="text-lg font-semibold text-foreground">{editingId ? 'Edit Project' : 'Add Project'}</h3>
                <button
                  type="button"
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
                  <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                  <input
                    value={form.role ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="Your role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    value={form.description ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Link (URL)</label>
                  <input
                    type="url"
                    value={form.projectLink ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, projectLink: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                    <input
                      type="date"
                      value={form.endDate ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tech Stack (Comma-separated)</label>
                  <input
                    value={(form.skills || []).join(', ')}
                    onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="React, Node.js, Prisma"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setEditingId(null);
                    }}
                    className="px-4 py-2 text-sm font-medium border border-foreground/20 rounded-md text-foreground"
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
