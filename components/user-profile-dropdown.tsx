'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

/**
 * User Profile Dropdown Component
 * 
 * Client Component that displays a dropdown menu in the Navbar.
 * Shows user avatar/initials with links to Edit Profile, Settings, and Logout.
 */

interface UserProfileDropdownProps {
  userEmail: string;
  userName?: string | null;
  avatarUrl?: string | null;
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
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-foreground/10 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName || userEmail}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-foreground/20 flex items-center justify-center text-sm font-medium text-foreground">
            {initials}
          </div>
        )}
        <ChevronDown className="w-4 h-4 text-foreground/70" />
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

