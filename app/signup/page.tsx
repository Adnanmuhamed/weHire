'use client';

/**
 * Signup Page
 * 
 * Client-side signup form with email, password, and role selection.
 * Handles user registration and redirects on success.
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signup, AuthError } from '@/lib/auth-client';
import Link from 'next/link';

type Role = 'USER' | 'EMPLOYER';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, role);

      // Redirect to home on success
      router.push('/');
      router.refresh(); // Refresh to update auth state
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-foreground/70">Sign up to get started</p>
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
            autoComplete="new-password"
            minLength={8}
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
            placeholder="At least 8 characters"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-foreground/60">
            Must be at least 8 characters long
          </p>
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium mb-2"
          >
            Account Type
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            required
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="USER">Job Seeker</option>
            <option value="EMPLOYER">Employer</option>
          </select>
          <p className="mt-1 text-xs text-foreground/60">
            Employers can post jobs, Job Seekers can apply
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-foreground text-background py-2 px-4 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-foreground/70">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-foreground font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

