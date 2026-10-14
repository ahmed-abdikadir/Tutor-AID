"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import type { Review } from "@/app/api/reviews/route";

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((response) => response.ok ? response.json() as Promise<Review[]> : [])
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/reviews", { method: "POST", body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not submit your review.");
      setReviews((current) => [result.review as Review, ...current]);
      form.reset();
      setSelectedRating(0);
      setStatus("Thank you. Your review has been published.");
      setReviewFormOpen(false);
    } catch (error) {
      setStatus((error as Error).message || "We could not submit your review. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="testimonials__content">
      <div className="testimonial-list" aria-live="polite">
        {reviews.length ? reviews.map((review) => (
          <article className="testimonial-card" key={review.id}>
            <div className="testimonial-card__rating" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}<span>{"★".repeat(5 - review.rating)}</span></div>
            <blockquote>“{review.note}”</blockquote>
            {review.image && <div className="testimonial-card__image"><Image src={review.image} alt={`Suit shared by ${review.name}`} fill sizes="(max-width: 700px) 90vw, 260px" /></div>}
            <p className="testimonial-card__name">{review.name}</p>
          </article>
        )) : (
          <article className="testimonial-card testimonial-card--empty">
            <span className="testimonial-card__mark" aria-hidden="true">“</span>
            <h3>Your story belongs here.</h3>
            <p>Have you worn a Kiin suit? Share your experience with our community.</p>
          </article>
        )}
      </div>

      <div className="review-form-toggle">
        <button
          className="btn"
          type="button"
          aria-expanded={reviewFormOpen}
          aria-controls="review-form"
          onClick={() => { setReviewFormOpen((open) => !open); setStatus(""); }}
        >
          {reviewFormOpen ? "Close review form" : "Leave a review"}
        </button>
        <p className="review-form__status" role="status" aria-live="polite">{status}</p>
      </div>

      <div id="review-form" hidden={!reviewFormOpen}>
      {reviewFormOpen && <form className="review-form" onSubmit={onSubmit}>
        <div className="review-form__heading">
          <p className="eyebrow">Your experience</p>
          <h3>Leave a review</h3>
          <p>Your note and any photo you choose to share will appear in the testimonials above.</p>
        </div>

        <label className="review-form__label">Your name
          <input name="name" maxLength={80} autoComplete="name" required />
        </label>

        <fieldset className="review-rating">
          <legend>Your rating</legend>
          <div className="review-rating__options">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating}>
                <input type="radio" name="rating" value={rating} required onChange={() => setSelectedRating(rating)} />
                <span className={rating <= selectedRating ? "selected" : ""}>
                <span aria-hidden="true">★</span>
                <span className="sr-only">{rating} {rating === 1 ? "star" : "stars"}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="review-form__label">Your personal note
          <textarea name="note" rows={5} maxLength={1500} placeholder="Tell us about your suit and how it felt to wear…" required />
        </label>

        <label className="review-form__label">Photo <span>(optional)</span>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
          <small>JPG, PNG or WebP, up to 5 MB.</small>
        </label>

        <label className="review-consent"><input name="hasWornSuit" type="checkbox" required /> I have worn a Kiin Clothline suit.</label>
        <label className="review-consent"><input name="consent" type="checkbox" required /> I agree to publish my review and any photo I upload on the Kiin Clothline website.</label>

        <button type="submit" className="btn" disabled={sending}>{sending ? "Submitting…" : "Share your review"}</button>
      </form>}
      </div>
    </div>
  );
}
