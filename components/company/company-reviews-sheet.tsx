'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addCompanyReview } from '@/app/actions/company-public';

interface Review {
  id: string;
  rating: number;
  reviewerRole: string | null;
  employmentStatus: string | null;
  pros: string | null;
  cons: string | null;
  createdAt: Date;
}

interface CompanyReviewsSheetProps {
  companyId: string;
  companyName: string;
  ratingCount: number;
  averageRating: number | null;
  reviews: Review[];
}

export default function CompanyReviewsSheet({
  companyId,
  companyName,
  ratingCount,
  averageRating,
  reviews,
}: CompanyReviewsSheetProps) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rating, setRating] = useState(5);
  const [reviewerRole, setReviewerRole] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('Current Employee');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerRole.trim() || !pros.trim() || !cons.trim()) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    const result = await addCompanyReview({
      companyId,
      rating,
      reviewerRole,
      employmentStatus,
      pros,
      cons,
    });

    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Review submitted successfully!');
      setShowForm(false);
      // reset form
      setRating(5);
      setReviewerRole('');
      setPros('');
      setCons('');
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count ? 'fill-yellow-400 text-yellow-400' : 'fill-foreground/10 text-foreground/10'
        }`}
      />
    ));
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 hover:bg-foreground/5 py-1 px-2 rounded transition-colors -ml-2"
      >
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium text-foreground">
          {averageRating !== null && averageRating > 0 ? averageRating.toFixed(1) : 'New'}
        </span>
        <span className="text-foreground/60 text-sm">
          ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="relative z-50 w-full max-w-xl h-full bg-background border-l border-foreground/10 shadow-xl overflow-y-auto flex flex-col pt-16 sm:pt-0">
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between sticky top-0 bg-background z-10">
              <h2 className="text-2xl font-bold">{companyName} Reviews</h2>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground/60" />
              </button>
            </div>

            <div className="p-6 flex-1">
              {!showForm ? (
                <div className="space-y-6">
                  <button 
                    className="w-full bg-foreground text-background py-2.5 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                    onClick={() => setShowForm(true)}
                  >
                    Write a Review
                  </button>

                  <div className="space-y-6 mt-6">
                    {reviews.length === 0 ? (
                      <p className="text-center text-foreground/60 py-8">
                        No reviews yet. Be the first to share your experience!
                      </p>
                    ) : (
                      reviews.map((review, idx) => (
                        <div key={review.id} className="space-y-3">
                          {idx > 0 && <hr className="border-foreground/10 my-6" />}
                          
                          <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                          
                          <p className="text-sm text-foreground/60 font-medium">
                            {review.reviewerRole || 'Anonymous'} • {review.employmentStatus || 'Unknown'}
                          </p>
                          
                          {review.pros && (
                            <div className="flex items-start gap-2 text-sm text-foreground/80 bg-green-500/10 p-3 rounded-md">
                              <ThumbsUp className="w-4 h-4 text-green-600 mt-0.5" />
                              <p>{review.pros}</p>
                            </div>
                          )}
                          
                          {review.cons && (
                            <div className="flex items-start gap-2 text-sm text-foreground/80 bg-red-500/10 p-3 rounded-md">
                              <ThumbsDown className="w-4 h-4 text-red-600 mt-0.5" />
                              <p>{review.cons}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-20">
                  <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                    <h3 className="text-lg font-semibold">Write a Review</h3>
                    <button 
                      className="text-sm px-3 py-1.5 hover:bg-foreground/10 rounded-md transition-colors"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium leading-none">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setRating(idx)}
                            className="p-1 focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                idx <= rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-foreground/10 text-foreground/10'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium leading-none">Your Role at Company</label>
                      <input
                        id="role"
                        className="flex h-10 w-full rounded-md border border-input bg-background/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={reviewerRole}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviewerRole(e.target.value)}
                        placeholder="e.g. Backend Developer"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium leading-none">Employment Status</label>
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input 
                            type="radio" 
                            name="employmentStatus" 
                            value="Current Employee"
                            checked={employmentStatus === 'Current Employee'}
                            onChange={(e) => setEmploymentStatus(e.target.value)}
                            className="w-4 h-4 flex-shrink-0"
                          />
                          Current Employee
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input 
                            type="radio" 
                            name="employmentStatus" 
                            value="Former Employee"
                            checked={employmentStatus === 'Former Employee'}
                            onChange={(e) => setEmploymentStatus(e.target.value)}
                            className="w-4 h-4 flex-shrink-0"
                          />
                          Former Employee
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="pros" className="text-sm font-medium leading-none">Pros</label>
                      <textarea
                        id="pros"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={pros}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPros(e.target.value)}
                        placeholder="What are the best parts of working here?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="cons" className="text-sm font-medium leading-none">Cons</label>
                      <textarea
                        id="cons"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={cons}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCons(e.target.value)}
                        placeholder="What could be improved?"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-foreground text-background py-2.5 rounded-lg font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 mt-4" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
