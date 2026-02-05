'use client';

/**
 * Account Details Form Component
 * 
 * Client Component for updating email and mobile number.
 * Includes validation and success/error states.
 */

import { useState, FormEvent } from 'react';
import { updateAccountDetails } from '@/app/actions/settings';
import { Save, Mail, Phone, AlertCircle } from 'lucide-react';

interface AccountDetailsFormProps {
  initialEmail: string;
  initialMobile: string | null;
}

// Note: Mobile is now required, but we handle null from initial data gracefully

export default function AccountDetailsForm({
  initialEmail,
  initialMobile,
}: AccountDetailsFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [mobile, setMobile] = useState(initialMobile || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const result = await updateAccountDetails({
        email: email.trim(),
        mobile: mobile.trim(),
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('Failed to update account details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Account Details
        </h2>
        <p className="text-sm text-foreground/70">
          Update your email address and mobile number
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md">
          Account details updated successfully!
        </div>
      )}

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-2 text-foreground"
        >
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>
        <p className="mt-1 text-xs text-foreground/60 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Changing your email may require re-verification.</span>
        </p>
      </div>

      {/* Mobile Field */}
      <div>
        <label
          htmlFor="mobile"
          className="block text-sm font-medium mb-2 text-foreground"
        >
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input
            id="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <p className="mt-1 text-xs text-foreground/60">
          Required for account recovery and notifications
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

