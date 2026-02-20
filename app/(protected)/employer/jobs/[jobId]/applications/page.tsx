import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobApplications } from '@/app/actions/application';
import ApplicationRow from '@/components/employer/application-row';

/**
 * Job Applications Page (Employer ATS)
 *
 * Lists all applicants for a job. Uses server action for data.
 * Protected: employer role + job ownership.
 */

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobApplicationsPage({ params }: PageProps) {
  const { jobId } = await params;
  const result = await getJobApplications(jobId);

  if (result.error) {
    if (
      result.error.includes('not found') ||
      result.error.includes('access denied')
    ) {
      notFound();
    }
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
          <p className="text-foreground/70">{result.error}</p>
        </div>
      </div>
    );
  }

  const jobTitle = result.jobTitle ?? 'Job';
  const applications = result.applications ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <div className="mb-8">
          <Link
            href="/employer/jobs"
            className="text-sm text-foreground/70 hover:text-foreground mb-4 inline-block"
          >
            ← Back to Jobs
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Applicants for {jobTitle}
          </h1>
          <p className="text-foreground/70">
            {applications.length}{' '}
            {applications.length === 1 ? 'applicant' : 'applicants'}
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 text-center border border-foreground/10 rounded-lg bg-background">
            <p className="text-foreground/70">No applicants yet.</p>
            <p className="text-sm text-foreground/60 mt-2">
              Applications will appear here when candidates apply to this job.
            </p>
          </div>
        ) : (
          <div className="border border-foreground/10 rounded-lg bg-background overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/10 bg-foreground/5">
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10">
                  {applications.map((app) => (
                    <ApplicationRow
                      key={app.id}
                      applicationId={app.id}
                      candidateEmail={app.user.email}
                      candidateName={app.user.profile?.fullName ?? null}
                      candidateMobile={
                        app.user.profile?.mobile ?? app.user.mobileNumber ?? null
                      }
                      resumeUrl={app.user.profile?.resumeUrl ?? null}
                      status={app.status}
                      appliedDate={app.createdAt.toISOString()}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
