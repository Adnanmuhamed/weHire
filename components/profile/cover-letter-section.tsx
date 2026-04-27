'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { updateCoverLetter } from '@/app/actions/candidate-profile';
import FileUpload from '@/components/file-upload';

interface CoverLetterSectionProps {
  coverLetterUrl: string | null;
  coverLetterName?: string | null;
  readOnly?: boolean;
}

function getFileName(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segment = path.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : 'Cover Letter';
  } catch {
    return 'Cover Letter';
  }
}

export default function CoverLetterSection({ coverLetterUrl, coverLetterName, readOnly = false }: CoverLetterSectionProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setLoading(true);
    const result = await updateCoverLetter(trimmed);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Cover letter link added');
    setIsAdding(false);
    setUrlInput('');
    router.refresh();
  };

  const handleRemove = async () => {
    if (!confirm('Remove cover letter?')) return;
    setLoading(true);
    const result = await updateCoverLetter(null);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success('Cover letter removed');
      router.refresh();
    }
  };

  return (
    <section className="border-b border-foreground/10 pb-6">
      <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
        Cover Letter
      </h2>
      {coverLetterUrl ? (
        <div className="border border-foreground/10 rounded-md p-4 bg-background">
          {/* Top Row: File Details */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 bg-foreground/5 rounded-md mt-1 shrink-0">
                <FileText className="w-5 h-5 text-foreground/60" />
              </div>
              <div>
                <p className="font-medium text-foreground truncate text-sm sm:text-base">
                  {coverLetterName || getFileName(coverLetterUrl)}
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  Uploaded on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={coverLetterUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors flex items-center justify-center bg-foreground/5 sm:bg-transparent"
                aria-label="Download cover letter"
              >
                <Download className="w-4 h-4" />
              </a>
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={loading}
                  className="p-2 text-foreground/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center bg-foreground/5 sm:bg-transparent"
                  aria-label="Remove cover letter"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          {!readOnly && (
            <>
              <hr className="border-t border-dashed border-foreground/10 my-4" />
              
              {/* Bottom Row: Update Action */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="w-full sm:w-auto px-6 py-2 border border-foreground/20 rounded-md text-sm font-medium hover:bg-foreground/5 transition-colors text-foreground"
                >
                  Update cover letter
                </button>
                <p className="text-xs text-foreground/50 mt-2 text-center">
                  Supported Formats: doc, docx, rtf, pdf, upto 5 MB
                </p>
              </div>
            </>
          )}
        </div>
      ) : readOnly ? (
        <p className="text-foreground/60 text-sm">No cover letter uploaded.</p>
      ) : isAdding ? (
        <div className="space-y-3">
          <FileUpload
            fileType="pdf"
            value={null}
            onChange={async (url, originalName) => {
              if (url) {
                setLoading(true);
                const result = await updateCoverLetter(url, originalName);
                setLoading(false);
                if (result.error) toast.error(result.error);
                else {
                  toast.success('Cover letter added successfully');
                  setIsAdding(false);
                  router.refresh();
                }
              }
            }}
            maxSizeMB={5}
            folder="cover-letters"
          />
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="w-full px-4 py-2 text-sm font-medium border border-foreground/20 rounded-md text-foreground hover:bg-foreground/5"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full py-4 border-2 border-dashed border-foreground/20 rounded-lg text-foreground/70 hover:border-foreground/40 hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Upload cover letter
        </button>
      )}
    </section>
  );
}
