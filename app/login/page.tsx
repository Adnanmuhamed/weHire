import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Role } from '@prisma/client';
import LoginForm from './login-form';

/**
 * Login Page
 * 
 * Server Component that guards against authenticated users.
 * 
 * Redirect logic:
 * - If user exists AND redirect param exists: Render login page (don't auto-redirect)
 * - If user exists AND redirect param does NOT exist: Redirect by role
 * - If user does NOT exist: Render login page
 */

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Check if user is already authenticated
  const user = await getCurrentUser();
  const resolvedParams = await searchParams;
  const redirectParam = resolvedParams.redirect;
  const hasRedirectParam = redirectParam !== undefined && redirectParam !== null;

  // If user is authenticated AND no redirect param exists, redirect by role
  // This prevents infinite loops when middleware sends user to /login?redirect=...
  if (user && !hasRedirectParam) {
    let destination = '/';

    // Redirect based on user role
    switch (user.role) {
      case Role.USER:
        destination = '/applications';
        break;
      case Role.EMPLOYER:
        destination = '/employer';
        break;
      case Role.ADMIN:
        destination = '/admin';
        break;
      default:
        destination = '/';
    }

    // Server-side redirect - user never sees login page
    redirect(destination);
  }

  // Render login form if:
  // - User is not authenticated, OR
  // - User is authenticated but redirect param exists (middleware sent them here)
  const redirectValue = redirectParam 
    ? (typeof redirectParam === 'string' ? redirectParam : redirectParam[0] || null)
    : null;

  return <LoginForm redirectParam={redirectValue} />;
}

