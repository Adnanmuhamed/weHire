'use client';

/**
 * Filters Sidebar Component
 *
 * Advanced filters sidebar for the Jobs page.
 * Work Mode, Job Type, Experience, Salary, Industry, Department, Sort, Saved.
 * Updates URL params on change using useRouter and useSearchParams.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { JobType, WorkMode } from '@prisma/client';
import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { INDUSTRY_LIST, getDepartments } from '@/lib/constants/industries';

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

export default function FiltersSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize form state from URL params
  const [jobType, setJobType] = useState<JobType | ''>(
    (searchParams.get('jobType') as JobType) || ''
  );
  const [workMode, setWorkMode] = useState<WorkMode | ''>(
    (searchParams.get('workMode') as WorkMode) || ''
  );
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [maxSalary, setMaxSalary] = useState(searchParams.get('maxSalary') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [sort, setSort] = useState<'newest' | 'salary_high' | 'salary_low'>(
    (searchParams.get('sort') as 'newest' | 'salary_high' | 'salary_low') || 'newest'
  );
  const [showSavedOnly, setShowSavedOnly] = useState(
    searchParams.get('saved') === 'true'
  );

  // Sync with URL params when they change externally
  useEffect(() => {
    setJobType((searchParams.get('jobType') as JobType) || '');
    setWorkMode((searchParams.get('workMode') as WorkMode) || '');
    setMinSalary(searchParams.get('minSalary') || '');
    setMaxSalary(searchParams.get('maxSalary') || '');
    setExperience(searchParams.get('experience') || '');
    setIndustry(searchParams.get('industry') || '');
    setDepartment(searchParams.get('department') || '');
    setSort(
      (searchParams.get('sort') as 'newest' | 'salary_high' | 'salary_low') || 'newest'
    );
    setShowSavedOnly(searchParams.get('saved') === 'true');
  }, [searchParams]);

  // Derive departments from selected industry
  const departmentOptions = industry ? getDepartments(industry) : [];

  // Update URL params when filters change
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 on filter change
    params.delete('page');

    router.push(`/jobs?${params.toString()}`);
  };

  const handleJobTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setJobType(value as JobType | '');
    updateParams('jobType', value);
  };

  const handleWorkModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setWorkMode(value as WorkMode | '');
    updateParams('workMode', value);
  };

  const handleMinSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinSalary(value);
    updateParams('minSalary', value);
  };

  const handleMaxSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxSalary(value);
    updateParams('maxSalary', value);
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExperience(value);
    updateParams('experience', value);
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIndustry(value);
    updateParams('industry', value);
    // Clear department when industry changes
    if (department) {
      setDepartment('');
      const params = new URLSearchParams(searchParams.toString());
      params.set('industry', value);
      params.delete('department');
      params.delete('page');
      router.push(`/jobs?${params.toString()}`);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDepartment(value);
    updateParams('department', value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSort(value as 'newest' | 'salary_high' | 'salary_low');
    updateParams('sort', value);
  };

  const handleShowSavedOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowSavedOnly(checked);
    updateParams('saved', checked ? 'true' : '');
  };

  const handleClearFilters = () => {
    setJobType('');
    setWorkMode('');
    setMinSalary('');
    setMaxSalary('');
    setExperience('');
    setIndustry('');
    setDepartment('');
    setSort('newest');
    setShowSavedOnly(false);
    router.push('/jobs');
  };

  const selectClass =
    'w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent';
  const inputClass = selectClass;

  return (
    <aside className="w-full">
      <div className="rounded-lg border border-foreground/10 bg-background p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-foreground/70" />
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        </div>

        {/* Work Mode */}
        <div>
          <label htmlFor="workMode" className="block text-sm font-medium mb-1.5 text-foreground">
            Work Mode
          </label>
          <select id="workMode" value={workMode} onChange={handleWorkModeChange} className={selectClass}>
            <option value="">All Modes</option>
            {WORK_MODES.map((wm) => (
              <option key={wm.value} value={wm.value}>
                {wm.label}
              </option>
            ))}
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label htmlFor="jobType" className="block text-sm font-medium mb-1.5 text-foreground">
            Job Type
          </label>
          <select id="jobType" value={jobType} onChange={handleJobTypeChange} className={selectClass}>
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="INTERN">Intern</option>
            <option value="CONTRACT">Contract</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>

        {/* Experience */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium mb-1.5 text-foreground">
            Max Experience (Years)
          </label>
          <input
            id="experience"
            type="number"
            value={experience}
            onChange={handleExperienceChange}
            placeholder="e.g., 5"
            min="0"
            max="50"
            className={inputClass}
          />
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium mb-1.5 text-foreground">
            Industry
          </label>
          <select id="industry" value={industry} onChange={handleIndustryChange} className={selectClass}>
            <option value="">All Industries</option>
            {INDUSTRY_LIST.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Department — shown only when an industry is selected & has departments */}
        {industry && departmentOptions.length > 0 && (
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-1.5 text-foreground">
              Department
            </label>
            <select id="department" value={department} onChange={handleDepartmentChange} className={selectClass}>
              <option value="">All Departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            Salary Range
          </label>
          <div className="space-y-2">
            <input
              type="number"
              value={minSalary}
              onChange={handleMinSalaryChange}
              placeholder="Min Salary"
              min="0"
              className={inputClass}
            />
            <input
              type="number"
              value={maxSalary}
              onChange={handleMaxSalaryChange}
              placeholder="Max Salary"
              min="0"
              className={inputClass}
            />
          </div>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium mb-1.5 text-foreground">
            Sort By
          </label>
          <select id="sort" value={sort} onChange={handleSortChange} className={selectClass}>
            <option value="newest">Newest First</option>
            <option value="salary_high">Salary: High to Low</option>
            <option value="salary_low">Salary: Low to High</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={handleClearFilters}
          className="w-full px-4 py-2 border border-foreground/20 rounded-md font-medium text-foreground hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-colors text-sm"
        >
          Clear All Filters
        </button>
      </div>

      {/* My Library Section */}
      <div className="mt-6 rounded-lg border border-foreground/10 bg-background p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-foreground/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-foreground">My Library</h2>
        </div>

        {/* Show Saved Jobs Only */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showSavedOnly"
            checked={showSavedOnly}
            onChange={handleShowSavedOnlyChange}
            className="w-4 h-4 border-foreground/20 rounded text-foreground focus:ring-2 focus:ring-foreground/20"
          />
          <label htmlFor="showSavedOnly" className="text-sm font-medium text-foreground cursor-pointer">
            Show Saved Jobs Only
          </label>
        </div>
      </div>
    </aside>
  );
}
