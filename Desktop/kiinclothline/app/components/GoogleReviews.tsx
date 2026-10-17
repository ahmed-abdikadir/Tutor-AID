"use client";

import { useEffect, useState } from "react";

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url?: string;
}

interface GoogleReviewsProps {
  placeId?: string;
  apiKey?: string;
}

export default function GoogleReviews({ placeId, apiKey }: GoogleReviewsProps) {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!placeId || !apiKey) {
      setLoading(false);
      return;
    }

    async function fetchGoogleReviews() {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,reviews&key=${apiKey}`
        );
        const data = await response.json();

        if (data.status === "OK" && data.result) {
          setReviews(data.result.reviews || []);
          setRating(data.result.rating || null);
          setTotalReviews(data.result.user_ratings_total || null);
        } else {
          setError("Could not load Google reviews");
        }
      } catch (err) {
        setError("Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    }

    fetchGoogleReviews();
  }, [placeId, apiKey]);

  if (!placeId || !apiKey) {
    return (
      <div className="google-reviews-placeholder">
        <p>To display Google Reviews, add your Google Business Place ID and API key to the site configuration.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="google-reviews-loading">Loading Google reviews...</div>;
  }

  if (error) {
    return <div className="google-reviews-error">{error}</div>;
  }

  return (
    <div className="google-reviews">
      <div className="google-reviews__header">
        <div className="google-reviews__rating">
          <span className="google-reviews__stars">{"★".repeat(rating || 0)}</span>
          <span className="google-reviews__score">{rating?.toFixed(1)}</span>
          <span className="google-reviews__count">({totalReviews} reviews)</span>
        </div>
        <a
          href={`https://search.google.com/local/writereview?placeid=${placeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--small"
        >
          Write a review on Google
        </a>
      </div>

      {reviews.length > 0 && (
        <div className="google-reviews__list">
          {reviews.slice(0, 6).map((review, index) => (
            <article className="google-review-card" key={index}>
              <div className="google-review-card__header">
                {review.profile_photo_url && (
                  <img
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    className="google-review-card__avatar"
                  />
                )}
                <div className="google-review-card__meta">
                  <p className="google-review-card__author">{review.author_name}</p>
                  <div className="google-review-card__rating" aria-label={`${review.rating} out of 5 stars`}>
                    {"★".repeat(review.rating)}
                    <span aria-hidden="true">{"★".repeat(5 - review.rating)}</span>
                  </div>
                </div>
              </div>
              {review.text && (
                <blockquote className="google-review-card__text">"{review.text}"</blockquote>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="google-reviews__footer">
        <a
          href={`https://search.google.com/local/writereview?placeid=${placeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="google-reviews__link"
        >
          View all reviews on Google ↗
        </a>
      </div>
    </div>
  );
}
