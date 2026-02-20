import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { requireEmployer } from '@/lib/rbac';
import { db } from '@/lib/db';
import CompanySettingsForm from '@/components/employer/company-settings-form';

/**
 * Employer Company Profile Settings
 * Protected: EMPLOYER only, must have a company.
 */
export default async function EmployerSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const employer = requireEmployer(user);

  const company = await db.company.findUnique({
    where: { ownerId: employer.id },
    select: {
      id: true,
      name: true,
      description: true,
      website: true,
      location: true,
      logoUrl: true,
      type: true,
      size: true,
    },
  });

  if (!company) {
    redirect('/employer');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/employer"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Company Profile</h1>
          <p className="mt-1 text-foreground/70">
            Update your company details. Location and type power the companies directory filters.
          </p>
        </header>
        <div className="border border-foreground/10 rounded-lg bg-background p-6 md:p-8 shadow-sm">
          <CompanySettingsForm
            company={{
              ...company,
              type: company.type ?? 'STARTUP',
            }}
          />
        </div>
      </div>
    </div>
  );
}
