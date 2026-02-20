'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { updatePersonalDetails } from '@/app/actions/candidate-profile';

interface ResumeHeadlineSectionProps {
  resumeHeadline: string | null;
}

export default function ResumeHeadlineSection({ resumeHeadline }: ResumeHeadlineSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(resumeHeadline ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await updatePersonalDetails({ resumeHeadline: value.trim() || null });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Resume headline updated');
    setIsEditing(false);
    router.refresh();
  };

  return (
    <section className="border-b border-foreground/10 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-2">
            Resume Headline
          </h2>
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="e.g., Senior Software Engineer with 5+ years in full-stack development"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue(resumeHeadline ?? '');
                    setIsEditing(false);
                  }}
                  className="p-1.5 text-foreground/70 hover:bg-foreground/10 rounded-md"
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-foreground">
              {resumeHeadline?.trim() || 'Add a headline that summarizes your experience and goals.'}
            </p>
          )}
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-2 text-foreground/60 hover:bg-foreground/10 rounded-md shrink-0"
            aria-label="Edit resume headline"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
