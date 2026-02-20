'use client';

import { useRouter } from 'next/navigation';
import SetPreferencesForm from '@/components/dashboard/set-preferences-form';
import { WorkMode } from '@prisma/client';

interface PreferencesFormProps {
  initialLocations?: string[];
  initialTitles?: string[];
  initialSalaryMin?: number | null;
  initialSalaryMax?: number | null;
  initialWorkModes?: WorkMode[];
}

export default function PreferencesForm(props: PreferencesFormProps) {
  const router = useRouter();
  return (
    <SetPreferencesForm
      {...props}
      title="Update Job Preferences"
      onSuccess={() => router.push('/dashboard')}
    />
  );
}
