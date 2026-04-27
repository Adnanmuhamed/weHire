'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, ExternalLink, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { addCertificate, deleteCertificate, updateCertificate } from '@/app/actions/candidate-profile';
import type { AddCertificateInput } from '@/app/actions/candidate-profile';

interface CertItem {
  id: string;
  name: string;
  issuer: string | null;
  issueDate: Date | null;
  url: string | null;
  credentialId: string | null;
}

interface CertificationsSectionProps {
  certificates: CertItem[];
}

export default function CertificationsSection({ certificates }: CertificationsSectionProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddCertificateInput>({
    name: '',
    issuer: '',
    issueDate: '',
    url: '',
    credentialId: '',
  });

  const handleEdit = (item: CertItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      issuer: item.issuer || '',
      issueDate: item.issueDate ? new Date(item.issueDate).toISOString().substring(0, 10) : '',
      url: item.url || '',
      credentialId: item.credentialId || '',
    });
    setModalOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const payload = {
      name: form.name.trim(),
      issuer: form.issuer?.trim() || null,
      issueDate: form.issueDate?.trim() || null,
      url: form.url?.trim() || null,
      credentialId: form.credentialId?.trim() || null,
    };

    const result = editingId
      ? await updateCertificate(editingId, payload)
      : await addCertificate(payload);

    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editingId ? 'Certification updated' : 'Certification added');
    setModalOpen(false);
    setEditingId(null);
    setForm({ name: '', issuer: '', issueDate: '', url: '', credentialId: '' });
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this certification?')) return;
    const result = await deleteCertificate(id);
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
          Certifications
        </h2>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm({ name: '', issuer: '', issueDate: '', url: '', credentialId: '' });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-80"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>
      <ul className="space-y-3">
        {certificates.length === 0 ? (
          <li className="text-foreground/60 text-sm">No certifications added yet.</li>
        ) : (
          certificates.map((c) => {
            return (
              <li
                key={c.id}
                className="flex items-start justify-between gap-4 py-2 border-l-2 border-foreground/10 pl-4 group"
              >
                <div>
                  <p className="font-medium text-foreground">{c.name}</p>
                  {c.issuer && (
                    <p className="text-sm text-foreground/60">{c.issuer}</p>
                  )}
                  {c.issueDate && (
                    <p className="text-xs text-foreground/50 mt-0.5">
                      {new Date(c.issueDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {c.credentialId && (
                    <p className="text-xs text-foreground/50 mt-0.5 font-mono">ID: {c.credentialId}</p>
                  )}
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/70 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEdit(c)}
                    className="p-1.5 text-foreground/50 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                    aria-label="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-foreground/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                <h3 className="text-lg font-semibold text-foreground">{editingId ? 'Edit Certification' : 'Add Certification'}</h3>
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
                  <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g. AWS Certified"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Issuer</label>
                  <input
                    value={form.issuer ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g. Amazon Web Services"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Issue date</label>
                  <input
                    type="date"
                    value={form.issueDate ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">URL (optional)</label>
                  <input
                    type="url"
                    value={form.url ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Credential ID (optional)</label>
                  <input
                    value={form.credentialId ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, credentialId: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g. AWS-123456"
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
