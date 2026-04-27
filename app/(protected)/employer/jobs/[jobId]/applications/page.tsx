import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import { KanbanBoard } from '@/components/employer/kanban/kanban-board';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobApplicationsPage({ params }: PageProps) {
  const { jobId } = await params;
  const user = await getCurrentUser();

  if (!user || user.role !== Role.EMPLOYER) {
    notFound();
  }

  // Verify job ownership and pull applications deeply
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      company: true,
      applications: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            include: {
              profile: {
                include: {
                  employment: {
                    orderBy: { startYear: 'desc' }
                  },
                  education: {
                    orderBy: { startYear: 'desc' }
                  },
                  projects: {
                    orderBy: { startDate: 'desc' }
                  },
                  certificates: {
                    orderBy: { issueDate: 'desc' }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!job || job.company.ownerId !== user.id) {
    notFound();
  }

  // Map Prisma data to SlideOverApplication
  const mappedApplications = job.applications.map(app => ({
    id: app.id,
    status: app.status,
    appliedDate: app.createdAt,
    resumeUrl: app.resumeUrl,
    resumeName: app.resumeName,
    coverLetterUrl: app.coverLetterUrl,
    coverLetterName: app.coverLetterName,
    user: {
      id: app.user.id,
      email: app.user.email,
      mobileNumber: app.user.mobileNumber,
      profile: app.user.profile ? {
        fullName: app.user.profile.fullName,
        headline: app.user.profile.resumeHeadline || app.user.profile.headline,
        profilePic: app.user.profile.avatarUrl,
        resumeUrl: app.user.profile.resumeUrl,
        resumeName: app.user.profile.resumeName,
        coverLetterUrl: app.user.profile.coverLetterUrl,
        coverLetterName: app.user.profile.coverLetterName,
        education: app.user.profile.education,
        experience: app.user.profile.employment,
        location: app.user.profile.location,
        totalExperience: app.user.profile.experience,
        bio: app.user.profile.bio,
        profileSummary: app.user.profile.profileSummary,
        skills: app.user.profile.skills,
        linkedinUrl: app.user.profile.linkedinUrl,
        githubUrl: app.user.profile.githubUrl,
        portfolioUrl: app.user.profile.portfolioUrl,
        projects: app.user.profile.projects,
        certificates: app.user.profile.certificates,
      } : null,
    }
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-full flex-grow flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <Link
            href="/employer/jobs"
            className="text-sm font-medium text-foreground/60 hover:text-foreground mb-3 inline-block transition-colors"
          >
            &larr; Back to Jobs
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Applicants for {job.title}
              </h1>
              <p className="text-foreground/60 text-sm mt-1">
                {mappedApplications.length}{' '}
                {mappedApplications.length === 1 ? 'applicant' : 'applicants'}
              </p>
            </div>
          </div>
        </div>

        {mappedApplications.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-foreground/10 rounded-xl bg-background/50 flex flex-col items-center justify-center m-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">No applicants yet.</h3>
            <p className="text-sm text-foreground/60 max-w-sm text-center">
              Share your job posting and applications will automatically populate across this Kanban board.
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-[500px]">
             <KanbanBoard initialApplications={mappedApplications} />
          </div>
        )}
      </div>
    </div>
  );
}
