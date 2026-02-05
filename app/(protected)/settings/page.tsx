import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import AccountDetailsForm from '@/components/settings/account-details-form';
import SecurityForm from '@/components/settings/security-form';

/**
 * Settings Page
 * 
 * Protected Server Component for managing account settings.
 * Displays forms for account details and password changes.
 */

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/settings');
  }

  // Fetch user email and profile mobile
  const [userData, profile] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { email: true },
    }),
    db.profile.findUnique({
      where: { userId: user.id },
      select: { mobile: true },
    }),
  ]);

  const initialEmail = userData?.email || '';
  const initialMobile = profile?.mobile || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Account Settings
            </h1>
            <p className="text-foreground/70">
              Manage your account credentials and preferences.
            </p>
          </div>

          {/* Account Details Form */}
          <div className="bg-background border border-foreground/10 rounded-lg p-6">
            <AccountDetailsForm
              initialEmail={initialEmail}
              initialMobile={initialMobile}
            />
          </div>

          {/* Security Form */}
          <div className="bg-background border border-foreground/10 rounded-lg p-6">
            <SecurityForm />
          </div>
        </div>
      </div>
    </div>
  );
}

