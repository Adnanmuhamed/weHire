'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface DashboardReviewsProps {
  reviews: Review[];
  averageRating: number;
}

export default function DashboardReviews({ reviews, averageRating }: DashboardReviewsProps) {
  const [open, setOpen] = useState(false);

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-foreground/60">
        No reviews yet.
      </p>
    );
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < count ? 'fill-foreground text-foreground' : 'text-foreground/20'
        }`}
      />
    ));
  };

  const renderStarsLarge = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count ? 'fill-foreground text-foreground' : 'text-foreground/20'
        }`}
      />
    ));
  };

  return (
    <>
      <div className="mb-3">
        <p className="text-2xl font-bold text-foreground">
          {averageRating.toFixed(1)}/5
        </p>
        <p className="text-xs text-foreground/60">
          Average Rating ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </p>
      </div>
      
      <ul className="space-y-3">
        <li className="border-t border-foreground/10 pt-2">
          <div className="flex items-center gap-1 mb-1">
            {renderStars(reviews[0].rating)}
          </div>
          <p className="text-xs text-foreground/80 line-clamp-2">
            {reviews[0].comment}
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            {new Date(reviews[0].createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </li>
      </ul>

      {reviews.length > 1 && (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:underline"
        >
          View all {reviews.length} reviews →
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 w-full max-w-md bg-background border border-foreground/10 rounded-xl shadow-xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-foreground/10 flex items-center justify-between sticky top-0 bg-background z-10 rounded-t-xl">
              <h2 className="text-lg font-bold">All Reviews</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground/60" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {reviews.map((review, idx) => (
                <div key={review.id} className="space-y-2">
                  {idx > 0 && <hr className="border-foreground/10 my-4" />}
                  <div className="flex items-center gap-1">
                    {renderStarsLarge(review.rating)}
                  </div>
                  <p className="text-sm text-foreground/80">
                    {review.comment}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
