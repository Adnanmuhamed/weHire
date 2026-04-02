'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { UpdateCompanySchema } from '@/lib/validators/company';
import type { UpdateCompanyInput } from '@/lib/validators/company';

export type { UpdateCompanyInput } from '@/lib/validators/company';

export interface UpdateCompanyResult {
  success?: boolean;
  error?: string;
}

/**
 * Update the current employer's company profile.
 * Auth: user must be EMPLOYER and own the company.
 */
export async function updateCompany(
  input: UpdateCompanyInput
): Promise<UpdateCompanyResult> {
  try {
    const parsed = UpdateCompanySchema.safeParse(input);
    if (!parsed.success) {
      const firstError =
        parsed.error.errors[0]?.message ?? 'Invalid company data';
      return { error: firstError };
    }

    const user = await getCurrentUser();
    if (!user) return { error: 'You must be logged in.' };
    const employer = requireEmployer(user);

    const company = await db.company.findUnique({
      where: { ownerId: employer.id },
      select: { id: true },
    });
    if (!company)
      return { error: 'Company profile not found. Please contact support.' };

    const data = parsed.data;
    await db.company.update({
      where: { id: company.id },
      data: {
        name: data.name.trim(),
        description: (data.description?.trim() ?? '') || '',
        website: data.website?.trim() || null,
        location: data.location.trim(),
        logoUrl: data.logoUrl?.trim() || null,
        companyType: data.type,
        companySize: data.size?.trim() || null,
      },
    });

    revalidatePath('/companies');
    revalidatePath(`/companies/${company.id}`);
    return { success: true };
  } catch (e) {
    console.error('updateCompany error:', e);
    return { error: 'Failed to update company profile. Please try again.' };
  }
}

/* ================ Top Companies ================ */

export interface TopCompanyItem {
  id: string;
  name: string;
  logoUrl: string | null;
  location: string | null;
  type: string;
  openJobCount: number;
}

export interface GetTopCompaniesResult {
  success?: boolean;
  error?: string;
  companies?: TopCompanyItem[];
}

/**
 * Fetch top companies by number of open jobs.
 * Public — no authentication required.
 */
export async function getTopCompanies(
  limit: number = 6
): Promise<GetTopCompaniesResult> {
  try {
    const companies = await db.company.findMany({
      where: {
        jobs: {
          some: { status: 'OPEN' },
        },
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        headquarters: true,
        companyType: true,
        _count: { select: { jobs: { where: { status: 'OPEN' } } } },
      },
      orderBy: {
        jobs: { _count: 'desc' },
      },
      take: limit,
    });

    return {
      success: true,
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl,
        location: c.headquarters,
        type: c.companyType || 'Company',
        openJobCount: c._count.jobs,
      })),
    };
  } catch (e) {
    console.error('getTopCompanies error:', e);
    return { error: 'Failed to load top companies' };
  }
}
