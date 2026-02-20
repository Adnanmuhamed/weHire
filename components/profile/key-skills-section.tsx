'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile } from '@/app/actions/profile';
import type { ProfileFormInput } from '@/lib/validators';

interface KeySkillsSectionProps {
  skills: string[];
  /** Current profile fields required for updateProfile */
  profilePayload: {
    fullName: string;
    headline?: string;
    bio?: string;
    experience: number;
    resumeUrl?: string;
    location?: string;
    mobile?: string;
  };
}

export default function KeySkillsSection({ skills, profilePayload }: KeySkillsSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(skills.join(', '));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const payload: ProfileFormInput = {
      ...profilePayload,
      fullName: profilePayload.fullName,
      headline: profilePayload.headline ?? '',
      bio: profilePayload.bio ?? '',
      skills: value.trim(),
      experience: profilePayload.experience,
      resumeUrl: profilePayload.resumeUrl ?? '',
      location: profilePayload.location ?? '',
      mobile: profilePayload.mobile ?? '',
    };
    const result = await updateProfile(payload);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Skills updated');
    setIsEditing(false);
    router.refresh();
  };

  return (
    <section className="border-b border-foreground/10 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-2">
            Key Skills
          </h2>
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="e.g., React, Node.js, TypeScript"
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
                    setValue(skills.join(', '));
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
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-md bg-foreground/10 text-sm text-foreground"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-foreground/60">Add your key skills (comma-separated).</p>
              )}
            </div>
          )}
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-2 text-foreground/60 hover:bg-foreground/10 rounded-md shrink-0"
            aria-label="Edit skills"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
