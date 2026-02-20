'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createJob } from '@/app/actions/job';
import { CreateJobSchema, CreateJobInput } from '@/lib/validators/job';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Post a New Job Page
 * 
 * Client Component with a professional form for creating job postings.
 * Uses react-hook-form with Zod validation for robust form handling.
 */

export default function PostJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: {
      workMode: 'ONSITE',
      degree: '',
      salaryMin: undefined,
      salaryMax: undefined,
      experience: undefined,
    },
  });

  const onSubmit = async (data: CreateJobInput) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await createJob(data);

      if (result.error) {
        setSubmitError(result.error);
        setIsSubmitting(false);
        return;
      }

      toast.success('Job posted! Redirecting...');
      router.push('/employer/jobs');
    } catch (err) {
      console.error('Failed to post job:', err);
      setSubmitError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/employer/jobs"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              ← Back to Jobs
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Post a New Job
          </h1>
          <p className="text-foreground/70">
            Fill in the details below to create a new job posting
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-foreground/10 rounded-lg bg-background p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {submitError && (
              <div
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm"
                role="alert"
              >
                {submitError}
              </div>
            )}

            {/* Job Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                {...register('title')}
                className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm ${
                  errors.title
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-foreground/20'
                }`}
                placeholder="e.g., Senior Software Engineer"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={8}
                minLength={10}
                className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm resize-y min-h-[200px] ${
                  errors.description
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-foreground/20'
                }`}
                placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity great..."
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Job Type, Work Mode, Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Type */}
              <div>
                <label
                  htmlFor="jobType"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="jobType"
                  {...register('jobType')}
                  className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm ${
                    errors.jobType
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-foreground/20'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Select job type</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                  <option value="REMOTE">Remote</option>
                </select>
                {errors.jobType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.jobType.message}
                  </p>
                )}
              </div>

              {/* Work Mode */}
              <div>
                <label
                  htmlFor="workMode"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Work Mode <span className="text-red-500">*</span>
                </label>
                <select
                  id="workMode"
                  {...register('workMode')}
                  className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm ${
                    errors.workMode
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-foreground/20'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">On-site</option>
                </select>
                {errors.workMode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.workMode.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  {...register('location')}
                  className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm ${
                    errors.location
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-foreground/20'
                  }`}
                  placeholder="e.g., San Francisco, CA"
                  disabled={isSubmitting}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>

            {/* Degree */}
            <div>
              <label
                htmlFor="degree"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Degree / Education
              </label>
              <input
                id="degree"
                type="text"
                {...register('degree')}
                className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm ${
                  errors.degree
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-foreground/20'
                }`}
                placeholder="e.g., B.Tech, MBA, Bachelors, Masters"
                disabled={isSubmitting}
              />
              {errors.degree && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.degree.message}
                </p>
              )}
            </div>

            {/* Salary Range Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Salary Min */}
              <div>
                <label
                  htmlFor="salaryMin"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Salary Minimum (₹)
                </label>
                <input
                  id="salaryMin"
                  type="number"
                  step="1000"
                  min="0"
                  {...register('salaryMin', {
                    valueAsNumber: true,
                    setValueAs: (value) =>
                      value === '' || value === null ? undefined : Number(value),
                  })}
                  className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm ${
                    errors.salaryMin
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-foreground/20'
                  }`}
                  placeholder="e.g., 50000"
                  disabled={isSubmitting}
                />
                {errors.salaryMin && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.salaryMin.message}
                  </p>
                )}
              </div>

              {/* Salary Max */}
              <div>
                <label
                  htmlFor="salaryMax"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Salary Maximum (₹)
                </label>
                <input
                  id="salaryMax"
                  type="number"
                  step="1000"
                  min="0"
                  {...register('salaryMax', {
                    valueAsNumber: true,
                    setValueAs: (value) =>
                      value === '' || value === null ? undefined : Number(value),
                  })}
                  className={`w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm ${
                    errors.salaryMax
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-foreground/20'
                  }`}
                  placeholder="e.g., 100000"
                  disabled={isSubmitting}
                />
                {errors.salaryMax && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.salaryMax.message}
                  </p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Experience Required (Years)
              </label>
              <div className="relative">
                <input
                  id="experience"
                  type="number"
                  step="1"
                  min="0"
                  {...register('experience', {
                    valueAsNumber: true,
                    setValueAs: (value) =>
                      value === '' || value === null ? undefined : Number(value),
                  })}
                  className={`w-full px-4 py-2 pr-16 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent text-sm ${
                    errors.experience
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-foreground/20'
                  }`}
                  placeholder="e.g., 3"
                  disabled={isSubmitting}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-foreground/60">
                  Years
                </span>
              </div>
              {errors.experience && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-2 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  'Post Job'
                )}
              </button>
              <Link
                href="/employer/jobs"
                className="px-6 py-2 border border-foreground/20 rounded-md font-medium hover:bg-foreground/5 transition-colors text-sm"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
