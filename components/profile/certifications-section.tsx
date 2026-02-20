'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { addCertificate, deleteCertificate } from '@/app/actions/candidate-profile';
import type { AddCertificateInput } from '@/app/actions/candidate-profile';

interface CertItem {
  id: string;
  name: string;
  issuer: string | null;
  issueDate: Date | null;
  url: string | null;
}

interface CertificationsSectionProps {
  certificates: CertItem[];
}

export default function CertificationsSection({ certificates }: CertificationsSectionProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AddCertificateInput>({
    name: '',
    issuer: '',
    issueDate: '',
    url: '',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const result = await addCertificate({
      name: form.name.trim(),
      issuer: form.issuer?.trim() || null,
      issueDate: form.issueDate?.trim() || null,
      url: form.url?.trim() || null,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Certification added');
    setModalOpen(false);
    setForm({ name: '', issuer: '', issueDate: '', url: '' });
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
          onClick={() => setModalOpen(true)}
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
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-foreground/50 hover:text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
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
                <h3 className="text-lg font-semibold text-foreground">Add Certification</h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Adding…' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
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
