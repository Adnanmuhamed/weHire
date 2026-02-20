import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProfileDetails } from '@/app/actions/candidate-profile';
import ProfileForm from '@/components/profile-form';
import ProfileHeaderCard from '@/components/profile/profile-header-card';
import ResumeSection from '@/components/profile/resume-section';
import ResumeHeadlineSection from '@/components/profile/resume-headline-section';
import KeySkillsSection from '@/components/profile/key-skills-section';
import EmploymentSection from '@/components/profile/employment-section';
import EducationSection from '@/components/profile/education-section';
import ProjectsSection from '@/components/profile/projects-section';
import CertificationsSection from '@/components/profile/certifications-section';
import PersonalDetailsSection from '@/components/profile/personal-details-section';

/**
 * Profile Page – Resume/CV style for candidates.
 * Uses getProfileDetails; if no profile exists, show setup form.
 */
export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/profile');

  const result = await getProfileDetails();
  if (result.error || !result.profile) {
    const defaultProfile = {
      id: '',
      fullName: user.email?.split('@')[0] || 'User',
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
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-2">Complete your profile</h1>
            <p className="text-foreground/70 mb-6">
              Add your basic details to create your resume. You can add more sections later.
            </p>
            <ProfileForm initialData={defaultProfile} userId={user.id} />
          </div>
        </div>
      </div>
    );
  }

  const profile = result.profile;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <ProfileHeaderCard
            profile={{
              fullName: profile.fullName,
              resumeHeadline: profile.resumeHeadline,
              avatarUrl: profile.avatarUrl,
              currentLocation: profile.currentLocation,
              location: profile.location,
              experience: profile.experience,
              availability: profile.availability,
              mobile: profile.mobile,
              email: profile.email,
              linkedinUrl: profile.linkedinUrl ?? null,
              githubUrl: profile.githubUrl ?? null,
              portfolioUrl: profile.portfolioUrl ?? null,
              updatedAt: profile.updatedAt,
            }}
          />

          <div className="space-y-6">
            <ResumeSection resumeUrl={profile.resumeUrl} />

            <ResumeHeadlineSection resumeHeadline={profile.resumeHeadline} />

            <KeySkillsSection
              skills={profile.skills}
              profilePayload={{
                fullName: profile.fullName,
                headline: profile.headline ?? undefined,
                bio: profile.bio ?? undefined,
                experience: profile.experience,
                resumeUrl: profile.resumeUrl ?? undefined,
                location: profile.location ?? undefined,
                mobile: profile.mobile ?? undefined,
              }}
            />

            <EmploymentSection employment={profile.employment} />

            <EducationSection education={profile.education} />

            <ProjectsSection projects={profile.projects} />

            <CertificationsSection certificates={profile.certificates} />

            <PersonalDetailsSection
              details={{
                dob: profile.dob,
                gender: profile.gender,
                maritalStatus: profile.maritalStatus,
                availability: profile.availability,
                currentLocation: profile.currentLocation,
                languages: profile.languages ?? [],
                careerBreak: profile.careerBreak ?? false,
                differentlyAbled: profile.differentlyAbled ?? false,
              }}
            />
          </div>

          <p className="mt-8 text-center text-sm text-foreground/60">
            <Link href="/dashboard" className="hover:underline">
              ← Back to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
