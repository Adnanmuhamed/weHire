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
        type: data.type,
        size: data.size?.trim() || null,
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
