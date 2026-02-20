'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { updateResume } from '@/app/actions/candidate-profile';

interface ResumeSectionProps {
  resumeUrl: string | null;
}

function getFileName(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segment = path.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : 'Resume';
  } catch {
    return 'Resume';
  }
}

export default function ResumeSection({ resumeUrl }: ResumeSectionProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setLoading(true);
    const result = await updateResume(trimmed);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Resume link added');
    setIsAdding(false);
    setUrlInput('');
    router.refresh();
  };

  const handleRemove = async () => {
    if (!confirm('Remove resume link?')) return;
    setLoading(true);
    const result = await updateResume(null);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success('Resume link removed');
      router.refresh();
    }
  };

  return (
    <section className="border-b border-foreground/10 pb-6">
      <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
        Resume
      </h2>
      {resumeUrl ? (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-foreground/5 border border-foreground/10">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <FileText className="w-5 h-5 text-foreground/60 shrink-0" />
            <div>
              <p className="font-medium text-foreground truncate">{getFileName(resumeUrl)}</p>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground/70 hover:underline inline-flex items-center gap-1"
              >
                Open link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="p-2 text-foreground/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md disabled:opacity-50"
            aria-label="Remove resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : isAdding ? (
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setUrlInput(''); }}
              className="px-4 py-2 text-sm font-medium border border-foreground/20 rounded-md text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full py-4 border-2 border-dashed border-foreground/20 rounded-lg text-foreground/70 hover:border-foreground/40 hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Add Resume Link
        </button>
      )}
    </section>
  );
}
