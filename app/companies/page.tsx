import Link from 'next/link';
import Image from 'next/image';
import { getAllCompanies, getCompanyLocations } from '@/app/actions/company-public';
import type { CompanyListFilters } from '@/app/actions/company-public';
import { CompanyType } from '@prisma/client';
import CompaniesFilterSidebar from '@/components/companies/filter-sidebar';

const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  CORPORATE: 'Corporate',
  FOREIGN_MNC: 'Foreign MNC',
  STARTUP: 'Startup',
  INDIAN_MNC: 'Indian MNC',
  GOVT: 'Govt',
  OTHERS: 'Others',
};

interface CompaniesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function buildFilters(
  params: { [key: string]: string | string[] | undefined }
): CompanyListFilters {
  const get = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const getAll = (k: string) => {
    const v = params[k];
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };
  const search = get('search')?.trim();
  const locationArr = getAll('location')
    .map((l) => (typeof l === 'string' ? l : '').trim())
    .filter(Boolean);
  const typeArr = getAll('type').filter((v): v is CompanyType =>
    ['CORPORATE', 'FOREIGN_MNC', 'STARTUP', 'INDIAN_MNC', 'GOVT', 'OTHERS'].includes(v)
  );
  const filter: CompanyListFilters = {};
  if (search) filter.search = search;
  if (locationArr.length) filter.location = locationArr;
  if (typeArr.length) filter.type = typeArr;
  return filter;
}

/**
 * Companies directory – public list with filters.
 */
export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const resolved = await searchParams;
  const filter = buildFilters(resolved);
  const [companiesResult, locationsResult] = await Promise.all([
    getAllCompanies(filter),
    getCompanyLocations(),
  ]);
  const companies = companiesResult.companies ?? [];
  const availableLocations = locationsResult.locations ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Top Companies Hiring Now
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 shrink-0">
            <CompaniesFilterSidebar availableLocations={availableLocations} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="block p-6 border border-foreground/10 rounded-lg bg-background hover:border-foreground/20 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    {company.logoUrl ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-foreground/5">
                        <Image
                          src={company.logoUrl}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-foreground/10 flex items-center justify-center text-2xl font-bold text-foreground/60">
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <h2 className="font-semibold text-foreground line-clamp-2">
                      {company.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-foreground/10 text-xs font-medium text-foreground">
                      {COMPANY_TYPE_LABELS[company.type] ?? company.type}
                    </span>
                    {company.location && (
                      <p className="text-sm text-foreground/60 line-clamp-1">
                        {company.location}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {companies.length === 0 && (
              <p className="text-foreground/60 text-center py-12">
                No companies to display yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
