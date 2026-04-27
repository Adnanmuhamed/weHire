'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { SlideOverApplication } from '../application-slide-over';
import { Clock } from 'lucide-react';

interface ApplicationCardProps {
  application: SlideOverApplication;
  onClick: (application: SlideOverApplication) => void;
}

export function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const profile = application.user.profile;
  const avatarUrl = profile?.profilePic || null;

  return (
    <div 
      onClick={() => onClick(application)}
      className="bg-background rounded-lg border border-foreground/10 shadow-sm p-4 w-[280px] cursor-pointer hover:border-foreground/30 hover:shadow-md transition-all group flex-shrink-0"
    >
      <div className="flex gap-3 items-start">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-foreground/10 border border-foreground/10 flex-shrink-0 mt-0.5">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground/50 font-bold text-sm">
              {profile?.fullName?.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {profile?.fullName || 'Unknown Candidate'}
          </h4>
          <p className="text-xs text-foreground/60 truncate mt-0.5">
            {profile?.headline || 'No headline provided'}
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-foreground/5 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-foreground/50">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDistanceToNow(new Date(application.appliedDate), { addSuffix: true })}</span>
        </div>
        
        {application.resumeUrl || profile?.resumeUrl ? (
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
            Resume
          </span>
        ) : null}
      </div>
    </div>
  );
}
