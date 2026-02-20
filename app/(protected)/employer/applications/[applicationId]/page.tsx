import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getApplicantProfile } from '@/app/actions/employer-application';
import StatusSelect from '@/components/employer/status-select';
import { ApplicationStatus } from '@prisma/client';
import { FileText, Mail, Phone, MapPin, Linkedin, Github, ExternalLink } from 'lucide-react';

interface PageProps {
  params: Promise<{ applicationId: string }>;
}

function formatDate(d: Date | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatYearRange(
  start: number | null,
  end: number | null,
  isCurrent?: boolean
): string {
  if (start == null && end == null) return '';
  const s = start ?? '—';
  const e = isCurrent ? 'Present' : (end ?? '—');
  return `${s} – ${e}`;
}

export default async function ApplicantViewPage({ params }: PageProps) {
  const { applicationId } = await params;
  const result = await getApplicantProfile(applicationId);

  if (!result.success || !result.application) {
    if (
      result.error?.includes('not found') ||
      result.error?.includes('denied') ||
      result.error?.includes('Access')
    ) {
      notFound();
    }
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-foreground/70">{result.error}</p>
        </div>
      </div>
    );
  }

  const app = result.application;
  const profile = app.user.profile;
  const jobTitle = app.job.title;
  const jobId = app.job.id;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link
            href={`/employer/jobs/${jobId}/applications`}
            className="text-sm text-foreground/70 hover:underline mb-4 inline-block"
          >
            ← Back to applicants
          </Link>
          <p className="text-foreground/70">This candidate has not completed a profile.</p>
          <p className="text-sm text-foreground/60 mt-2">{app.user.email}</p>
          <div className="mt-4">
            <StatusSelect applicationId={app.id} currentStatus={app.status as ApplicationStatus} />
          </div>
        </div>
      </div>
    );
  }

  const displayLocation = profile.currentLocation ?? profile.location ?? null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <Link
          href={`/employer/jobs/${jobId}/applications`}
          className="text-sm text-foreground/70 hover:underline mb-4 inline-block"
        >
          ← Back to applicants for {jobTitle}
        </Link>

        {/* Header */}
        <header className="border-b border-foreground/10 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
            {profile.avatarUrl ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-foreground/10 flex-shrink-0">
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center text-2xl font-bold text-foreground/60 flex-shrink-0">
                {(profile.fullName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
              {(profile.resumeHeadline || profile.headline) && (
                <p className="text-sm text-foreground/80 mt-0.5">
                  {profile.resumeHeadline || profile.headline}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/70">
                {displayLocation && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {displayLocation}
                  </span>
                )}
                {profile.experience != null && (
                  <span>{profile.experience} years exp</span>
                )}
                {profile.availability && <span>{profile.availability}</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/70">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {profile.email}
                  </a>
                )}
                {profile.mobile && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {profile.mobile}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:underline"
                  >
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:underline"
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl.startsWith('http') ? profile.portfolioUrl : `https://${profile.portfolioUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" /> Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90"
              >
                <FileText className="w-4 h-4" />
                Download Resume
              </a>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/60">Status:</span>
              <StatusSelect applicationId={app.id} currentStatus={app.status as ApplicationStatus} />
            </div>
          </div>
        </header>

        {/* Summary */}
        {profile.profileSummary && (
          <section className="border-b border-foreground/10 pb-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-2">
              Summary
            </h2>
            <p className="text-foreground/90 whitespace-pre-wrap">{profile.profileSummary}</p>
          </section>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <section className="border-b border-foreground/10 pb-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-md bg-foreground/10 text-sm text-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {profile.employment && profile.employment.length > 0 && (
          <section className="border-b border-foreground/10 pb-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
              Experience
            </h2>
            <ul className="space-y-4">
              {profile.employment.map((emp) => (
                <li
                  key={emp.id}
                  className="py-2 border-l-2 border-foreground/10 pl-4"
                >
                  <p className="font-medium text-foreground">
                    {emp.designation} at {emp.company}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {formatYearRange(emp.startYear, emp.endYear, emp.isCurrent)}
                    {emp.location ? ` · ${emp.location}` : ''}
                  </p>
                  {emp.description && (
                    <p className="text-sm text-foreground/80 mt-1">{emp.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <section className="border-b border-foreground/10 pb-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
              Education
            </h2>
            <ul className="space-y-4">
              {profile.education.map((edu) => (
                <li
                  key={edu.id}
                  className="py-2 border-l-2 border-foreground/10 pl-4"
                >
                  <p className="font-medium text-foreground">
                    {edu.degree}
                    {edu.stream ? `, ${edu.stream}` : ''}
                  </p>
                  <p className="text-sm text-foreground/60">{edu.college}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    {formatYearRange(edu.startYear, edu.endYear)}
                    {edu.isFullTime ? ' · Full-time' : ' · Part-time'}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Projects */}
        {profile.projects && profile.projects.length > 0 && (
          <section className="border-b border-foreground/10 pb-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
              Projects
            </h2>
            <ul className="space-y-3">
              {profile.projects.map((p) => (
                <li key={p.id} className="py-2 border-l-2 border-foreground/10 pl-4">
                  <p className="font-medium text-foreground">{p.title}</p>
                  {p.role && (
                    <p className="text-sm text-foreground/60">{p.role}</p>
                  )}
                  {p.description && (
                    <p className="text-sm text-foreground/80 mt-1">{p.description}</p>
                  )}
                  {p.projectLink && (
                    <a
                      href={p.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/70 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Certifications */}
        {profile.certificates && profile.certificates.length > 0 && (
          <section className="pb-6">
            <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
              Certifications
            </h2>
            <ul className="space-y-2">
              {profile.certificates.map((c) => (
                <li key={c.id} className="text-foreground">
                  {c.name}
                  {c.issuer && (
                    <span className="text-foreground/60"> · {c.issuer}</span>
                  )}
                  {c.issueDate && (
                    <span className="text-foreground/50 text-sm">
                      {' '}
                      ({new Date(c.issueDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})
                    </span>
                  )}
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/70 hover:underline ml-1"
                    >
                      View
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
