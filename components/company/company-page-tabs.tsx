'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, Clock } from 'lucide-react';
import { formatToLPA } from '@/lib/utils/format-salary';

interface CompanyPageTabsProps {
  company: {
    about: string | null;
    websiteUrl: string | null;
  };
  jobs: Array<{
    id: string;
    title: string;
    location: string;
    jobType: string;
    workMode: string;
    salaryMin: number | null;
    salaryMax: number | null;
    experience: number | null;
    createdAt: Date;
  }>;
}

export default function CompanyPageTabs({ company, jobs }: CompanyPageTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs'>('overview');

  const formatSalary = (min: number | null, max: number | null) => {
    return formatToLPA(min, max);
  };

  const getTimeAgo = (date: Date) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="bg-background border border-foreground/10 rounded-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-foreground/10">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-foreground border-b-2 border-foreground'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'jobs'
              ? 'text-foreground border-b-2 border-foreground'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          Jobs ({jobs.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* About Section */}
            {company.about && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  About the Company
                </h3>
                <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {company.about}
                </p>
              </div>
            )}

            {!company.about && (
              <p className="text-foreground/60 text-center py-8">
                No company information available yet.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-foreground/60 text-center py-8">
                No open positions at the moment.
              </p>
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block p-4 rounded-lg border border-foreground/10 hover:border-foreground/20 hover:bg-foreground/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1">{job.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/70">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.experience !== null ? `${job.experience} years` : 'Any'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {getTimeAgo(job.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-foreground/10 rounded text-xs text-foreground">
                          {job.jobType}
                        </span>
                        <span className="px-2 py-1 bg-foreground/10 rounded text-xs text-foreground">
                          {job.workMode}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
