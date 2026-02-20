import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCompanyProfile } from '@/app/actions/company-public';
import { CompanyType } from '@prisma/client';
import JobCard from '@/components/job-card';

const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  CORPORATE: 'Corporate',
  FOREIGN_MNC: 'Foreign MNC',
  STARTUP: 'Startup',
  INDIAN_MNC: 'Indian MNC',
  GOVT: 'Govt',
  OTHERS: 'Others',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Company detail – public page with company info and open jobs.
 */
export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getCompanyProfile(id);

  if (!result.success || !result.company) {
    notFound();
  }

  const company = result.company;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Company header */}
        <header className="border-b border-foreground/10 pb-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {company.logoUrl ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-foreground/5 flex-shrink-0">
                <Image
                  src={company.logoUrl}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-foreground/10 flex items-center justify-center text-3xl font-bold text-foreground/60 flex-shrink-0">
                {company.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {company.name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-2">
                {company.type && (
                  <span className="inline-block px-2.5 py-0.5 rounded bg-foreground/10 text-sm font-medium text-foreground">
                    {COMPANY_TYPE_LABELS[company.type]}
                  </span>
                )}
                {company.size && (
                  <span className="inline-block px-2.5 py-0.5 rounded bg-foreground/5 text-sm text-foreground/80 border border-foreground/10">
                    {company.size}
                  </span>
                )}
              </div>
              {company.website && (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:underline block mb-1"
                >
                  {company.website}
                </a>
              )}
              {company.location && (
                <p className="text-foreground/60 mb-2">{company.location}</p>
              )}
              {company.description && (
                <div className="mt-4 p-4 rounded-lg bg-foreground/5 border border-foreground/10">
                  <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-2">
                    About
                  </h2>
                  <p className="text-foreground/80 max-w-2xl whitespace-pre-wrap">
                    {company.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Open positions */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Open Positions
          </h2>
          {company.jobs.length > 0 ? (
            <ul className="space-y-4">
              {company.jobs.map((job) => (
                <li key={job.id}>
                  <JobCard
                    jobId={job.id}
                    title={job.title}
                    location={job.location}
                    jobType={job.jobType}
                    salaryMin={job.salaryMin}
                    salaryMax={job.salaryMax}
                    companyName={company.name}
                    createdAt={job.createdAt}
                    isSaved={false}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-foreground/60">No open positions at the moment.</p>
          )}
        </section>
      </div>
    </div>
  );
}
