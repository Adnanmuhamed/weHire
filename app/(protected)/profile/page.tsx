import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile-form';

/**
 * Profile Page
 * 
 * Protected Server Component for editing user profile.
 * Fetches current user and profile, creates default if none exists.
 */

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/profile');
  }

  // Fetch existing profile or create default
  let profile = await db.profile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      fullName: true,
      headline: true,
      bio: true,
      skills: true,
      experience: true,
      resumeUrl: true,
      avatarUrl: true,
      college: true,
      degree: true,
      currentCompany: true,
      location: true,
      mobile: true,
    },
  });

  // If no profile exists, create a default empty profile object
  const defaultProfile = {
    id: '',
    fullName: user.email.split('@')[0] || 'User',
    headline: null,
    bio: null,
    skills: [] as string[],
    experience: 0,
    resumeUrl: null,
    avatarUrl: null,
    college: null,
    degree: null,
    currentCompany: null,
    location: null,
    mobile: null,
  };

  const profileData = profile || defaultProfile;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Edit Profile</h1>
            <p className="text-foreground/70">
              Complete your profile to help employers find you
            </p>
          </div>

          <ProfileForm initialData={profileData} userId={user.id} />
        </div>
      </div>
    </div>
  );
}

