'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { addReview } from '@/app/actions/employer-application';

interface RateCandidateButtonProps {
  candidateId: string;
  candidateName: string;
}

export default function RateCandidateButton({
  candidateId,
  candidateName,
}: RateCandidateButtonProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setLoading(true);
    const result = await addReview({
      candidateId,
      rating,
      comment: comment.trim(),
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Review submitted successfully');
    setModalOpen(false);
    setRating(0);
    setComment('');
    router.refresh();
  };

  const handleClose = () => {
    setModalOpen(false);
    setRating(0);
    setHoverRating(0);
    setComment('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90"
      >
        <Star className="w-4 h-4" />
        Rate Candidate
      </button>

      {modalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-background border border-foreground/10 rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-foreground/10">
                <h3 className="text-lg font-semibold text-foreground">
                  Rate {candidateName}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 hover:bg-foreground/10 rounded-md"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              starValue <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-foreground/20'
                            }`}
                          />
                        </button>
                      );
                    })}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-foreground/70">
                        {rating}/5
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Review Comment *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-foreground/20 rounded-md bg-background text-foreground"
                    placeholder="Share your experience working with this candidate..."
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading || rating === 0}
                    className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Submitting…' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium border border-foreground/20 rounded-md text-foreground hover:bg-foreground/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
