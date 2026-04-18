'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  SlidersHorizontal,
  Briefcase,
  Building2,
} from 'lucide-react';
import { Role } from '@prisma/client';

/**
 * User Profile Dropdown Component
 * 
 * Client Component that displays a dropdown menu in the Navbar.
 * Shows user avatar/initials with links to Edit Profile, Settings, Job Preferences (candidates), and Logout.
 */

interface UserProfileDropdownProps {
  userEmail: string;
  userName?: string | null;
  avatarUrl?: string | null;
  userRole?: Role;
  logoutAction: () => Promise<void>;
}

function getInitials(email: string, name?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || email[0]?.toUpperCase() || 'U';
  }
  return email[0]?.toUpperCase() || 'U';
}

export default function UserProfileDropdown({
  userEmail,
  userName,
  avatarUrl,
  userRole,
  logoutAction,
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const initials = getInitials(userEmail, userName);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName || userEmail}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium text-white">
            {initials}
          </div>
        )}
        <ChevronDown className="w-4 h-4 text-white/70" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-foreground/10 bg-background shadow-lg z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-foreground/10">
              <p className="text-sm font-medium text-foreground">
                {userName || 'User'}
              </p>
              <p className="text-xs text-foreground/60 mt-1">{userEmail}</p>
            </div>

            {/* Menu Items */}
            {userRole === Role.EMPLOYER ? (
              <>
                <Link
                  href="/employer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  Manage Jobs
                </Link>

                <Link
                  href="/employer/company-profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  Company Profile
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>

                {userRole === Role.USER && (
                  <Link
                    href="/preferences"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Job Preferences
                  </Link>
                )}
              </>
            )}

            {/* Logout Button */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-foreground/5 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

