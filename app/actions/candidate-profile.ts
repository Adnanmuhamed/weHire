'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireUser } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

import { 
  AddEducationSchema, AddEmploymentSchema, UpdateHeaderDetailsSchema, 
  UpdatePersonalDetailsSchema, AddProjectSchema, AddCertificateSchema 
} from '@/lib/validators/candidate';
import type { z } from 'zod';

/* ========== Education ========== */

export type AddEducationInput = z.infer<typeof AddEducationSchema>;

export interface AddEducationResult {
  success?: boolean;
  error?: string;
  id?: string;
}

export async function addEducation(
  input: AddEducationInput
): Promise<AddEducationResult> {
  try {
    const parsed = AddEducationSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid education data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    const education = await db.education.create({
      data: {
        profileId: profile.id,
        degree: data.degree.trim(),
        college: data.college.trim(),
        stream: data.stream?.trim() || null,
        startYear: data.startYear ?? null,
        endYear: data.endYear ?? null,
        isFullTime: data.isFullTime ?? true,
        grade: data.grade?.trim() || null,
        activities: data.activities?.trim() || null,
      },
      select: { id: true },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, id: education.id };
  } catch (e) {
    console.error('addEducation error:', e);
    return { error: 'Failed to add education' };
  }
}

export interface DeleteEducationResult {
  success?: boolean;
  error?: string;
}

export async function deleteEducation(
  id: string
): Promise<DeleteEducationResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.education.deleteMany({
      where: { id, profileId: profile.id },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error('deleteEducation error:', e);
    return { error: 'Failed to delete education' };
  }
}

export async function updateEducation(
  id: string,
  input: AddEducationInput
): Promise<AddEducationResult> {
  try {
    const parsed = AddEducationSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid education data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.education.updateMany({
      where: { id, profileId: profile.id },
      data: {
        degree: data.degree.trim(),
        college: data.college.trim(),
        stream: data.stream?.trim() || null,
        startYear: data.startYear ?? null,
        endYear: data.endYear ?? null,
        isFullTime: data.isFullTime ?? true,
        grade: data.grade?.trim() || null,
        activities: data.activities?.trim() || null,
      },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, id };
  } catch (e) {
    console.error('updateEducation error:', e);
    return { error: 'Failed to update education' };
  }
}

/* ========== Employment ========== */

export type AddEmploymentInput = z.infer<typeof AddEmploymentSchema>;

export interface AddEmploymentResult {
  success?: boolean;
  error?: string;
  id?: string;
}

export async function addEmployment(
  input: AddEmploymentInput
): Promise<AddEmploymentResult> {
  try {
    const parsed = AddEmploymentSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid employment data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    const employment = await db.employment.create({
      data: {
        profileId: profile.id,
        designation: data.designation.trim(),
        company: data.company.trim(),
        location: data.location?.trim() || null,
        startYear: data.startYear ?? null,
        endYear: data.endYear ?? null,
        isCurrent: data.isCurrent ?? false,
        description: data.description?.trim() || null,
      },
      select: { id: true },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, id: employment.id };
  } catch (e) {
    console.error('addEmployment error:', e);
    return { error: 'Failed to add employment' };
  }
}

export interface DeleteEmploymentResult {
  success?: boolean;
  error?: string;
}

export async function deleteEmployment(
  id: string
): Promise<DeleteEmploymentResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.employment.deleteMany({
      where: { id, profileId: profile.id },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error('deleteEmployment error:', e);
    return { error: 'Failed to delete employment' };
  }
}

export async function updateEmployment(
  id: string,
  input: AddEmploymentInput
): Promise<AddEmploymentResult> {
  try {
    const parsed = AddEmploymentSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid employment data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.employment.updateMany({
      where: { id, profileId: profile.id },
      data: {
        designation: data.designation.trim(),
        company: data.company.trim(),
        location: data.location?.trim() || null,
        startYear: data.startYear ?? null,
        endYear: data.endYear ?? null,
        isCurrent: data.isCurrent ?? false,
        description: data.description?.trim() || null,
      },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, id };
  } catch (e) {
    console.error('updateEmployment error:', e);
    return { error: 'Failed to update employment' };
  }
}

/* ========== Header details (name, contact, social) ========== */

export type UpdateHeaderDetailsInput = z.infer<typeof UpdateHeaderDetailsSchema>;

export interface UpdateHeaderDetailsResult {
  success?: boolean;
  error?: string;
}

export async function updateHeaderDetails(
  input: UpdateHeaderDetailsInput
): Promise<UpdateHeaderDetailsResult> {
  try {
    const parsed = UpdateHeaderDetailsSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid header details data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.profile.update({
      where: { id: profile.id },
      data: {
        fullName: data.fullName?.trim() || undefined,
        mobile: data.mobile?.trim() || undefined,
        email: data.email?.trim() || undefined,
        location: data.location?.trim() || undefined,
        currentLocation: data.currentLocation?.trim() || undefined,
        availability: data.availability?.trim() || undefined,
        linkedinUrl: data.linkedinUrl?.trim() || undefined,
        githubUrl: data.githubUrl?.trim() || undefined,
        portfolioUrl: data.portfolioUrl?.trim() || undefined,
      },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error('updateHeaderDetails error:', e);
    return { error: 'Failed to update details' };
  }
}

/* ========== Resume URL ========== */

export interface UpdateResumeResult {
  success?: boolean;
  error?: string;
}

export async function updateResume(url: string | null, resumeName?: string | null): Promise<UpdateResumeResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.profile.update({
      where: { id: profile.id },
      data: { 
        resumeUrl: url?.trim() || null,
        resumeName: resumeName?.trim() || null,
      },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error('updateResume error:', e);
    return { error: 'Failed to update resume' };
  }
}

/* ========== Cover Letter URL ========== */

export interface UpdateCoverLetterResult {
  success?: boolean;
  error?: string;
}

export async function updateCoverLetter(url: string | null, coverLetterName?: string | null): Promise<UpdateCoverLetterResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.profile.update({
      where: { id: profile.id },
      data: { 
        coverLetterUrl: url?.trim() || null,
        coverLetterName: coverLetterName?.trim() || null,
      },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error('updateCoverLetter error:', e);
    return { error: 'Failed to update cover letter' };
  }
}

/* ========== Avatar ========== */

export interface UpdateAvatarResult {
  success?: boolean;
  error?: string;
}

export async function updateAvatar(url: string | null): Promise<UpdateAvatarResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.profile.update({
      where: { id: profile.id },
      data: { avatarUrl: url?.trim() || null },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error('updateAvatar error:', e);
    return { error: 'Failed to update avatar' };
  }
}

/* ========== Projects ========== */

export type AddProjectInput = z.infer<typeof AddProjectSchema>;

export interface AddProjectResult {
  success?: boolean;
  error?: string;
  id?: string;
}

export async function addProject(input: AddProjectInput): Promise<AddProjectResult> {
  try {
    const parsed = AddProjectSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid project data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    const startDate = data.startDate?.trim() ? new Date(data.startDate.trim()) : null;
    const endDate = data.endDate?.trim() ? new Date(data.endDate.trim()) : null;

    const project = await db.project.create({
      data: {
        profileId: profile.id,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        role: data.role?.trim() || null,
        projectLink: data.projectLink?.trim() || null,
        startDate,
        endDate,
        skills: data.skills || [],
      },
      select: { id: true },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, id: project.id };
  } catch (e) {
    console.error('addProject error:', e);
    return { error: 'Failed to add project' };
  }
}

export interface DeleteProjectResult {
  success?: boolean;
  error?: string;
}

export async function deleteProject(id: string): Promise<DeleteProjectResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.project.deleteMany({
      where: { id, profileId: profile.id },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error('deleteProject error:', e);
    return { error: 'Failed to delete project' };
  }
}

export async function updateProject(
  id: string,
  input: AddProjectInput
): Promise<AddProjectResult> {
  try {
    const parsed = AddProjectSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid project data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    const startDate = data.startDate?.trim() ? new Date(data.startDate.trim()) : null;
    const endDate = data.endDate?.trim() ? new Date(data.endDate.trim()) : null;

    await db.project.updateMany({
      where: { id, profileId: profile.id },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        role: data.role?.trim() || null,
        projectLink: data.projectLink?.trim() || null,
        startDate,
        endDate,
        skills: data.skills || [],
      },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, id };
  } catch (e) {
    console.error('updateProject error:', e);
    return { error: 'Failed to update project' };
  }
}

/* ========== Certificates ========== */

export type AddCertificateInput = z.infer<typeof AddCertificateSchema>;

export interface AddCertificateResult {
  success?: boolean;
  error?: string;
  id?: string;
}

export async function addCertificate(input: AddCertificateInput): Promise<AddCertificateResult> {
  try {
    const parsed = AddCertificateSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid certificate data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    const issueDate = data.issueDate?.trim() ? new Date(data.issueDate.trim()) : null;

    const cert = await db.certificate.create({
      data: {
        profileId: profile.id,
        name: data.name.trim(),
        issuer: data.issuer?.trim() || null,
        issueDate,
        url: data.url?.trim() || null,
        credentialId: data.credentialId?.trim() || null,
      },
      select: { id: true },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, id: cert.id };
  } catch (e) {
    console.error('addCertificate error:', e);
    return { error: 'Failed to add certificate' };
  }
}

export interface DeleteCertificateResult {
  success?: boolean;
  error?: string;
}

export async function deleteCertificate(id: string): Promise<DeleteCertificateResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    await db.certificate.deleteMany({
      where: { id, profileId: profile.id },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error('deleteCertificate error:', e);
    return { error: 'Failed to delete certificate' };
  }
}

export async function updateCertificate(
  id: string,
  input: AddCertificateInput
): Promise<AddCertificateResult> {
  try {
    const parsed = AddCertificateSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid certificate data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    const issueDate = data.issueDate?.trim() ? new Date(data.issueDate.trim()) : null;

    await db.certificate.updateMany({
      where: { id, profileId: profile.id },
      data: {
        name: data.name.trim(),
        issuer: data.issuer?.trim() || null,
        issueDate,
        url: data.url?.trim() || null,
        credentialId: data.credentialId?.trim() || null,
      },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true, id };
  } catch (e) {
    console.error('updateCertificate error:', e);
    return { error: 'Failed to update certificate' };
  }
}

/* ========== Personal details ========== */

export type UpdatePersonalDetailsInput = z.infer<typeof UpdatePersonalDetailsSchema>;

export interface UpdatePersonalDetailsResult {
  success?: boolean;
  error?: string;
}

export async function updatePersonalDetails(
  input: UpdatePersonalDetailsInput
): Promise<UpdatePersonalDetailsResult> {
  try {
    const parsed = UpdatePersonalDetailsSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid personal details data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return { error: 'Profile not found' };

    const dob =
      data.dob && data.dob.trim()
        ? new Date(data.dob.trim())
        : null;

    await db.profile.update({
      where: { id: profile.id },
      data: {
        dob,
        gender: data.gender?.trim() || null,
        maritalStatus: data.maritalStatus?.trim() || null,
        availability: data.availability?.trim() || null,
        resumeHeadline: data.resumeHeadline?.trim() || null,
        profileSummary: data.profileSummary?.trim() || null,
        currentLocation: data.currentLocation?.trim() || null,
        languages: Array.isArray(data.languages) ? data.languages : undefined,
        careerBreak: data.careerBreak ?? undefined,
        differentlyAbled: data.differentlyAbled ?? undefined,
      },
    });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error('updatePersonalDetails error:', e);
    return { error: 'Failed to update personal details' };
  }
}

/* ========== Reviews ========== */

export interface CandidateReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  employer: {
    email: string;
  };
}

export interface GetCandidateReviewsResult {
  success?: boolean;
  error?: string;
  reviews?: CandidateReview[];
  averageRating?: number;
}

export async function getCandidateReviews(): Promise<GetCandidateReviewsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const reviews = await db.candidateReview.findMany({
      where: { candidateId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        author: {
          select: { email: true },
        },
      },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      success: true,
      reviews: reviews.map(r => ({
        ...r,
        employer: r.author
      })),
      averageRating: Math.round(averageRating * 10) / 10,
    };
  } catch (e) {
    console.error('getCandidateReviews error:', e);
    return { error: 'Failed to load reviews' };
  }
}

/* ========== Get full profile ========== */

export interface ProfileDetailsResult {
  success?: boolean;
  error?: string;
  profile?: {
    id: string;
    fullName: string;
    headline: string | null;
    bio: string | null;
    profileSummary: string | null;
    resumeHeadline: string | null;
    skills: string[];
    experience: number;
    resumeUrl: string | null;
    resumeName: string | null;
    coverLetterUrl: string | null;
    coverLetterName: string | null;
    avatarUrl: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    updatedAt: Date;
    college: string | null;
    degree: string | null;
    currentCompany: string | null;
    location: string | null;
    currentLocation: string | null;
    mobile: string | null;
    email: string | null;
    availability: string | null;
    dob: Date | null;
    gender: string | null;
    maritalStatus: string | null;
    languages: string[];
    careerBreak: boolean;
    differentlyAbled: boolean;
    education: Array<{
      id: string;
      degree: string;
      college: string;
      stream: string | null;
      startYear: number | null;
      endYear: number | null;
      isFullTime: boolean;
      grade: string | null;
      activities: string | null;
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
      skills: string[];
    }>;
    certificates: Array<{
      id: string;
      name: string;
      issuer: string | null;
      issueDate: Date | null;
      url: string | null;
      credentialId: string | null;
    }>;
  };
}

export async function getProfileDetails(): Promise<ProfileDetailsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      include: {
        education: true,
        employment: true,
        projects: true,
        certificates: true,
        user: {
          select: { email: true },
        },
      },
    });
    if (!profile) return { error: 'Profile not found' };

    const email = profile.email ?? profile.user.email;

    return {
      success: true,
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        headline: profile.headline,
        bio: profile.bio,
        profileSummary: profile.profileSummary,
        resumeHeadline: profile.resumeHeadline,
        skills: profile.skills,
        experience: profile.experience,
        resumeUrl: profile.resumeUrl,
        resumeName: profile.resumeName,
        coverLetterUrl: profile.coverLetterUrl,
        coverLetterName: profile.coverLetterName,
        avatarUrl: profile.avatarUrl,
        linkedinUrl: profile.linkedinUrl ?? null,
        githubUrl: profile.githubUrl ?? null,
        portfolioUrl: profile.portfolioUrl ?? null,
        updatedAt: profile.updatedAt,
        college: profile.college,
        degree: profile.degree,
        currentCompany: profile.currentCompany,
        location: profile.location,
        currentLocation: profile.currentLocation,
        mobile: profile.mobile,
        email,
        availability: profile.availability,
        dob: profile.dob,
        gender: profile.gender,
        maritalStatus: profile.maritalStatus,
        languages: profile.languages,
        careerBreak: profile.careerBreak,
        differentlyAbled: profile.differentlyAbled,
        education: profile.education,
        employment: profile.employment,
        projects: profile.projects.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          role: p.role,
          projectLink: p.projectLink,
          startDate: p.startDate ?? null,
          endDate: p.endDate ?? null,
          skills: p.skills,
        })),
        certificates: profile.certificates.map((c) => ({
          id: c.id,
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate,
          url: c.url ?? null,
          credentialId: c.credentialId ?? null,
        })),
      },
    };
  } catch (e) {
    console.error('getProfileDetails error:', e);
    return { error: 'Failed to load profile' };
  }
}
