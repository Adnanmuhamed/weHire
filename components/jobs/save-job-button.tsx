'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleSavedJobAction } from '@/app/actions/saved-job';

interface SaveJobButtonProps {
  jobId: string;
  isSaved: boolean;
}

export default function SaveJobButton({ jobId, isSaved: initialSaved }: SaveJobButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const result = await toggleSavedJobAction(jobId);
      if (result.success !== undefined) {
        setSaved(result.isSaved ?? false);
      }
    } catch {
      // silently fail — state stays as-is
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
      className="p-2 rounded-md hover:bg-foreground/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Bookmark
        className={`w-5 h-5 transition-colors ${
          saved ? 'fill-foreground text-foreground' : 'text-foreground/50 hover:text-foreground'
        }`}
      />
    </button>
  );
}
