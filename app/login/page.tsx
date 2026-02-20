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

  // If user is authenticated AND no redirect param exists, redirect to homepage
  // This prevents infinite loops when middleware sends user to /login?redirect=...
  // All users land on homepage which shows role-appropriate content
  if (user && !hasRedirectParam) {
    // Server-side redirect - user never sees login page
    redirect('/');
  }

  // Render login form if:
  // - User is not authenticated, OR
  // - User is authenticated but redirect param exists (middleware sent them here)
  const redirectValue = redirectParam 
    ? (typeof redirectParam === 'string' ? redirectParam : redirectParam[0] || null)
    : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-2">
      {/* Left: Welcome / testimonial */}
      <div className="hidden md:flex flex-col justify-center px-12 lg:px-20 py-16 bg-gradient-to-br from-foreground/10 via-foreground/5 to-background border-r border-foreground/10">
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Welcome back
        </h2>
        <p className="text-lg text-foreground/70 max-w-md">
          Sign in to access your account, manage applications, and discover your next opportunity.
        </p>
        <blockquote className="mt-12 pl-4 border-l-4 border-foreground/30 text-foreground/80 italic">
          &ldquo;JobPortal made it easy to find roles that fit my skills. I landed my current role in two weeks.&rdquo;
        </blockquote>
      </div>
      {/* Right: Login form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <LoginForm redirectParam={redirectValue} />
      </div>
    </div>
  );
}

