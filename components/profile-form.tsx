'use client';

/**
 * Profile Form Component
 *
 * Client Component for editing user profile.
 * Handles all profile fields including skills tag input.
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateProfile } from '@/app/actions/profile';
import { Save, Phone } from 'lucide-react';
import FileUpload from './file-upload';

interface ProfileFormProps {
  initialData: {
    id: string;
    fullName: string;
    headline: string | null;
    bio: string | null;
    skills: string[];
    experience: number;
    resumeUrl: string | null;
    avatarUrl: string | null;
    college: string | null;
    degree: string | null;
    currentCompany: string | null;
    location: string | null;
    mobile: string | null;
  };
  userId?: string;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(initialData.fullName);
  const [headline, setHeadline] = useState(initialData.headline || '');
  const [bio, setBio] = useState(initialData.bio || '');
  const [skillsString, setSkillsString] = useState(
    (initialData.skills || []).join(', ')
  );
  const [experience, setExperience] = useState(initialData.experience || 0);
  const [resumeUrl, setResumeUrl] = useState(initialData.resumeUrl || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || '');
  const [college, setCollege] = useState(initialData.college || '');
  const [degree, setDegree] = useState(initialData.degree || '');
  const [currentCompany, setCurrentCompany] = useState(initialData.currentCompany || '');
  const [location, setLocation] = useState(initialData.location || '');
  const [mobile, setMobile] = useState(initialData.mobile || '');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const result = await updateProfile({
        fullName: fullName.trim(),
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        skills: skillsString.trim() || '',
        experience,
        resumeUrl: resumeUrl?.trim() || undefined,
        location: location.trim() || undefined,
        mobile: mobile.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        toast.success('Profile updated successfully!');
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <div className="bg-background border border-foreground/10 rounded-lg p-6 space-y-6">
        {/* Avatar Upload */}
        <div>
          <FileUpload
            fileType="image"
            label="Profile Picture"
            value={avatarUrl || null}
            onChange={(url) => setAvatarUrl(url || '')}
            maxSizeMB={5}
          />
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-foreground">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Headline */}
        <div>
          <label htmlFor="headline" className="block text-sm font-medium mb-2 text-foreground">
            Headline
          </label>
          <input
            id="headline"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g., Senior React Developer"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2 text-foreground">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent resize-none"
          />
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium mb-2 text-foreground">
            Skills
          </label>
          <input
            id="skills"
            type="text"
            value={skillsString}
            onChange={(e) => setSkillsString(e.target.value)}
            placeholder="React, Node.js, TypeScript"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Experience */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium mb-2 text-foreground">
            Experience (Years)
          </label>
          <input
            id="experience"
            type="number"
            value={experience}
            onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
            min="0"
            max="50"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* College */}
        <div>
          <label htmlFor="college" className="block text-sm font-medium mb-2 text-foreground">
            College
          </label>
          <input
            id="college"
            type="text"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="Your college or university"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Degree */}
        <div>
          <label htmlFor="degree" className="block text-sm font-medium mb-2 text-foreground">
            Degree
          </label>
          <input
            id="degree"
            type="text"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            placeholder="e.g., B.Tech Computer Science"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Current Company */}
        <div>
          <label htmlFor="currentCompany" className="block text-sm font-medium mb-2 text-foreground">
            Current Company
          </label>
          <input
            id="currentCompany"
            type="text"
            value={currentCompany}
            onChange={(e) => setCurrentCompany(e.target.value)}
            placeholder="Your current employer"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2 text-foreground">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State, Country"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium mb-2 text-foreground">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              placeholder="+1 (555) 123-4567"
              className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
            />
          </div>
          <p className="mt-1 text-xs text-foreground/60">
            Required for account recovery and notifications
          </p>
        </div>

        {/* Resume Link */}
        <div>
          <label htmlFor="resumeUrl" className="block text-sm font-medium mb-2 text-foreground">
            Resume Link
          </label>
          <input
            id="resumeUrl"
            type="url"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="Link to Google Drive / LinkedIn"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

