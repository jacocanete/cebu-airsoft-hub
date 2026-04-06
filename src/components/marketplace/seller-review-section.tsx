import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useSellerReviews, useCreateSellerReview } from "@/hooks/use-marketplace";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { SellerReview } from "@/types";

interface SellerReviewSectionProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40 hover:text-amber-400/60"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewRow({ review }: { review: SellerReview }) {
  const relativeDate = new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round(
      (new Date(review.createdAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
    "day",
  );

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-b-0">
      <UserAvatar
        name={review.reviewer.name}
        username={review.reviewer.username}
        size="sm"
        linkToProfile
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            to="/profile/$username"
            params={{ username: review.reviewer.username }}
            className="text-xs font-bold text-foreground hover:text-primary transition-colors"
          >
            {review.reviewer.name}
          </Link>
          <span className="text-[10px] text-muted-foreground shrink-0">{relativeDate}</span>
        </div>

        <div className="flex items-center gap-0.5 mb-1.5" aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3.5 w-3.5 ${
                star <= review.rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {review.comment && (
          <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  );
}

function WriteReviewForm({
  listingId,
  onSuccess,
}: {
  listingId: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { mutate, isPending } = useCreateSellerReview(listingId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Review submitted.");
          setRating(0);
          setComment("");
          onSuccess();
        },
        onError: (err) => {
          const msg =
            err instanceof Error ? err.message : "Failed to submit review.";
          toast.error(msg);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border pt-4 mt-4">
      <p className="label-military text-primary mb-3">Leave a Review</p>

      <div className="mb-3">
        <label className="text-xs text-muted-foreground block mb-1.5">
          Rating <span className="text-primary">*</span>
        </label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="mb-3">
        <label htmlFor="review-comment" className="text-xs text-muted-foreground block mb-1.5">
          Comment <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Describe your experience with this seller…"
          className="w-full resize-none rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="rounded bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50 glow-red"
      >
        {isPending ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

export function SellerReviewSection({
  listingId,
  sellerId,
  sellerName,
}: SellerReviewSectionProps) {
  const { data: reviews = [], isLoading } = useSellerReviews(listingId);
  const { data: session } = useCurrentUser();
  const requireAuth = useRequireAuth();
  const [showForm, setShowForm] = useState(false);

  const isOwner = session?.user?.id === sellerId;
  const canReview = !!session?.user && !isOwner;

  // Check if current user has already reviewed for this listing
  const hasReviewed = reviews.some((r) => r.reviewerId === session?.user?.id);

  function handleWriteReview() {
    requireAuth(() => setShowForm(true));
  }

  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="label-military text-primary mb-0.5">Operator Reviews</p>
          <h2 className="text-base font-bold uppercase tracking-tight text-foreground">
            {sellerName}
          </h2>
        </div>

        {canReview && !hasReviewed && !showForm && (
          <button
            onClick={handleWriteReview}
            className="label-military text-muted-foreground hover:text-primary transition-colors"
          >
            Write a review
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-muted/30" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No reviews yet for this operator.
        </p>
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </div>
      )}

      {showForm && canReview && !hasReviewed && (
        <WriteReviewForm
          listingId={listingId}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {hasReviewed && (
        <p className="text-xs text-muted-foreground border-t border-border pt-3 mt-3">
          You have already reviewed this operator for this listing.
        </p>
      )}
    </div>
  );
}
