'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function EmployerDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:text-gray-300 inline-flex items-center gap-1"
      >
        For Employers
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-[#111] border border-white/10 rounded-md shadow-lg py-1 z-50">
          <Link
            href="/login?role=EMPLOYER"
            prefetch={false}
            className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Employer Login
          </Link>
          <Link
            href="/employer-signup"
            prefetch={false}
            className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Post a Job (Signup)
          </Link>
        </div>
      )}
    </div>
  );
}
