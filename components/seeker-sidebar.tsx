import Link from 'next/link';
import { User, GraduationCap, Building2, MapPin, Edit } from 'lucide-react';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';

/**
 * Seeker Sidebar Component
 * 
 * Server Component that displays a profile card for job seekers.
 * Shows user photo/initials, name, college, and current company.
 * Includes a "Complete Profile" button linking to /profile.
 */

interface SeekerSidebarProps {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

async function getProfile(userId: string) {
  try {
    const profile = await db.profile.findUnique({
      where: { userId },
      select: {
        fullName: true,
        headline: true,
        avatarUrl: true,
        college: true,
        degree: true,
        currentCompany: true,
        location: true,
      },
    });
    return profile;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
}

function getInitials(email: string, name?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || email[0]?.toUpperCase() || 'U';
  }
  return email[0]?.toUpperCase() || 'U';
}

export default async function SeekerSidebar({ user }: SeekerSidebarProps) {
  const profile = await getProfile(user.id);
  const displayName = profile?.fullName || 'Complete your profile';
  const initials = getInitials(user.email, profile?.fullName);

  // Check if profile is complete (has all optional fields)
  const isProfileComplete =
    profile?.college && profile?.currentCompany && profile?.location;

  return (
    <aside className="w-full lg:w-64">
      <div className="rounded-lg border border-foreground/10 bg-background p-6 space-y-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-foreground/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-foreground/20 flex items-center justify-center text-2xl font-medium text-foreground border-2 border-foreground/10">
              {initials}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {displayName}
            </h3>
            {profile?.headline && (
              <p className="text-sm text-foreground/70 mt-1">
                {profile.headline}
              </p>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-3 pt-4 border-t border-foreground/10">
          {profile?.college && (
            <div className="flex items-start gap-3 text-sm">
              <GraduationCap className="w-4 h-4 text-foreground/60 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-foreground/80">{profile.college}</span>
                {profile.degree && (
                  <p className="text-foreground/60 text-xs mt-0.5">{profile.degree}</p>
                )}
              </div>
            </div>
          )}

          {profile?.currentCompany && (
            <div className="flex items-start gap-3 text-sm">
              <Building2 className="w-4 h-4 text-foreground/60 mt-0.5 flex-shrink-0" />
              <span className="text-foreground/80">{profile.currentCompany}</span>
            </div>
          )}

          {profile?.location && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-foreground/60 mt-0.5 flex-shrink-0" />
              <span className="text-foreground/80">{profile.location}</span>
            </div>
          )}

          {!isProfileComplete && (
            <div className="pt-4">
              <Link
                href="/profile"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Complete Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

