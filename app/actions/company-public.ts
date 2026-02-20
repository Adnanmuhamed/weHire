'use server';

import { db } from '@/lib/db';
import { JobStatus, JobType, CompanyType } from '@prisma/client';

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
  type?: CompanyType | CompanyType[];
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
  location: string | null;
  type: CompanyType;
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
  type: CompanyType;
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
    const { search, location, type } = filter;

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
      where.location = locations.length === 1
        ? locations[0]
        : { in: locations };
    }

    if (type !== undefined) {
      where.type = Array.isArray(type) ? { in: type } : type;
    }

    const companies = await db.company.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        location: true,
        type: true,
      },
    });
    return { success: true, companies: companies as CompanyListItem[] };
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
      by: ['location'],
      where: {
        location: { not: null },
      },
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' },
      },
    });
    const locations: CompanyLocationCount[] = rows
      .filter((r) => r.location != null && String(r.location).trim() !== '')
      .map((r) => ({
        location: String(r.location),
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
        location: true,
        logoUrl: true,
        type: true,
        size: true,
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
    return { success: true, company };
  } catch (e) {
    console.error('getCompanyProfile error:', e);
    return { success: false, error: 'Failed to load company' };
  }
}
