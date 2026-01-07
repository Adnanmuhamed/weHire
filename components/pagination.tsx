'use client';

/**
 * Pagination Component
 * 
 * Client Component for navigating between pages of results.
 * Updates URL query params to trigger server-side refresh.
 */

import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <button
        onClick={() => updatePage(currentPage - 1)}
        disabled={!hasPreviousPage}
        className="px-4 py-2 border border-foreground/20 rounded-md font-medium hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        <span className="px-4 py-2 text-sm text-foreground/70">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <button
        onClick={() => updatePage(currentPage + 1)}
        disabled={!hasNextPage}
        className="px-4 py-2 border border-foreground/20 rounded-md font-medium hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}

