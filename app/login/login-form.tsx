'use client';

/**
 * Login Form Component
 *
 * Client-side login form. Modern UI with large inputs and clear CTAs.
 * Supports role-specific content when role=EMPLOYER is in the URL.
 */

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { loginUser } from '@/app/actions/auth';

interface LoginFormProps {
  redirectParam: string | null;
  roleParam: string | null;
}

export default function LoginForm({ redirectParam, roleParam }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEmployerPortal = roleParam === 'EMPLOYER';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginUser({
        email,
        password,
        expectedRole: isEmployerPortal ? 'EMPLOYER' : undefined,
        redirectTo: redirectParam || undefined,
      });

      // If the server action returns at all, it means authentication failed —
      // successful logins call redirect() server-side and never return a value.
      if (result?.error) {
        setError(result.error);
      } else {
        // No error returned but also no redirect — unexpected; surface generic msg
        setError('Login failed. Please try again.');
      }
      setIsLoading(false);
    } catch (err: any) {
      // Next.js redirect() internally throws a NEXT_REDIRECT error.
      // If that's what we caught, the redirect is already in flight — do nothing.
      if (err?.digest?.startsWith('NEXT_REDIRECT')) return;

      console.error(err);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        {isEmployerPortal && (
          <span className="inline-block px-3 py-1 text-xs font-medium bg-foreground/10 text-foreground rounded-full mb-3">
            For Business
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {isEmployerPortal ? 'Employer Portal Login' : 'Welcome Back'}
        </h1>
        <p className="text-foreground/70">
          {isEmployerPortal
            ? 'Sign in to manage your job postings, view applications, and hire top talent.'
            : 'Sign in to apply for jobs and track your applications.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-shadow disabled:opacity-50"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 border border-foreground/20 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-shadow disabled:opacity-50"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-sm"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-foreground/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-foreground/60">
            Or continue with
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-foreground/70">
        Don&apos;t have an account?{' '}
        <Link
          href={isEmployerPortal ? '/employer-signup' : '/signup'}
          className="font-medium text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
