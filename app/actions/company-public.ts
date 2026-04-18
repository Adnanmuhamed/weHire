'use server';

import { db } from '@/lib/db';
import { JobStatus, JobType } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Public Company Server Actions
 *
 * Server-side actions for fetching company directory data.
 * Accessible without authentication.
 */

export interface CompanyListFilters {
  search?: string;
  /** Single location or multiple (OR within location, AND with other filters) */
  location?: string | string[];
  type?: string | string[];
  industry?: string | string[];
  size?: string | string[];
}

export interface CompanyLocationCount {
  location: string;
  count: number;
}

export interface GetCompanyLocationsResult {
  success?: boolean;
  error?: string;
  locations?: CompanyLocationCount[];
}

export interface CompanyListItem {
  id: string;
  name: string;
  logoUrl: string | null;
  location: string | null; // mapping headquarters to UI
  type: string | null;     // mapping companyType to UI
}

export interface CompanyProfileJob {
  id: string;
  title: string;
  location: string;
  jobType: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: Date;
}

export interface CompanyProfile {
  id: string;
  name: string;
  description: string;
  website: string | null;
  location: string | null;
  logoUrl: string | null;
  type: string | null;
  size: string | null;
  jobs: CompanyProfileJob[];
}

export interface GetAllCompaniesResult {
  success?: boolean;
  error?: string;
  companies?: CompanyListItem[];
}

export interface GetCompanyProfileResult {
  success?: boolean;
  error?: string;
  company?: CompanyProfile;
}

/**
 * Fetch companies for the directory with optional filters.
 * Search (name), location(s), and type are ANDed together.
 * Multiple locations are ORed (company in any of the selected locations).
 */
export async function getAllCompanies(
  filter: CompanyListFilters = {}
): Promise<GetAllCompaniesResult> {
  try {
    const where: Record<string, unknown> = {};
    const { search, location, type, industry, size } = filter;

    if (search && search.trim().length > 0) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const locations = Array.isArray(location)
      ? location.map((l) => l?.trim()).filter(Boolean)
      : location?.trim()
        ? [location.trim()]
        : [];
    if (locations.length > 0) {
      where.headquarters = locations.length === 1
        ? locations[0]
        : { in: locations };
    }

    if (type !== undefined) {
      where.companyType = Array.isArray(type) ? { in: type } : type;
    }
    
    if (industry !== undefined) {
      where.industryType = Array.isArray(industry) ? { in: industry } : industry;
    }
    
    if (size !== undefined) {
      where.companySize = Array.isArray(size) ? { in: size } : size;
    }

    const companies = await db.company.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        headquarters: true,
        companyType: true,
      },
    });
    
    // Map internal DB keys back to UI expected keys
    const mappedCompanies = companies.map(c => ({
      id: c.id,
      name: c.name,
      logoUrl: c.logoUrl,
      location: c.headquarters,
      type: c.companyType,
    }));
    
    return { success: true, companies: mappedCompanies };
  } catch (e) {
    console.error('getAllCompanies error:', e);
    return { success: false, error: 'Failed to load companies' };
  }
}

/**
 * Fetch unique company locations with counts, ordered by count descending.
 * Used to populate the location filter sidebar.
 */
export async function getCompanyLocations(): Promise<GetCompanyLocationsResult> {
  try {
    const rows = await db.company.groupBy({
      by: ['headquarters'],
      where: {
        headquarters: { not: null },
      },
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' },
      },
    });
    const locations: CompanyLocationCount[] = rows
      .filter((r) => r.headquarters != null && String(r.headquarters).trim() !== '')
      .map((r) => ({
        location: String(r.headquarters),
        count: r._count.id,
      }));
    return { success: true, locations };
  } catch (e) {
    console.error('getCompanyLocations error:', e);
    return { success: false, error: 'Failed to load locations' };
  }
}

/**
 * Fetch a single company by id with its open jobs.
 */
export async function getCompanyProfile(
  id: string
): Promise<GetCompanyProfileResult> {
  try {
    const company = await db.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        headquarters: true,
        logoUrl: true,
        companyType: true,
        companySize: true,
        jobs: {
          where: { status: JobStatus.OPEN },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            location: true,
            jobType: true,
            salaryMin: true,
            salaryMax: true,
            createdAt: true,
          },
        },
      },
    });
    if (!company) return { success: false, error: 'Company not found' };
    
    // Map profile keys to match expected UI structure
    const mappedProfile = {
      ...company,
      location: company.headquarters,
      type: company.companyType,
      size: company.companySize,
    };
    
    return { success: true, company: mappedProfile };
  } catch (e) {
    console.error('getCompanyProfile error:', e);
    return { success: false, error: 'Failed to load company' };
  }
}

export interface AddCompanyReviewInput {
  companyId: string;
  rating: number;
  reviewerRole: string;
  employmentStatus: string;
  pros: string;
  cons: string;
}

export async function addCompanyReview(input: AddCompanyReviewInput) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'USER') {
      return { error: 'You must be logged in as a candidate to leave a review.' };
    }

    const company = await db.company.findUnique({
      where: { id: input.companyId },
      select: { id: true },
    });

    if (!company) {
      return { error: 'Company not found.' };
    }

    const existingReview = await db.companyReview.findUnique({
      where: {
        authorId_companyId: {
          authorId: user.id,
          companyId: company.id,
        },
      },
    });

    if (existingReview) {
      return { error: 'You have already submitted a review for this company.' };
    }

    await db.companyReview.create({
      data: {
        rating: input.rating,
        reviewerRole: input.reviewerRole,
        employmentStatus: input.employmentStatus,
        pros: input.pros,
        cons: input.cons,
        companyId: company.id,
        authorId: user.id,
      },
    });

    // Update the company's average rating dynamically
    const allReviews = await db.companyReview.aggregate({
      where: { companyId: company.id },
      _avg: { rating: true },
    });
    
    if (allReviews._avg.rating) {
      await db.company.update({
        where: { id: input.companyId },
        data: { rating: allReviews._avg.rating },
      });
    }

    revalidatePath(`/company/${input.companyId}`);
    return { success: true };
  } catch (e) {
    console.error('addCompanyReview error:', e);
    return { error: 'Failed to submit review. Please try again later.' };
  }
}
