'use client';

/**
 * Applications List Component
 * 
 * Client Component that displays a list of applications
 * with clickable cards that open a details sheet.
 */

import { useState } from 'react';
import ApplicationCard from './application-card';
import ApplicationDetailsDialog from './application-details-dialog';
import { ApplicationStatus } from '@prisma/client';

interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  coverNote: string | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
    };
  };
}

interface ApplicationsListProps {
  applications: Application[];
}

export default function ApplicationsList({ applications }: ApplicationsListProps) {
  const [selectedApplication, setSelectedApplication] = useState<{
    id: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    status: ApplicationStatus;
    coverNote: string | null;
    appliedDate: Date;
    resumeUrl: string | null;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCardClick = async (application: Application) => {
    // Fetch resume URL from user's profile
    // For now, we'll need to pass it from the server or fetch it here
    // Let's fetch it from the API
    let resumeUrl: string | null = null;
    try {
      const response = await fetch('/api/profile/resume');
      if (response.ok) {
        const data = await response.json();
        resumeUrl = data.resumeUrl;
      }
    } catch (error) {
      console.error('Failed to fetch resume URL:', error);
    }

    setSelectedApplication({
      id: application.id,
      jobId: application.job.id,
      jobTitle: application.job.title,
      companyName: application.job.company.name,
      status: application.status,
      coverNote: application.coverNote,
      appliedDate: new Date(application.createdAt),
      resumeUrl,
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            applicationId={application.id}
            jobId={application.job.id}
            jobTitle={application.job.title}
            companyName={application.job.company.name}
            status={application.status}
            appliedDate={new Date(application.createdAt)}
            onClick={() => handleCardClick(application)}
          />
        ))}
      </div>

      <ApplicationDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        application={selectedApplication}
      />
    </>
  );
}

