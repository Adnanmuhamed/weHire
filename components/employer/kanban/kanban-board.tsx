'use client';

import { useState } from 'react';
import { ApplicationStatus } from '@prisma/client';
import { KanbanColumn } from './kanban-column';
import ApplicationSlideOver, { SlideOverApplication } from '../application-slide-over';

interface KanbanBoardProps {
  initialApplications: SlideOverApplication[];
}

const COLUMNS = [
  { id: ApplicationStatus.PENDING, title: 'Pending' },
  { id: ApplicationStatus.REVIEWING, title: 'Reviewing' },
  { id: ApplicationStatus.SHORTLISTED, title: 'Shortlisted' },
  { id: ApplicationStatus.INTERVIEWING, title: 'Interviewing' },
  { id: ApplicationStatus.HIRED, title: 'Hired' },
  { id: ApplicationStatus.REJECTED, title: 'Rejected' },
];

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [applications, setApplications] = useState<SlideOverApplication[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<SlideOverApplication | null>(null);

  const handleCardClick = (app: SlideOverApplication) => {
    setSelectedApp(app);
  };

  const handleStatusUpdated = (appId: string, newStatus: ApplicationStatus) => {
    // Optimistically update board locally
    setApplications(prev => 
      prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );
    // If slideover is open, update its internals
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, status: newStatus });
    }
  };

  return (
    <>
      <div className="flex w-full overflow-x-auto h-[calc(100vh-200px)] gap-6 pb-6">
        {COLUMNS.map(col => (
          <KanbanColumn 
            key={col.id}
            status={col.id}
            title={col.title}
            applications={applications.filter(a => a.status === col.id)}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      <ApplicationSlideOver 
        isOpen={!!selectedApp}
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </>
  );
}
