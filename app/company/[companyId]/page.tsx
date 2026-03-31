import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Star, Globe, Users, Calendar, Building2 } from 'lucide-react';
import CompanyPageTabs from '@/components/company/company-page-tabs';

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const { companyId } = await params;

  const company = await db.company.findUnique({
    where: { id: companyId },
    include: {
      jobs: {
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          location: true,
          jobType: true,
          workMode: true,
          salaryMin: true,
          salaryMax: true,
          minExperience: true,
          maxExperience: true,
          createdAt: true,
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const similarCompanies = company.industryType
    ? await db.company.findMany({
        where: {
          industryType: company.industryType,
          id: { not: companyId },
        },
        take: 3,
        select: {
          id: true,
          name: true,
          logoUrl: true,
          industryType: true,
          employeeCount: true,
          rating: true,
        },
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <header className="bg-background border border-foreground/10 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                {company.logoUrl ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-foreground/5 flex-shrink-0">
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-foreground/60" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground mb-2">{company.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {company.rating !== null && company.rating > 0 && (
                      <div className="flex items-center gap-1 text-foreground/80">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{company.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {company.industryType && (
                      <span className="px-2 py-1 bg-foreground/10 rounded text-foreground/80">
                        {company.industryType}
                      </span>
                    )}
                    {company.type && (
                      <span className="px-2 py-1 bg-foreground/10 rounded text-foreground/80">
                        {company.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Tabs */}
            <CompanyPageTabs
              company={{
                about: company.about,
                accountType: company.accountType,
                employeeCount: company.employeeCount,
                foundedYear: company.foundedYear,
                websiteUrl: company.websiteUrl,
              }}
              jobs={company.jobs as any}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* More Information */}
            <div className="bg-background border border-foreground/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">More Information</h3>
              <div className="space-y-3">
                {company.accountType && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-foreground/60 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground/60">Type</p>
                      <p className="text-foreground">{company.accountType}</p>
                    </div>
                  </div>
                )}
                {company.employeeCount && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-foreground/60 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground/60">Size</p>
                      <p className="text-foreground">{company.employeeCount} employees</p>
                    </div>
                  </div>
                )}
                {company.foundedYear && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-foreground/60 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground/60">Founded</p>
                      <p className="text-foreground">{company.foundedYear}</p>
                    </div>
                  </div>
                )}
                {company.websiteUrl && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-foreground/60 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground/60">Website</p>
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline break-all"
                      >
                        {company.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Companies */}
            {similarCompanies.length > 0 && (
              <div className="bg-background border border-foreground/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Similar Companies
                </h3>
                <div className="space-y-3">
                  {similarCompanies.map((sim) => (
                    <a
                      key={sim.id}
                      href={`/company/${sim.id}`}
                      className="block p-3 rounded-lg hover:bg-foreground/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {sim.logoUrl ? (
                          <div className="w-10 h-10 rounded overflow-hidden bg-foreground/5 flex-shrink-0">
                            <img
                              src={sim.logoUrl}
                              alt={sim.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-foreground/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-foreground/60" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{sim.name}</p>
                          <p className="text-xs text-foreground/60 truncate">
                            {sim.industryType}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
