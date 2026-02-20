import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { requireUser } from '@/lib/rbac';
import { Role } from '@prisma/client';
import { getJobPreferences } from '@/app/actions/job-interaction';
import PreferencesForm from '@/components/preferences/preferences-form';

/**
 * Job Preferences page – candidates set preferred location, role, salary, work mode.
 * Protected: logged-in USER (candidate) only.
 */
export default async function PreferencesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/preferences');
  if (user.role === Role.EMPLOYER) redirect('/employer');
  if (user.role === Role.ADMIN) redirect('/admin');

  requireUser(user);

  const prefsResult = await getJobPreferences();
  const preferences = prefsResult.preferences ?? null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Job Preferences
          </h1>
          <p className="text-foreground/70 text-sm mb-6">
            Set your preferred locations, roles, and salary to get better job recommendations.
          </p>
          <div className="rounded-lg border border-foreground/10 bg-background shadow-sm overflow-hidden">
            <PreferencesForm
              initialLocations={preferences?.locations ?? []}
              initialTitles={preferences?.titles ?? []}
              initialSalaryMin={preferences?.expectedSalaryMin ?? null}
              initialSalaryMax={preferences?.expectedSalaryMax ?? null}
              initialWorkModes={preferences?.workModes ?? []}
            />
          </div>
          <p className="mt-4 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-foreground/70 hover:underline"
            >
              ← Cancel and go back to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
