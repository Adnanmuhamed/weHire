'use client';

import { SlideOverApplication } from '../application-slide-over';
import { ApplicationCard } from './application-card';
import { ApplicationStatus } from '@prisma/client';

interface KanbanColumnProps {
  status: ApplicationStatus;
  title: string;
  applications: SlideOverApplication[];
  onCardClick: (application: SlideOverApplication) => void;
}

export function KanbanColumn({ status, title, applications, onCardClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-shrink-0 w-[300px] h-full bg-muted/30 rounded-xl overflow-hidden border border-foreground/5 dark:border-foreground/10">
      <div className="p-4 border-b border-foreground/5 bg-background/50 flex items-center justify-between sticky top-0 z-10">
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">{title}</h3>
        <span className="bg-foreground/10 text-foreground text-xs font-bold px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-8">
        {applications.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-sm font-medium text-foreground/40 border-2 border-dashed border-foreground/10 rounded-lg">
            No candidates
          </div>
        ) : (
          applications.map(app => (
            <ApplicationCard 
              key={app.id} 
              application={app} 
              onClick={onCardClick} 
            />
          ))
        )}
      </div>
    </div>
  );
}
