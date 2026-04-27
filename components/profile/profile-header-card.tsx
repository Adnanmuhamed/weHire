'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Pencil, Linkedin, Github, ExternalLink, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateHeaderDetails, updateAvatar } from '@/app/actions/candidate-profile';
import { getPresignedUrl } from '@/app/actions/upload';

interface ProfileHeaderCardProps {
  profile: {
    fullName: string;
    resumeHeadline: string | null;
    avatarUrl: string | null;
    currentLocation: string | null;
    location: string | null;
    experience: number;
    availability: string | null;
    mobile: string | null;
    email: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    updatedAt: Date;
  };
  readOnly?: boolean;
}

export default function ProfileHeaderCard({ profile, readOnly = false }: ProfileHeaderCardProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: profile.fullName,
    mobile: profile.mobile ?? '',
    email: profile.email ?? '',
    location: profile.currentLocation ?? profile.location ?? '',
    availability: profile.availability ?? '',
    linkedinUrl: profile.linkedinUrl ?? '',
    githubUrl: profile.githubUrl ?? '',
    portfolioUrl: profile.portfolioUrl ?? '',
  });

  const lastUpdated = new Date(profile.updatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const displayLocation = profile.currentLocation ?? profile.location ?? null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateHeaderDetails({
      fullName: form.fullName.trim() || null,
      mobile: form.mobile.trim() || null,
      email: form.email.trim() || null,
      currentLocation: form.location.trim() || null,
      availability: form.availability.trim() || null,
      linkedinUrl: form.linkedinUrl.trim() || null,
      githubUrl: form.githubUrl.trim() || null,
      portfolioUrl: form.portfolioUrl.trim() || null,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Details updated');
    setModalOpen(false);
    router.refresh();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    const loadingToast = toast.loading('Uploading profile picture...');

    try {
      const { presignedUrl, publicUrl, error: urlError } = await getPresignedUrl(
        file.name,
        file.type,
        'avatars'
      );

      if (urlError || !presignedUrl || !publicUrl) {
        throw new Error(urlError || 'Failed to initialize upload');
      }

      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('Upload to storage failed');
      }

      const updateResult = await updateAvatar(publicUrl);
      if (updateResult.error) throw new Error(updateResult.error);

      toast.success('Profile picture updated', { id: loadingToast });
      router.refresh();
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to upload image', { id: loadingToast });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <header className="border-b border-foreground/10 pb-6 mb-6 relative">
        {!readOnly && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="absolute top-0 right-0 p-2 text-foreground/60 hover:bg-foreground/10 rounded-md"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
          <div 
            className={`relative w-20 h-20 rounded-full flex-shrink-0 group overflow-hidden ${!readOnly ? 'cursor-pointer' : ''}`}
            onClick={() => !readOnly && !isUploadingAvatar && fileInputRef.current?.click()}
          >
            {profile.avatarUrl ? (
              <div className="w-full h-full bg-foreground/10">
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-foreground/10 flex items-center justify-center text-2xl font-bold text-foreground/60">
                {(profile.fullName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Hover Overlay */}
            {!readOnly && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-col gap-1">
                <Camera className="w-5 h-5 text-white" />
              </div>
            )}
            
            {/* Loading Overlay */}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10">
                <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarFileChange}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
            {profile.resumeHeadline && (
              <p className="text-sm text-foreground/80 mt-0.5">{profile.resumeHeadline}</p>
            )}
            <p className="text-xs text-foreground/50 mt-1">Last updated: {lastUpdated}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/80">
              {displayLocation && <span>{displayLocation}</span>}
              {profile.experience != null && (
                <span>
                  {profile.experience} {profile.experience === 1 ? 'year' : 'years'} exp
                </span>
              )}
              {profile.availability && <span>{profile.availability}</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/70">
              {profile.mobile && <span>{profile.mobile}</span>}
              {profile.email && <span>{profile.email}</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl.startsWith('http') ? profile.portfolioUrl : `https://${profile.portfolioUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground"
                >
                  <ExternalLink className="w-4 h-4" />
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

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
                <h3 className="text-lg font-semibold text-foreground">Edit details</h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-foreground/10 rounded-md"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSave} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Availability
                  </label>
                  <input
                    value={form.availability}
                    onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="e.g. Immediate, 15 Days"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={form.portfolioUrl}
                    onChange={(e) => setForm((f) => ({ ...f, portfolioUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
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
    </>
  );
}
