'use client';

/**
 * Login Form Component
 * 
 * Client-side login form with email and password.
 * Handles authentication and redirects on success.
 */

import { useState, FormEvent } from 'react';
import { login, AuthError } from '@/lib/auth-client';
import Link from 'next/link';

interface LoginFormProps {
  redirectParam: string | null;
}

export default function LoginForm({ redirectParam }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(email, password);

      // Determine redirect destination
      let destination = '/';

      if (redirectParam) {
        // Use redirect param if provided
        destination = redirectParam;
      } else {
        // Otherwise, redirect to homepage (Job Seeker Dashboard)
        // All users land on homepage which shows role-appropriate content
        destination = '/';
      }

      // HARD redirect using window.location.href
      // This ensures:
      // - Cookie persistence is guaranteed
      // - Middleware sees the cookie on next request
      // - All Server Components re-render with new auth state
      // - No stale navigation state
      window.location.href = destination;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Sign In</h1>
        <p className="text-foreground/70">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md"
            role="alert"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2"
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
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-2"
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
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-foreground text-background py-2 px-4 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-foreground/70">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="text-foreground font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

