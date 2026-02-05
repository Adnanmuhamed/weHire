'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { registerUser } from '@/app/actions/auth';

type WorkStatus = 'EXPERIENCED' | 'FRESHER';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [workStatus, setWorkStatus] = useState<WorkStatus>('EXPERIENCED');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await registerUser({
        fullName,
        email,
        password,
        mobileNumber,
        workStatus,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Hard redirect to ensure session cookies are respected
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const workStatusCardClasses = (value: WorkStatus) =>
    [
      'flex-1 border rounded-lg p-4 cursor-pointer transition-colors',
      'bg-background',
      workStatus === value
        ? 'border-foreground'
        : 'border-foreground/20 hover:border-foreground/60',
    ].join(' ');

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Create your Job Seeker account
        </h1>
        <p className="text-foreground/70 text-sm">
          Sign up to find jobs that match your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm"
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email ID
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm"
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-foreground/60">
            We&apos;ll send relevant jobs and updates to this email.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
            className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm"
            placeholder="Minimum 6 characters"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-foreground/60">
            This helps your account stay protected.
          </p>
        </div>

        <div>
          <label
            htmlFor="mobileNumber"
            className="block text-sm font-medium mb-2"
          >
            Mobile Number
          </label>
          <div className="flex gap-2">
            <div className="px-3 py-2 border border-foreground/20 rounded-md bg-foreground/5 text-sm flex items-center justify-center min-w-[70px]">
              +91
            </div>
            <input
              id="mobileNumber"
              type="tel"
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              value={mobileNumber}
              onChange={(e) =>
                setMobileNumber(e.target.value.replace(/\D/g, ''))
              }
              required
              className="flex-1 px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm"
              placeholder="10-digit mobile number"
              disabled={isSubmitting}
            />
          </div>
          <p className="mt-1 text-xs text-foreground/60">
            Recruiters will contact you on this number.
          </p>
        </div>

        <div>
          <p className="block text-sm font-medium mb-2">Work Status</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className={workStatusCardClasses('EXPERIENCED')}
              onClick={() => setWorkStatus('EXPERIENCED')}
              aria-pressed={workStatus === 'EXPERIENCED'}
            >
              <div className="text-sm font-semibold mb-1">
                I&apos;m experienced
              </div>
              <p className="text-xs text-foreground/70">
                I have work experience (excluding internships).
              </p>
            </button>
            <button
              type="button"
              className={workStatusCardClasses('FRESHER')}
              onClick={() => setWorkStatus('FRESHER')}
              aria-pressed={workStatus === 'FRESHER'}
            >
              <div className="text-sm font-semibold mb-1">
                I&apos;m a fresher
              </div>
              <p className="text-xs text-foreground/70">
                I am a student / Haven&apos;t worked after graduation.
              </p>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background py-2 px-4 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm"
        >
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
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

