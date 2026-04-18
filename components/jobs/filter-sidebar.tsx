'use client';

/**
 * Jobs Filter Sidebar
 *
 * Sidebar filters for the /jobs page:
 * Work Mode, Job Type, Industry, Department (cascading), Salary, Degree, Company.
 * Updates URL params on change.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { JobType, WorkMode } from '@prisma/client';
import { QUALIFICATION_OPTIONS } from '@/lib/constants/job-fields';
import { INDUSTRY_OPTIONS } from '@/lib/constants/company-fields';
import { ALL_DEPARTMENTS } from '@/lib/constants/industries';

export interface CompanyOption {
  id: string;
  name: string;
  logoUrl: string | null;
  location: string | null;
}

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

const SALARY_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '0-3', label: '0-3 LPA' },
  { value: '3-6', label: '3-6 LPA' },
  { value: '6-10', label: '6-10 LPA' },
  { value: '10+', label: '10+ LPA' },
] as const;

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'REMOTE', label: 'Remote' },
];

const DEGREE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'Pursuing Degree', label: 'Pursuing Degree' },
  { value: 'Associate', label: 'Associate' },
  { value: "Bachelor's", label: "Bachelor's" },
  { value: "Master's", label: "Master's" },
  { value: 'Ph.D.', label: 'Ph.D.' },
];

interface FilterSidebarProps {
  companies: CompanyOption[];
}

export default function FilterSidebar({ companies }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companySearch, setCompanySearch] = useState('');

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === undefined || value === '') continue;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const workModes = useMemo(
    () => searchParams.getAll('workMode').filter((v): v is WorkMode => ['REMOTE', 'HYBRID', 'ONSITE'].includes(v)),
    [searchParams]
  );
  const jobTypes = useMemo(
    () => searchParams.getAll('jobType').filter((v): v is JobType => ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'REMOTE'].includes(v)),
    [searchParams]
  );
  const salary = searchParams.get('salary') ?? '';
  const companyId = searchParams.get('companyId') ?? '';

  const toggleWorkMode = (mode: WorkMode) => {
    const next = workModes.includes(mode)
      ? workModes.filter((m) => m !== mode)
      : [...workModes, mode];
    updateParams({ workMode: next });
  };

  const toggleJobType = (type: JobType) => {
    const next = jobTypes.includes(type)
      ? jobTypes.filter((t) => t !== type)
      : [...jobTypes, type];
    updateParams({ jobType: next });
  };

  const industries = useMemo(() => searchParams.getAll('industry').filter(Boolean), [searchParams]);
  const qualifications = useMemo(() => searchParams.getAll('qualification').filter(Boolean), [searchParams]);
  const departments = useMemo(() => searchParams.getAll('department').filter(Boolean), [searchParams]);

  const toggleArrayParam = (key: string, value: string, current: string[]) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: next });
  };

  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companies.slice(0, 50);
    const q = companySearch.trim().toLowerCase();
    return companies
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [companies, companySearch]);

  return (
    <aside className="w-full shrink-0">
      <div className="rounded-lg border border-foreground/10 bg-background p-6 space-y-6 sticky top-24">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-foreground/70" />
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        </div>

        {/* Work Mode */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-2">
            Work Mode
          </p>
          <div className="space-y-2">
            {WORK_MODES.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={workModes.includes(value)}
                  onChange={() => toggleWorkMode(value)}
                  className="w-4 h-4 border-foreground/20 rounded text-foreground focus:ring-2 focus:ring-foreground/20"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Job Type */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-2">
            Job Type
          </p>
          <div className="space-y-2">
            {JOB_TYPES.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={jobTypes.includes(value)}
                  onChange={() => toggleJobType(value)}
                  className="w-4 h-4 border-foreground/20 rounded text-foreground focus:ring-2 focus:ring-foreground/20"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-2">
            Industry
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {INDUSTRY_OPTIONS.map((ind) => (
              <label
                key={ind}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={industries.includes(ind)}
                  onChange={() => {
                    const next = industries.includes(ind)
                      ? industries.filter((v) => v !== ind)
                      : [...industries, ind];
                    updateParams({ industry: next, department: undefined });
                  }}
                  className="w-4 h-4 border-foreground/20 rounded text-foreground focus:ring-2 focus:ring-foreground/20"
                />
                <span className="text-sm text-foreground">{ind}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Department */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-2">
            Department
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {ALL_DEPARTMENTS.map((dept) => (
              <label
                key={dept}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={departments.includes(dept)}
                  onChange={() => toggleArrayParam('department', dept, departments)}
                  className="w-4 h-4 border-foreground/20 rounded text-foreground focus:ring-2 focus:ring-foreground/20"
                />
                <span className="text-sm text-foreground">{dept}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-2">
            Salary Range
          </p>
          <div className="space-y-2">
            {SALARY_OPTIONS.map(({ value, label }) => (
              <label
                key={value || 'any'}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="salary"
                  checked={salary === value}
                  onChange={() => updateParams({ salary: value })}
                  className="w-4 h-4 border-foreground/20 text-foreground focus:ring-2 focus:ring-foreground/20"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Qualification */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-2">
            Qualification
          </p>
          <div className="space-y-2">
            {QUALIFICATION_OPTIONS.map((val) => (
              <label
                key={val}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={qualifications.includes(val)}
                  onChange={() => toggleArrayParam('qualification', val, qualifications)}
                  className="w-4 h-4 border-foreground/20 rounded text-foreground focus:ring-2 focus:ring-foreground/20"
                />
                <span className="text-sm text-foreground">{val}</span>
              </label>
            ))}
          </div>
        </div>



        {/* Companies */}
        <div>
          <p className="block text-sm font-medium text-foreground mb-2">
            Company
          </p>
          <input
            type="text"
            value={companySearch}
            onChange={(e) => setCompanySearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 mb-2"
          />
          <div className="max-h-40 overflow-y-auto space-y-1 border border-foreground/10 rounded p-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="companyId"
                checked={!companyId}
                onChange={() => updateParams({ companyId: undefined })}
                className="w-4 h-4 border-foreground/20 text-foreground focus:ring-2 focus:ring-foreground/20"
              />
              <span className="text-sm text-foreground">Any company</span>
            </label>
            {filteredCompanies.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 cursor-pointer block truncate"
              >
                <input
                  type="radio"
                  name="companyId"
                  checked={companyId === c.id}
                  onChange={() => updateParams({ companyId: c.id })}
                  className="w-4 h-4 shrink-0 border-foreground/20 text-foreground focus:ring-2 focus:ring-foreground/20"
                />
                <span className="text-sm text-foreground truncate">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setCompanySearch('');
            router.push('/jobs');
          }}
          className="w-full px-4 py-2 border border-foreground/20 rounded-md font-medium text-foreground hover:bg-foreground/5 transition-colors text-sm"
        >
          Clear Filters
        </button>
      </div>
    </aside>
  );
}
