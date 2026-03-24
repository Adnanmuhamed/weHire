import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getApplicantProfile } from '@/app/actions/employer-application';
import StatusSelect from '@/components/employer/status-select';
import { ApplicationStatus } from '@prisma/client';
import ProfileHeaderCard from '@/components/profile/profile-header-card';
import ResumeSection from '@/components/profile/resume-section';
import EmploymentSection from '@/components/profile/employment-section';
import EducationSection from '@/components/profile/education-section';
import ProjectsSection from '@/components/profile/projects-section';
import KeySkillsSection from '@/components/profile/key-skills-section';
import RateCandidateButton from '@/components/employer/rate-candidate-button';

interface PageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function ApplicantViewPage({ params }: PageProps) {
  const { applicationId } = await params;
  const result = await getApplicantProfile(applicationId);

  if (!result.success || !result.application) {
    if (
      result.error?.includes('not found') ||
      result.error?.includes('denied') ||
      result.error?.includes('Access')
    ) {
      notFound();
    }
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-foreground/70">{result.error}</p>
        </div>
      </div>
    );
  }

  const app = result.application;
  const profile = app.user.profile;
  const jobTitle = app.job.title;
  const jobId = app.job.id;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link
            href={`/employer/jobs/${jobId}/applications`}
            className="text-sm text-foreground/70 hover:underline mb-4 inline-block"
          >
            ← Back to applicants
          </Link>
          <p className="text-foreground/70">This candidate has not completed a profile.</p>
          <p className="text-sm text-foreground/60 mt-2">{app.user.email}</p>
          <div className="mt-4">
            <StatusSelect applicationId={app.id} currentStatus={app.status as ApplicationStatus} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <Link
          href={`/employer/jobs/${jobId}/applications`}
          className="text-sm text-foreground/70 hover:underline mb-4 inline-block"
        >
          ← Back to applicants for {jobTitle}
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/60">Application Status:</span>
            <StatusSelect applicationId={app.id} currentStatus={app.status as ApplicationStatus} />
          </div>
          <RateCandidateButton
            candidateId={profile.id}
            candidateName={profile.fullName}
          />
        </div>

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
            email: profile.email ?? app.user.email,
            linkedinUrl: profile.linkedinUrl,
            githubUrl: profile.githubUrl,
            portfolioUrl: profile.portfolioUrl,
            updatedAt: new Date(),
          }}
          readOnly
        />

        {profile.profileSummary && (
          <section className="border-b border-foreground/10 pb-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-2">
              Summary
            </h2>
            <p className="text-foreground/90 whitespace-pre-wrap">{profile.profileSummary}</p>
          </section>
        )}

        <ResumeSection resumeUrl={profile.resumeUrl} readOnly />

        <KeySkillsSection skills={profile.skills} readOnly />

        <EmploymentSection employment={profile.employment} readOnly />

        <EducationSection education={profile.education} readOnly />

        <ProjectsSection projects={profile.projects} readOnly />
      </div>
    </div>
  );
}
