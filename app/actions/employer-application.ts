'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';

/**
 * Get full applicant profile for employer view.
 * Auth: EMPLOYER. Security: application must belong to a job posted by this employer.
 */
export interface ApplicantProfileResult {
  success?: boolean;
  error?: string;
  application?: {
    id: string;
    jobId: string;
    status: string;
    coverNote: string | null;
    createdAt: Date;
    job: { id: string; title: string };
    user: {
      id: string;
      email: string;
      mobileNumber: string | null;
      profile: {
        fullName: string;
        headline: string | null;
        profileSummary: string | null;
        resumeHeadline: string | null;
        skills: string[];
        experience: number;
        resumeUrl: string | null;
        avatarUrl: string | null;
        mobile: string | null;
        email: string | null;
        currentLocation: string | null;
        location: string | null;
        linkedinUrl: string | null;
        githubUrl: string | null;
        portfolioUrl: string | null;
        availability: string | null;
        education: Array<{
          id: string;
          degree: string;
          college: string;
          stream: string | null;
          startYear: number | null;
          endYear: number | null;
          isFullTime: boolean;
        }>;
        employment: Array<{
          id: string;
          designation: string;
          company: string;
          location: string | null;
          startYear: number | null;
          endYear: number | null;
          isCurrent: boolean;
          description: string | null;
        }>;
        projects: Array<{
          id: string;
          title: string;
          description: string | null;
          role: string | null;
          projectLink: string | null;
          startDate: Date | null;
          endDate: Date | null;
        }>;
        certificates: Array<{
          id: string;
          name: string;
          issuer: string | null;
          issueDate: Date | null;
          url: string | null;
        }>;
      } | null;
    };
  };
}

export async function getApplicantProfile(
  applicationId: string
): Promise<ApplicantProfileResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    if (user.role !== Role.EMPLOYER && user.role !== Role.ADMIN) {
      return { error: 'Access denied.' };
    }

    const company = await db.company.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!company) return { error: 'Company not found.' };

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        job: { select: { id: true, title: true, companyId: true } },
        user: {
          select: {
            id: true,
            email: true,
            mobileNumber: true,
            profile: {
              include: {
                education: true,
                employment: true,
                projects: true,
                certificates: true,
              },
            },
          },
        },
      },
    });

    if (!application) return { error: 'Application not found.' };
    if (application.job.companyId !== company.id) {
      return { error: 'Application not found or access denied.' };
    }

    return {
      success: true,
      application: {
        id: application.id,
        jobId: application.jobId,
        status: application.status,
        coverNote: application.coverNote,
        createdAt: application.createdAt,
        job: { id: application.job.id, title: application.job.title },
        user: {
          id: application.user.id,
          email: application.user.email,
          mobileNumber: application.user.mobileNumber,
          profile: application.user.profile
            ? {
                fullName: application.user.profile.fullName,
                headline: application.user.profile.headline,
                profileSummary: application.user.profile.profileSummary,
                resumeHeadline: application.user.profile.resumeHeadline,
                skills: application.user.profile.skills,
                experience: application.user.profile.experience,
                resumeUrl: application.user.profile.resumeUrl,
                avatarUrl: application.user.profile.avatarUrl,
                mobile: application.user.profile.mobile,
                email: application.user.profile.email,
                currentLocation: application.user.profile.currentLocation,
                location: application.user.profile.location,
                linkedinUrl: application.user.profile.linkedinUrl ?? null,
                githubUrl: application.user.profile.githubUrl ?? null,
                portfolioUrl: application.user.profile.portfolioUrl ?? null,
                availability: application.user.profile.availability,
                education: application.user.profile.education,
                employment: application.user.profile.employment,
                projects: application.user.profile.projects,
                certificates: application.user.profile.certificates,
              }
            : null,
        },
      },
    };
  } catch (e) {
    console.error('getApplicantProfile error:', e);
    return { error: 'Failed to load applicant profile.' };
  }
}
