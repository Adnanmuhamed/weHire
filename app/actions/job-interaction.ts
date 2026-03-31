'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireUser } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { JobStatus, WorkMode } from '@prisma/client';
import { toggleSavedJob } from '@/services/saved-job.service';

/* ========== Saved jobs ========== */

export interface ToggleSavedJobResult {
  success?: boolean;
  isSaved?: boolean;
  error?: string;
}

export async function toggleSavedJobAction(
  jobId: string
): Promise<ToggleSavedJobResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    const authUser = requireUser(user);
    const isSaved = await toggleSavedJob(authUser, jobId);
    revalidatePath('/jobs');
    revalidatePath(`/jobs/${jobId}`);
    return { success: true, isSaved };
  } catch (e) {
    console.error('toggleSavedJob error:', e);
    if (e instanceof Error && e.message.includes('not found')) {
      return { error: 'Job not found.' };
    }
    return { error: 'Failed to toggle saved job.' };
  }
}

export interface SavedJobItem {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin: number | null;
  salaryMax: number | null;
  minExperience: number | null;
  maxExperience: number | null;
  createdAt: Date;
  company: { id: string; name: string; logoUrl: string | null };
}

export interface GetSavedJobsResult {
  success?: boolean;
  error?: string;
  jobs?: SavedJobItem[];
}

export async function getSavedJobs(): Promise<GetSavedJobsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const saved = await db.savedJob.findMany({
      where: { userId: user.id, job: { status: JobStatus.OPEN } },
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            jobType: true,
            workMode: true,
            salaryMin: true,
            salaryMax: true,
            minExperience: true,
            maxExperience: true,
            createdAt: true,
            company: {
              select: { id: true, name: true, logoUrl: true },
            },
          },
        },
      },
    });
    const jobs = saved
      .map((s) => s.job)
      .filter(Boolean)
      .map((j) => ({
        ...j,
        jobType: j.jobType as string,
        workMode: j.workMode as string,
      })) as SavedJobItem[];
    return { success: true, jobs };
  } catch (e) {
    console.error('getSavedJobs error:', e);
    return { error: 'Failed to load saved jobs' };
  }
}

/* ========== Job preferences ========== */

export interface UpdateJobPreferencesInput {
  locations?: string[];
  titles?: string[];
  expectedSalaryMin?: number | null;
  expectedSalaryMax?: number | null;
  workModes?: WorkMode[];
  industries?: string[];
  departments?: string[];
}

export interface UpdateJobPreferencesResult {
  success?: boolean;
  error?: string;
}

export interface JobPreferencesResult {
  success?: boolean;
  error?: string;
  preferences?: {
    locations: string[];
    titles: string[];
    expectedSalaryMin: number | null;
    expectedSalaryMax: number | null;
    workModes: WorkMode[];
    industries: string[];
    departments: string[];
  } | null;
}

export async function getJobPreferences(): Promise<JobPreferencesResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);
    const prefs = await db.jobPreference.findUnique({
      where: { userId: user.id },
    });
    return {
      success: true,
      preferences: prefs
        ? {
            locations: prefs.locations,
            titles: prefs.titles,
            expectedSalaryMin: prefs.expectedSalaryMin,
            expectedSalaryMax: prefs.expectedSalaryMax,
            workModes: prefs.workModes,
            industries: (prefs as any).industries ?? [],
            departments: (prefs as any).departments ?? [],
          }
        : null,
    };
  } catch (e) {
    console.error('getJobPreferences error:', e);
    return { error: 'Failed to load preferences' };
  }
}

export async function updateJobPreferences(
  data: UpdateJobPreferencesInput
): Promise<UpdateJobPreferencesResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    await db.jobPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        locations: data.locations ?? [],
        titles: data.titles ?? [],
        expectedSalaryMin: data.expectedSalaryMin ?? null,
        expectedSalaryMax: data.expectedSalaryMax ?? null,
        workModes: data.workModes ?? [],
        industries: data.industries ?? [],
        departments: data.departments ?? [],
      },
      update: {
        locations: data.locations ?? undefined,
        titles: data.titles ?? undefined,
        expectedSalaryMin: data.expectedSalaryMin ?? undefined,
        expectedSalaryMax: data.expectedSalaryMax ?? undefined,
        workModes: data.workModes ?? undefined,
        industries: data.industries ?? undefined,
        departments: data.departments ?? undefined,
      },
    });
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    return { success: true };
  } catch (e) {
    console.error('updateJobPreferences error:', e);
    return { error: 'Failed to update job preferences' };
  }
}

export interface RecommendedJobItem {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  workMode: string;
  salaryMin: number | null;
  salaryMax: number | null;
  minExperience: number | null;
  maxExperience: number | null;
  createdAt: Date;
  company: { id: string; name: string; logoUrl: string | null };
}

export interface GetRecommendedJobsResult {
  success?: boolean;
  error?: string;
  jobs?: RecommendedJobItem[];
}

/**
 * Fetch jobs matching the user's JobPreference (location, title, workMode, salary).
 */
export async function getRecommendedJobs(): Promise<GetRecommendedJobsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const prefs = await db.jobPreference.findUnique({
      where: { userId: user.id },
    });
    if (!prefs || (prefs.locations.length === 0 && prefs.titles.length === 0 && prefs.workModes.length === 0 && ((prefs as any).industries ?? []).length === 0)) {
      // No preferences: return recent open jobs
      const jobs = await db.job.findMany({
        where: { status: JobStatus.OPEN },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          jobType: true,
          workMode: true,
          salaryMin: true,
          salaryMax: true,
          minExperience: true,
          maxExperience: true,
          createdAt: true,
          company: { select: { id: true, name: true, logoUrl: true } },
        },
      });
      return {
        success: true,
        jobs: jobs.map((j) => ({
          ...j,
          jobType: j.jobType as string,
          workMode: j.workMode as string,
        })) as RecommendedJobItem[],
      };
    }

    const orConditions: Record<string, unknown>[] = [];

    if (prefs.locations.length > 0) {
      orConditions.push({
        location: { in: prefs.locations },
      });
    }
    if (prefs.titles.length > 0) {
      for (const t of prefs.titles) {
        orConditions.push({
          title: { contains: t, mode: 'insensitive' },
        });
      }
    }
    if (prefs.workModes.length > 0) {
      orConditions.push({
        workMode: { in: prefs.workModes },
      });
    }
    if (prefs.expectedSalaryMin != null) {
      orConditions.push({
        salaryMin: { gte: prefs.expectedSalaryMin },
      });
    }
    // Match on industries
    const prefsIndustries: string[] = (prefs as any).industries ?? [];
    if (prefsIndustries.length > 0) {
      orConditions.push({
        industryType: { in: prefsIndustries },
      });
    }
    // Match on departments
    const prefsDepartments: string[] = (prefs as any).departments ?? [];
    if (prefsDepartments.length > 0) {
      orConditions.push({
        department: { in: prefsDepartments },
      });
    }

    const where: Record<string, unknown> = {
      status: JobStatus.OPEN,
    };

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    const jobs = await db.job.findMany({
      where,
      take: 30,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        jobType: true,
        workMode: true,
        salaryMin: true,
        salaryMax: true,
        minExperience: true,
        maxExperience: true,
        createdAt: true,
        company: { select: { id: true, name: true, logoUrl: true } },
      },
    });
    return {
      success: true,
      jobs: jobs.map((j) => ({
        ...j,
        jobType: j.jobType as string,
        workMode: j.workMode as string,
      })) as RecommendedJobItem[],
    };
  } catch (e) {
    console.error('getRecommendedJobs error:', e);
    return { error: 'Failed to load recommended jobs' };
  }
}

/**
 * Fetch latest open jobs (for fallback when no recommendations).
 */
export async function getLatestJobs(
  limit: number = 15
): Promise<GetRecommendedJobsResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    requireUser(user);

    const jobs = await db.job.findMany({
      where: { status: JobStatus.OPEN },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        jobType: true,
        workMode: true,
        salaryMin: true,
        salaryMax: true,
        minExperience: true,
        maxExperience: true,
        createdAt: true,
        company: { select: { id: true, name: true, logoUrl: true } },
      },
    });
    return {
      success: true,
      jobs: jobs.map((j) => ({
        ...j,
        jobType: j.jobType as string,
        workMode: j.workMode as string,
      })) as RecommendedJobItem[],
    };
  } catch (e) {
    console.error('getLatestJobs error:', e);
    return { error: 'Failed to load latest jobs' };
  }
}
