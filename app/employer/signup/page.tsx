'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { registerRecruiter } from '@/app/actions/employer-auth';

export default function EmployerSignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await registerRecruiter({
        fullName,
        email,
        password,
        companyName,
        mobileNumber,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Redirect to employer dashboard (existing overview is at /employer)
      window.location.href = '/employer';
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-wide text-foreground/70 uppercase mb-1">
          For recruiters & hiring managers
        </p>
        <h1 className="text-3xl font-bold mb-2">
          Hire the top 1% talent
        </h1>
        <p className="text-foreground/70 text-sm max-w-md mx-auto">
          Create your recruiter account to post jobs, manage applications, and
          access a curated pool of job seekers.
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

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium mb-2"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm"
              placeholder="Your name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
            >
              Work Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm"
              placeholder="you@company.com"
              disabled={isSubmitting}
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
              minLength={6}
              className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm"
              placeholder="Minimum 6 characters"
              disabled={isSubmitting}
            />
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
          </div>

          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium mb-2"
            >
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm"
              placeholder="Your company"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background py-2 px-4 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm"
        >
          {isSubmitting ? 'Creating recruiter account...' : 'Sign Up as Employer'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-foreground/70">
          Hiring with an existing account?{' '}
          <Link
            href="/login"
            className="text-foreground font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

