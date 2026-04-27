'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavbarMobileMenuProps {
  userRole: string | null;
  isAuthenticated: boolean;
}

export default function NavbarMobileMenu({ userRole, isAuthenticated }: NavbarMobileMenuProps) {
  const [open, setOpen] = useState(false);

  const linkCls =
    'block px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:text-gray-300 hover:bg-white/10 rounded-md';
  const primaryLinkCls =
    'block px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:text-gray-300 hover:bg-white/10 rounded-md';

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-black border-b border-white/10 shadow-xl">
          <nav className="container mx-auto px-4 py-3 space-y-1 max-w-7xl">
            {isAuthenticated ? (
              <>
                {userRole === 'EMPLOYER' && (
                  <>
                    <Link href="/employer" className={linkCls} onClick={() => setOpen(false)}>
                      Manage Jobs
                    </Link>
                    <Link href="/employer/jobs/new" className={primaryLinkCls} onClick={() => setOpen(false)}>
                      Post a Job
                    </Link>
                  </>
                )}
                {userRole === 'USER' && (
                  <>
                    <Link href="/jobs" className={linkCls} onClick={() => setOpen(false)}>
                      Jobs
                    </Link>
                    <Link href="/companies" className={linkCls} onClick={() => setOpen(false)}>
                      Companies
                    </Link>
                  </>
                )}
                {userRole === 'ADMIN' && (
                  <Link href="/admin" className={linkCls} onClick={() => setOpen(false)}>
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/jobs" className={linkCls} onClick={() => setOpen(false)}>
                  Find Jobs
                </Link>
                <Link href="/companies" className={linkCls} onClick={() => setOpen(false)}>
                  Companies
                </Link>
                <div className="border-t border-white/10 my-2" />
                <Link href="/login" className={linkCls} onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link href="/signup" className={primaryLinkCls} onClick={() => setOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
