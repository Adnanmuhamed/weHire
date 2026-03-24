import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import { getCompanyProfile } from '@/app/actions/company-profile';
import CompanyProfileForm from '@/components/employer/company-profile-form';

export default async function CompanyProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== Role.EMPLOYER) redirect('/dashboard');

  const result = await getCompanyProfile();

  if (!result.success || !result.company || !result.user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-foreground/70">{result.error || 'Failed to load company profile'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Company Profile Settings</h1>

        <div className="space-y-8">
          {/* Section 1: Account Details (Read-only) */}
          <section className="bg-background border border-foreground/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Account Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground/70">Email</label>
                <p className="text-foreground">{result.user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Role</label>
                <p className="text-foreground">{result.user.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Mobile</label>
                <p className="text-foreground">{result.user.mobile || 'Not provided'}</p>
              </div>
            </div>
          </section>

          {/* Section 2 & 3: Editable Company Details */}
          <CompanyProfileForm company={result.company} user={result.user} />
        </div>
      </div>
    </div>
  );
}
