'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createJob } from '@/app/actions/job';
import { CreateJobSchema, CreateJobInput } from '@/lib/validators/job';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import LocationAutocomplete from '@/components/ui/location-autocomplete';
import TagInput from '@/components/ui/tag-input';
import MultiSelect from '@/components/ui/multi-select';
import { INDUSTRY_LIST, getDepartments } from '@/lib/constants/industries';
import {
  QUALIFICATION_OPTIONS,
  COMMON_SKILLS,
  LANGUAGE_OPTIONS,
  getJobRoles,
} from '@/lib/constants/job-fields';

export default function PostJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: {
      workMode: 'ONSITE',
      degreeRequired: '',
      salaryMin: undefined,
      salaryMax: undefined,
      minExperience: undefined,
      maxExperience: undefined,
      industryType: '',
      department: '',
      jobRole: '',
      qualification: undefined,
      skillsRequired: [],
      languagesKnown: [],
    },
  });

  const selectedIndustry = watch('industryType') || '';
  const selectedJobRole = watch('jobRole') || '';
  const departmentOptions = selectedIndustry ? getDepartments(selectedIndustry) : [];
  const jobRoleOptions = selectedIndustry ? getJobRoles(selectedIndustry) : [];

  const onSubmit = async (data: CreateJobInput) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await createJob(data);
      if (result.error) { setSubmitError(result.error); setIsSubmitting(false); return; }
      toast.success('Job posted! Redirecting...');
      router.push('/employer');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const inputCls = (hasError?: boolean) =>
    `w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2
     focus:ring-foreground/20 focus:border-transparent text-sm
     ${hasError ? 'border-red-500 dark:border-red-500' : 'border-foreground/20'}`;
  const labelCls = 'block text-sm font-medium text-foreground mb-2';
  const errCls = 'mt-1 text-sm text-red-600 dark:text-red-400';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/employer" className="text-foreground/70 hover:text-foreground transition-colors">
              ← Back to Jobs
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Post a New Job</h1>
          <p className="text-foreground/70">Fill in the details below to create a new job posting</p>
        </div>

        <div className="border border-foreground/10 rounded-lg bg-background p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Global error */}
            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm" role="alert">
                {submitError}
              </div>
            )}

            {/* ── Job Title ── */}
            <div>
              <label htmlFor="title" className={labelCls}>Job Title <span className="text-red-500">*</span></label>
              <input id="title" type="text" {...register('title')}
                className={inputCls(!!errors.title)} placeholder="e.g., Senior Software Engineer"
                disabled={isSubmitting} />
              {errors.title && <p className={errCls}>{errors.title.message}</p>}
            </div>

            {/* ── Description ── */}
            <div>
              <label htmlFor="description" className={labelCls}>Job Description <span className="text-red-500">*</span></label>
              <textarea id="description" {...register('description')} rows={8}
                className={`${inputCls(!!errors.description)} resize-y min-h-[200px]`}
                placeholder="Describe the role, responsibilities, requirements…"
                disabled={isSubmitting} />
              {errors.description && <p className={errCls}>{errors.description.message}</p>}
            </div>

            {/* ── Job Type + Work Mode ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="jobType" className={labelCls}>Job Type <span className="text-red-500">*</span></label>
                <select id="jobType" {...register('jobType')} className={inputCls(!!errors.jobType)} disabled={isSubmitting}>
                  <option value="">Select job type</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                  <option value="REMOTE">Remote</option>
                </select>
                {errors.jobType && <p className={errCls}>{errors.jobType.message}</p>}
              </div>
              <div>
                <label htmlFor="workMode" className={labelCls}>Work Mode <span className="text-red-500">*</span></label>
                <select id="workMode" {...register('workMode')} className={inputCls(!!errors.workMode)} disabled={isSubmitting}>
                  <option value="ONSITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                </select>
                {errors.workMode && <p className={errCls}>{errors.workMode.message}</p>}
              </div>
            </div>

            {/* ── Location ── */}
            <div>
              <label htmlFor="location" className={labelCls}>Location <span className="text-red-500">*</span></label>
              <Controller control={control} name="location" render={({ field }) => (
                <LocationAutocomplete id="location" value={field.value || ''} onChange={field.onChange}
                  placeholder="e.g., Mumbai, Dubai" disabled={isSubmitting} allowCustom />
              )} />
              {errors.location && <p className={errCls}>{errors.location.message}</p>}
            </div>

            {/* ── Industry & Department ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="industryType" className={labelCls}>Industry</label>
                <select id="industryType" {...register('industryType', {
                  onChange: () => { setValue('department', ''); setValue('jobRole', ''); },
                })} className={inputCls()} disabled={isSubmitting}>
                  <option value="">Select industry</option>
                  {INDUSTRY_LIST.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="department" className={labelCls}>Department</label>
                <select id="department" {...register('department')}
                  className={inputCls()} disabled={isSubmitting || !selectedIndustry}>
                  <option value="">{selectedIndustry ? 'Select department' : 'Select industry first'}</option>
                  {departmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* ── Job Role (dependent on Industry) ── */}
            <div>
              <label htmlFor="jobRole" className={labelCls}>Job Role</label>
              <select id="jobRole" {...register('jobRole')}
                className={inputCls(!!errors.jobRole)} disabled={isSubmitting || !selectedIndustry}>
                <option value="">{selectedIndustry ? 'Select job role' : 'Select industry first'}</option>
                {jobRoleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.jobRole && <p className={errCls}>{errors.jobRole.message}</p>}
              {/* Custom role text input when "Others" is selected */}
              {selectedJobRole === 'Others' && (
                <input type="text" {...register('jobRole')} placeholder="Specify your custom job role"
                  className={`mt-2 ${inputCls(!!errors.jobRole)}`} disabled={isSubmitting} />
              )}
            </div>

            {/* ── Skills Required ── */}
            <div>
              <label htmlFor="skillsRequired" className={labelCls}>Skills Required</label>
              <Controller control={control} name="skillsRequired" render={({ field }) => (
                <TagInput id="skillsRequired" value={field.value ?? []}
                  onChange={field.onChange} suggestions={COMMON_SKILLS}
                  placeholder="Type a skill and press Enter…" disabled={isSubmitting} />
              )} />
              {errors.skillsRequired && <p className={errCls}>{errors.skillsRequired.message}</p>}
            </div>

            {/* ── Qualification ── */}
            <div>
              <label htmlFor="qualification" className={labelCls}>Minimum Qualification</label>
              <select id="qualification" {...register('qualification')}
                className={inputCls(!!errors.qualification)} disabled={isSubmitting}>
                <option value="">Select qualification</option>
                {QUALIFICATION_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
              {errors.qualification && <p className={errCls}>{errors.qualification.message}</p>}
            </div>

            {/* ── Degree Required ── */}
            <div>
              <label htmlFor="degreeRequired" className={labelCls}>Degree Required</label>
              <input id="degreeRequired" type="text" {...register('degreeRequired')}
                className={inputCls(!!errors.degreeRequired)}
                placeholder="e.g., B.Tech in Computer Science, MBA" disabled={isSubmitting} />
              {errors.degreeRequired && <p className={errCls}>{errors.degreeRequired.message}</p>}
            </div>

            {/* ── Languages Known ── */}
            <div>
              <label htmlFor="languagesKnown" className={labelCls}>Languages Required</label>
              <Controller control={control} name="languagesKnown" render={({ field }) => (
                <MultiSelect id="languagesKnown" options={LANGUAGE_OPTIONS}
                  value={field.value ?? []} onChange={field.onChange}
                  placeholder="Select required languages" disabled={isSubmitting} />
              )} />
              {errors.languagesKnown && <p className={errCls}>{errors.languagesKnown.message}</p>}
            </div>

            {/* ── Salary ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salaryMin" className={labelCls}>Salary Minimum (₹)</label>
                <input id="salaryMin" type="number" step="1000" min="0"
                  {...register('salaryMin', {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                  })}
                  className={inputCls(!!errors.salaryMin)} placeholder="e.g., 300000" disabled={isSubmitting} />
                <p className="mt-1 text-xs text-foreground/50">Enter raw amount in INR (e.g., 300000 for 3 LPA)</p>
                {errors.salaryMin && <p className={errCls}>{errors.salaryMin.message}</p>}
              </div>
              <div>
                <label htmlFor="salaryMax" className={labelCls}>Salary Maximum (₹)</label>
                <input id="salaryMax" type="number" step="1000" min="0"
                  {...register('salaryMax', {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                  })}
                  className={inputCls(!!errors.salaryMax)} placeholder="e.g., 600000" disabled={isSubmitting} />
                <p className="mt-1 text-xs text-foreground/50">Enter raw amount in INR (e.g., 600000 for 6 LPA)</p>
                {errors.salaryMax && <p className={errCls}>{errors.salaryMax.message}</p>}
              </div>
            </div>

            {/* ── Experience Range ── */}
            <div>
              <label className={labelCls}>Experience Required (Years)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input id="minExperience" type="number" step="1" min="0"
                    {...register('minExperience', {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                    })}
                    className={inputCls(!!errors.minExperience)} placeholder="Min (e.g., 2)"
                    disabled={isSubmitting} />
                  {errors.minExperience && <p className={errCls}>{errors.minExperience.message}</p>}
                  <p className="mt-1 text-xs text-foreground/50">Minimum years</p>
                </div>
                <div>
                  <input id="maxExperience" type="number" step="1" min="0"
                    {...register('maxExperience', {
                      valueAsNumber: true,
                      setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                    })}
                    className={inputCls(!!errors.maxExperience)} placeholder="Max (e.g., 5)"
                    disabled={isSubmitting} />
                  {errors.maxExperience && <p className={errCls}>{errors.maxExperience.message}</p>}
                  <p className="mt-1 text-xs text-foreground/50">Maximum years</p>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="flex items-center gap-4 pt-4">
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-2 rounded-md
                  font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-foreground/20
                  disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Posting...</span></>) : 'Post Job'}
              </button>
              <Link href="/employer"
                className="px-6 py-2 border border-foreground/20 rounded-md font-medium
                  hover:bg-foreground/5 transition-colors text-sm">
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
