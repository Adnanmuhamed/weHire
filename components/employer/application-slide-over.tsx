'use client';

import { useState, useTransition } from 'react';
import { updateApplicationStatus } from '@/app/actions/employer-ats';
import { ApplicationStatus } from '@prisma/client';
import {
  X, FileText, ExternalLink, Mail, Phone,
  MapPin, Building, GraduationCap, Loader2,
  Github, Linkedin, Globe, Award, FolderGit2, ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

export type SlideOverApplication = {
  id: string;
  status: ApplicationStatus;
  appliedDate: Date;
  resumeUrl: string | null;
  resumeName: string | null;
  coverLetterUrl: string | null;
  coverLetterName: string | null;
  user: {
    id: string;
    email: string | null;
    mobileNumber: string | null;
    profile: {
      fullName: string;
      headline: string | null;
      profilePic: string | null;
      resumeUrl: string | null;
      resumeName: string | null;
      coverLetterUrl: string | null;
      coverLetterName: string | null;
      location?: string | null;
      totalExperience?: number;
      bio?: string | null;
      profileSummary?: string | null;
      skills?: string[];
      linkedinUrl?: string | null;
      githubUrl?: string | null;
      portfolioUrl?: string | null;
      education: any[];
      experience: any[];
      projects?: any[];
      certificates?: any[];
    } | null;
  };
};

interface SlideOverProps {
  application: SlideOverApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (appId: string, newStatus: ApplicationStatus) => void;
}

export default function ApplicationSlideOver({ application, isOpen, onClose, onStatusUpdated }: SlideOverProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !application) return null;

  const profile = application.user.profile;
  const avatarUrl = profile?.profilePic || null;

  // Smart fallback: prefer application-level file, then profile-level
  const resolvedResumeUrl = application.resumeUrl || profile?.resumeUrl || null;
  const resolvedResumeName = application.resumeName || profile?.resumeName || 'Resume';
  const resolvedCoverUrl = application.coverLetterUrl || profile?.coverLetterUrl || null;
  const resolvedCoverName = application.coverLetterName || profile?.coverLetterName || 'Cover Letter';

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ApplicationStatus;
    startTransition(async () => {
      const res = await updateApplicationStatus(application.id, newStatus);
      if (res.success) {
        onStatusUpdated(application.id, newStatus);
      } else {
        alert(res.error || 'Failed to update status');
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all"
        onClick={onClose}
      />

      {/* Panel — always dark regardless of system theme */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-[#0f0f11] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-white">Application Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* ════════════════════════════╗
                LEFT COLUMN  (col-span-1)   ║
                ════════════════════════════╝ */}
            <div className="md:col-span-1 space-y-6 md:border-r border-white/10 md:pr-6">

              {/* Avatar + Name + Headline */}
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 shrink-0">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50 font-bold text-3xl">
                      {profile?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white leading-tight">
                    {profile?.fullName || 'Unknown Candidate'}
                  </h1>
                  {profile?.headline
                    ? <p className="text-sm text-indigo-400 italic font-medium mt-1">{profile.headline}</p>
                    : <p className="text-sm text-gray-600 italic mt-1">No headline provided</p>
                  }
                </div>
              </div>

              {/* Application Status */}
              <div className="flex flex-col gap-2 pt-5 border-t border-white/10">
                <span className="text-[11px] text-gray-600 font-semibold tracking-widest uppercase">
                  Application Status
                </span>
                <div className="relative">
                  <select
                    value={application.status}
                    onChange={handleStatusChange}
                    disabled={isPending}
                    className="w-full pl-3 pr-9 py-2 text-sm font-medium rounded-md bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none disabled:opacity-50 cursor-pointer"
                  >
                    <option value={ApplicationStatus.PENDING}>Pending</option>
                    <option value={ApplicationStatus.REVIEWING}>Reviewing</option>
                    <option value={ApplicationStatus.SHORTLISTED}>Shortlisted</option>
                    <option value={ApplicationStatus.INTERVIEWING}>Interviewing</option>
                    <option value={ApplicationStatus.REJECTED}>Rejected</option>
                    <option value={ApplicationStatus.HIRED}>Hired</option>
                  </select>
                  {isPending
                    ? <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-500 pointer-events-none" />
                    : <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                  }
                </div>
                <span className="text-[11px] text-gray-600 mt-0.5">
                  Applied {format(new Date(application.appliedDate), 'MMM d, yyyy')}
                </span>
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-2.5 pt-5 border-t border-white/10">
                <span className="text-[11px] text-gray-600 font-semibold tracking-widest uppercase mb-1">
                  Contact
                </span>
                {(profile?.location || profile?.totalExperience !== undefined) && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-600 shrink-0" />
                    <span>
                      {[
                        profile?.location,
                        profile?.totalExperience !== undefined
                          ? `${profile.totalExperience} yrs exp`
                          : null,
                      ].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                )}
                {application.user.email && (
                  <a
                    href={`mailto:${application.user.email}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 text-gray-600 shrink-0" />
                    <span>{application.user.email}</span>
                  </a>
                )}
                {application.user.mobileNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="w-4 h-4 text-gray-600 shrink-0" />
                    <span>{application.user.mobileNumber}</span>
                  </div>
                )}
                {profile?.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 shrink-0" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile?.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4 shrink-0" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile?.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>

              {/* Skills */}
              {profile?.skills && profile.skills.length > 0 && (
                <div className="pt-5 border-t border-white/10">
                  <span className="text-[11px] text-gray-600 font-semibold tracking-widest uppercase block mb-3">
                    Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-medium bg-white/5 border border-white/10 rounded-full text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {(resolvedResumeUrl || resolvedCoverUrl) && (
                <div className="pt-5 border-t border-white/10 space-y-2">
                  <span className="text-[11px] text-gray-600 font-semibold tracking-widest uppercase block mb-2">
                    Documents
                  </span>
                  {resolvedResumeUrl && (
                    <a
                      href={resolvedResumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-white/10 rounded-lg hover:border-white/25 hover:bg-white/5 transition group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-blue-900/30 text-blue-400 rounded shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-300 truncate">
                          {resolvedResumeName}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-300 opacity-0 group-hover:opacity-100 transition shrink-0" />
                    </a>
                  )}
                  {resolvedCoverUrl && (
                    <a
                      href={resolvedCoverUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-white/10 rounded-lg hover:border-white/25 hover:bg-white/5 transition group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-purple-900/30 text-purple-400 rounded shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-300 truncate">
                          {resolvedCoverName}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-300 opacity-0 group-hover:opacity-100 transition shrink-0" />
                    </a>
                  )}
                </div>
              )}

            </div>

            {/* ════════════════════════════╗
                RIGHT COLUMN (col-span-2)   ║
                ════════════════════════════╝ */}
            <div className="md:col-span-2 space-y-8 pb-12">

              {/* Professional Summary */}
              {(profile?.profileSummary || profile?.bio) && (
                <section className="space-y-3">
                  <SectionTitle>Professional Summary</SectionTitle>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {profile.profileSummary ?? profile.bio}
                  </p>
                </section>
              )}

              {/* ── Employment ── */}
              <section className="space-y-3">
                <SectionTitle icon={<Building className="w-3.5 h-3.5" />}>
                  Employment History
                </SectionTitle>
                {profile?.experience && profile.experience.length > 0 ? (
                  <div className="space-y-3">
                    {profile.experience.map((exp: any, i: number) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.07] transition-colors">
                        <h4 className="text-[15px] font-semibold text-white">{exp.designation}</h4>
                        <p className="text-sm text-gray-400 mt-0.5">{exp.company}</p>
                        <p className="text-xs text-gray-600 mt-1 font-mono">
                          {exp.startYear ?? '?'} – {exp.isCurrent ? 'Present' : (exp.endYear ?? 'Present')}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-300 mt-3 leading-relaxed whitespace-pre-wrap border-t border-white/5 pt-3">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState>No employment history provided.</EmptyState>
                )}
              </section>

              {/* ── Education ── */}
              <section className="space-y-3">
                <SectionTitle icon={<GraduationCap className="w-3.5 h-3.5" />}>
                  Education
                </SectionTitle>
                {profile?.education && profile.education.length > 0 ? (
                  <div className="space-y-3">
                    {profile.education.map((edu: any, i: number) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.07] transition-colors">
                        <h4 className="text-[15px] font-semibold text-white">{edu.degree}</h4>
                        <p className="text-sm text-gray-400 mt-0.5">{edu.college}</p>
                        <p className="text-xs text-gray-600 mt-1 font-mono">
                          {edu.startYear ?? '?'} – {edu.endYear ?? 'Present'}
                        </p>
                        {edu.stream && (
                          <p className="text-sm text-gray-300 mt-2">
                            <span className="text-gray-600 text-xs uppercase tracking-wide mr-2">Stream</span>
                            {edu.stream}
                          </p>
                        )}
                        {edu.grade && (
                          <p className="text-sm text-gray-300 mt-1">
                            <span className="text-gray-600 text-xs uppercase tracking-wide mr-2">Grade / CGPA</span>
                            {edu.grade}
                          </p>
                        )}
                        {edu.activities && (
                          <p className="text-sm text-gray-400 mt-3 italic leading-relaxed border-t border-white/5 pt-3">
                            {edu.activities}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState>No education details provided.</EmptyState>
                )}
              </section>

              {/* ── Projects ── */}
              <section className="space-y-3">
                <SectionTitle icon={<FolderGit2 className="w-3.5 h-3.5" />}>
                  Key Projects
                </SectionTitle>
                {profile?.projects && profile.projects.length > 0 ? (
                  <div className="space-y-3">
                    {profile.projects.map((proj: any, i: number) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.07] transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-[15px] font-semibold text-white leading-snug">{proj.title}</h4>
                          {proj.projectLink && (
                            <a
                              href={proj.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors shrink-0"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {proj.role && <p className="text-sm text-gray-400 mt-0.5">{proj.role}</p>}
                        <p className="text-xs text-gray-600 mt-1 font-mono">
                          {proj.startDate ? format(new Date(proj.startDate), 'MMM yyyy') : '?'}
                          {' – '}
                          {proj.endDate ? format(new Date(proj.endDate), 'MMM yyyy') : 'Present'}
                        </p>
                        {proj.description && (
                          <p className="text-sm text-gray-300 mt-3 leading-relaxed whitespace-pre-wrap border-t border-white/5 pt-3">
                            {proj.description}
                          </p>
                        )}
                        {proj.skills && proj.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {proj.skills.map((skill: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState>No projects provided.</EmptyState>
                )}
              </section>

              {/* ── Certifications ── */}
              <section className="space-y-3">
                <SectionTitle icon={<Award className="w-3.5 h-3.5" />}>
                  Certifications
                </SectionTitle>
                {profile?.certificates && profile.certificates.length > 0 ? (
                  <div className="space-y-3">
                    {profile.certificates.map((cert: any, i: number) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.07] transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-[15px] font-semibold text-white leading-snug">{cert.name}</h4>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-white transition-colors shrink-0 mt-0.5"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        {cert.issuer && <p className="text-sm text-gray-400 mt-0.5">{cert.issuer}</p>}
                        {cert.issueDate && (
                          <p className="text-xs text-gray-600 mt-1 font-mono">
                            Issued {format(new Date(cert.issueDate), 'MMM yyyy')}
                          </p>
                        )}
                        {cert.credentialId && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg font-mono text-xs text-gray-300">
                              <span className="text-gray-600 uppercase tracking-widest text-[10px]">ID</span>
                              {cert.credentialId}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState>No certifications provided.</EmptyState>
                )}
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Tiny helpers to keep JSX clean ── */
function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
      {icon}
      {children}
    </h3>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 italic">{children}</p>;
}
