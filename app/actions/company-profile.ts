'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { UpdateCompanyProfileSchema } from '@/lib/validators/company-profile';
import type { z } from 'zod';

export type UpdateCompanyProfileInput = z.infer<typeof UpdateCompanyProfileSchema>;

export interface UpdateCompanyProfileResult {
  success?: boolean;
  error?: string;
}

export async function updateCompanyProfile(
  input: UpdateCompanyProfileInput
): Promise<UpdateCompanyProfileResult> {
  try {
    const parsed = UpdateCompanyProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || 'Invalid company profile data' };
    }
    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    if (user.role !== Role.EMPLOYER) {
      return { error: 'Only employers can update company profile' };
    }

    const company = await db.company.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });

    if (!company) return { error: 'Company not found' };

    await db.company.update({
      where: { id: company.id },
      data: {
        industryType: data.industryType?.trim() || undefined,
        websiteUrl: data.websiteUrl?.trim() || undefined,
        address: data.address?.trim() || undefined,
        city: data.city?.trim() || undefined,
        state: data.state?.trim() || undefined,
        pincode: data.pincode?.trim() || undefined,
        gstin: data.gstin?.trim() || undefined,
        about: data.about?.trim() || undefined,
        foundedYear: data.foundedYear?.trim() || undefined,
        companyType: data.companyType?.trim() || undefined,
        companySize: data.companySize?.trim() || undefined,
        headquarters: data.headquarters?.trim() || undefined,
      },
    });

    if (data.designation) {
      await db.user.update({
        where: { id: user.id },
        data: { designation: data.designation.trim() },
      });
    }

    revalidatePath('/employer/company-profile');
    revalidatePath('/employer');
    return { success: true };
  } catch (e) {
    console.error('updateCompanyProfile error:', e);
    return { error: 'Failed to update company profile' };
  }
}

export interface GetCompanyProfileResult {
  success?: boolean;
  error?: string;
  company?: {
    id: string;
    name: string;
    industryType: string | null;
    websiteUrl: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    gstin: string | null;
    about: string | null;
    foundedYear: string | null;
    companyType: string | null;
    companySize: string | null;
    headquarters: string | null;
    employeeCount: string | null;
    logoUrl: string | null;
    rating: number | null;
  };
  user?: {
    email: string;
    mobile: string | null;
    designation: string | null;
    role: string;
  };
}

export async function getCompanyProfile(): Promise<GetCompanyProfileResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    if (user.role !== Role.EMPLOYER) {
      return { error: 'Only employers can access company profile' };
    }

    const userDetails = await db.user.findUnique({
      where: { id: user.id },
      select: { email: true, mobile: true, designation: true, role: true },
    });
    if (!userDetails) return { error: 'User not found' };

    // Find or auto-create a company row so the profile page always loads
    let company = await db.company.findUnique({ where: { ownerId: user.id } });
    if (!company) {
      company = await db.company.create({
        data: {
          name: userDetails.email.split('@')[0] || 'My Company',
          description: '',
          ownerId: user.id,
        },
      });
    }

    return {
      success: true,
      company: {
        id: company.id,
        name: company.name,
        industryType: company.industryType,
        websiteUrl: company.websiteUrl,
        address: company.address,
        city: company.city,
        state: company.state,
        pincode: company.pincode,
        gstin: company.gstin,
        about: company.about,
        foundedYear: company.foundedYear,
        companyType: company.companyType,
        companySize: company.companySize,
        headquarters: company.headquarters,
        employeeCount: company.employeeCount,
        logoUrl: company.logoUrl,
        rating: company.rating,
      },
      user: {
        email: userDetails.email,
        mobile: userDetails.mobile,
        designation: userDetails.designation,
        role: userDetails.role,
      },
    };
  } catch (e) {
    console.error('getCompanyProfile error:', e);
    return { error: 'Failed to load company profile' };
  }
}
