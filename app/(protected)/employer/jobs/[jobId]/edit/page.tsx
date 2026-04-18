'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateJob, getJobForEdit } from '@/app/actions/job';
import { Loader2, ArrowLeft, Briefcase } from 'lucide-react';
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

interface EditJobPageProps {
  params: Promise<{ jobId: string }>;
}

interface FormData {
  title: string;
  description: string;
  location: string;
  jobType: string;
  workMode: string;
  industryType: string;
  department: string;
  jobRole: string;
  customJobRole: string;
  qualification: string;
  degreeRequired: string;
  skillsRequired: string[];
  languagesKnown: string[];
  salaryMin: string;
  salaryMax: string;
  minExperience: string;
  maxExperience: string;
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '', description: '', location: '', jobType: '', workMode: 'ONSITE',
    industryType: '', department: '', jobRole: '', customJobRole: '',
    qualification: '', degreeRequired: '', skillsRequired: [], languagesKnown: [],
    salaryMin: '', salaryMax: '', minExperience: '', maxExperience: '',
  });

  const departmentOptions = formData.industryType ? getDepartments(formData.industryType) : [];
  const jobRoleOptions = formData.industryType ? getJobRoles(formData.industryType) : [];

  useEffect(() => {
    params.then(async ({ jobId: id }) => {
      setJobId(id);
      const result = await getJobForEdit(id);
      if (result.error || !result.job) {
        setError(result.error || 'Failed to load job.');
        setIsLoading(false);
        return;
      }
      const job = result.job;
      setFormData({
        title: job.title,
        description: job.description,
        location: job.location,
        jobType: job.jobType,
        workMode: job.workMode,
        industryType: job.industryType || '',
        department: job.department || '',
        jobRole: job.jobRole || '',
        customJobRole: '',
        qualification: job.qualification || '',
        degreeRequired: job.degreeRequired || '',
        skillsRequired: job.skillsRequired ?? [],
        languagesKnown: job.languagesKnown ?? [],
        salaryMin: job.salaryMin?.toString() || '',
        salaryMax: job.salaryMax?.toString() || '',
        minExperience: job.minExperience?.toString() || '',
        maxExperience: job.maxExperience?.toString() || '',
      });
      setIsLoading(false);
    });
  }, [params]);

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.jobType) {
      toast.error('Please fill in all required fields.'); return;
    }
    const minExp = formData.minExperience ? Number(formData.minExperience) : undefined;
    const maxExp = formData.maxExperience ? Number(formData.maxExperience) : undefined;
    if (minExp != null && maxExp != null && maxExp < minExp) {
      toast.error('Max experience must be ≥ min experience.'); return;
    }

    setIsSubmitting(true);
    const result = await updateJob(jobId, {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      jobType: formData.jobType as any,
      workMode: formData.workMode as any,
      industryType: formData.industryType || undefined,
      department: formData.department || undefined,
      jobRole: formData.jobRole === 'Others' && formData.customJobRole
        ? formData.customJobRole
        : formData.jobRole || undefined,
      qualification: (formData.qualification || undefined) as any,
      degreeRequired: formData.degreeRequired || undefined,
      skillsRequired: formData.skillsRequired,
      languagesKnown: formData.languagesKnown,
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
      minExperience: minExp,
      maxExperience: maxExp,
    });
    setIsSubmitting(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success('Job updated successfully!');
    router.push('/employer');
  };

  const inputCls = `w-full px-4 py-2.5 rounded-xl border border-foreground/15 bg-background
    text-foreground placeholder:text-foreground/40 text-sm
    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
    transition-all duration-200`;
  const labelCls = 'block text-sm font-medium text-foreground/80 mb-1.5';

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-foreground/60">Loading job details…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h1>
        <p className="text-foreground/60 mb-6">{error}</p>
        <Link href="/employer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white
          rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <div className="mb-8">
          <Link href="/employer" className="inline-flex items-center gap-1.5 text-sm text-foreground/60
            hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Edit Job</h1>
          <p className="text-foreground/60 mt-1">Update your job posting details</p>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-background shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label htmlFor="title" className={labelCls}>Job Title <span className="text-red-500">*</span></label>
              <input id="title" name="title" type="text" value={formData.title}
                onChange={set('title')} className={inputCls} placeholder="e.g., Senior Software Engineer"
                disabled={isSubmitting} required />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelCls}>Job Description <span className="text-red-500">*</span></label>
              <textarea id="description" name="description" value={formData.description}
                onChange={set('description')} rows={8}
                className={`${inputCls} resize-y min-h-[200px]`}
                placeholder="Describe the role, responsibilities, and requirements…"
                disabled={isSubmitting} required />
            </div>

            {/* Job Type + Work Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="jobType" className={labelCls}>Job Type <span className="text-red-500">*</span></label>
                <select id="jobType" name="jobType" value={formData.jobType}
                  onChange={set('jobType')} className={inputCls} disabled={isSubmitting} required>
                  <option value="">Select type</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div>
                <label htmlFor="workMode" className={labelCls}>Work Mode</label>
                <select id="workMode" name="workMode" value={formData.workMode}
                  onChange={set('workMode')} className={inputCls} disabled={isSubmitting}>
                  <option value="ONSITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className={labelCls}>Location <span className="text-red-500">*</span></label>
              <LocationAutocomplete id="location" value={formData.location}
                onChange={(val) => setFormData((p) => ({ ...p, location: val }))}
                placeholder="e.g., Mumbai, Dubai" disabled={isSubmitting} allowCustom />
            </div>

            {/* Industry & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="industryType" className={labelCls}>Industry</label>
                <select id="industryType" name="industryType" value={formData.industryType}
                  onChange={(e) => setFormData((p) => ({ ...p, industryType: e.target.value, department: '', jobRole: '' }))}
                  className={inputCls} disabled={isSubmitting}>
                  <option value="">Select industry</option>
                  {INDUSTRY_LIST.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="department" className={labelCls}>Department</label>
                <select id="department" name="department" value={formData.department}
                  onChange={set('department')} className={inputCls}
                  disabled={isSubmitting || !formData.industryType}>
                  <option value="">{formData.industryType ? 'Select department' : 'Select industry first'}</option>
                  {departmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Job Role (dependent on industry) */}
            <div>
              <label htmlFor="jobRole" className={labelCls}>Job Role</label>
              <select id="jobRole" name="jobRole" value={formData.jobRole}
                onChange={set('jobRole')} className={inputCls}
                disabled={isSubmitting || !formData.industryType}>
                <option value="">{formData.industryType ? 'Select job role' : 'Select industry first'}</option>
                {jobRoleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {formData.jobRole === 'Others' && (
                <input type="text" value={formData.customJobRole}
                  onChange={set('customJobRole')} placeholder="Specify your custom job role"
                  className={`mt-2 ${inputCls}`} disabled={isSubmitting} />
              )}
            </div>

            {/* Skills Required */}
            <div>
              <label htmlFor="skillsRequired" className={labelCls}>Skills Required</label>
              <TagInput id="skillsRequired" value={formData.skillsRequired}
                onChange={(tags) => setFormData((p) => ({ ...p, skillsRequired: tags }))}
                suggestions={COMMON_SKILLS} placeholder="Type a skill and press Enter…"
                disabled={isSubmitting} />
            </div>

            {/* Qualification */}
            <div>
              <label htmlFor="qualification" className={labelCls}>Minimum Qualification</label>
              <select id="qualification" name="qualification" value={formData.qualification}
                onChange={set('qualification')} className={inputCls} disabled={isSubmitting}>
                <option value="">Select qualification</option>
                {QUALIFICATION_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            {/* Degree Required */}
            <div>
              <label htmlFor="degreeRequired" className={labelCls}>Degree Required</label>
              <input id="degreeRequired" name="degreeRequired" type="text" value={formData.degreeRequired}
                onChange={set('degreeRequired')} className={inputCls}
                placeholder="e.g., B.Tech in Computer Science, MBA" disabled={isSubmitting} />
            </div>

            {/* Languages Known */}
            <div>
              <label htmlFor="languagesKnown" className={labelCls}>Languages Required</label>
              <MultiSelect id="languagesKnown" options={LANGUAGE_OPTIONS}
                value={formData.languagesKnown}
                onChange={(langs) => setFormData((p) => ({ ...p, languagesKnown: langs }))}
                placeholder="Select required languages" disabled={isSubmitting} />
            </div>

            {/* Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salaryMin" className={labelCls}>Min Salary (₹)</label>
                <input id="salaryMin" name="salaryMin" type="number" min="0" step="1000"
                  value={formData.salaryMin} onChange={set('salaryMin')} className={inputCls}
                  placeholder="e.g., 500000" disabled={isSubmitting} />
              </div>
              <div>
                <label htmlFor="salaryMax" className={labelCls}>Max Salary (₹)</label>
                <input id="salaryMax" name="salaryMax" type="number" min="0" step="1000"
                  value={formData.salaryMax} onChange={set('salaryMax')} className={inputCls}
                  placeholder="e.g., 1000000" disabled={isSubmitting} />
              </div>
            </div>

            {/* Experience Range */}
            <div>
              <label className={labelCls}>Experience Required (Years)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input id="minExperience" name="minExperience" type="number" min="0" step="1"
                    value={formData.minExperience} onChange={set('minExperience')} className={inputCls}
                    placeholder="Min (e.g., 2)" disabled={isSubmitting} />
                  <p className="mt-1 text-xs text-foreground/50">Minimum years</p>
                </div>
                <div>
                  <input id="maxExperience" name="maxExperience" type="number" min="0" step="1"
                    value={formData.maxExperience} onChange={set('maxExperience')} className={inputCls}
                    placeholder="Max (e.g., 5)" disabled={isSubmitting} />
                  <p className="mt-1 text-xs text-foreground/50">Maximum years</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold
                  hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving…</>) : 'Save Changes'}
              </button>
              <Link href="/employer" className="px-6 py-2.5 rounded-xl border border-foreground/20
                text-sm font-medium hover:bg-foreground/5 transition-colors text-foreground/70">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
