import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Protected Page Example
 * 
 * Server Component demonstrating protected route.
 * Displays user information after authentication check.
 */

export default async function ProtectedPage() {
  const user = await getCurrentUser();

  // Additional check (layout should handle this, but defensive)
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Protected Page</h1>
          <p className="text-foreground/70">You are logged in</p>
        </div>

        <div className="bg-foreground/5 border border-foreground/20 rounded-md p-6 space-y-4">
          <div>
            <p className="text-sm text-foreground/60 mb-1">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-foreground/60 mb-1">Role</p>
            <p className="font-medium">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

