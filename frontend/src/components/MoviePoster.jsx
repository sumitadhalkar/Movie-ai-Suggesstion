import { useState } from "react";
import StarRating from "./StarRating.jsx";
import ReviewSection from "./ReviewSection.jsx";
import { genreGradient } from "../utils/genreGradient.js";
import styles from "./MoviePoster.module.css";

export default function MoviePoster({ movie, index }) {
  const [showReview, setShowReview] = useState(false);

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className={styles.poster} style={{ background: genreGradient(movie.genre) }}>
        <div className={styles.overlay} />
        {movie.isHiddenGem && (
          <span className={styles.gem}>💎</span>
        )}
        <div className={styles.playIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div className={styles.yearBadge}>{movie.year}</div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{movie.title}</h3>
        <p className={styles.meta}>{movie.genre} · {movie.director}</p>

        <div className={styles.ratingRow}>
          <StarRating value={0} onChange={() => {}} />
          <button
            className={styles.reviewBtn}
            onClick={() => setShowReview((v) => !v)}
            title="Write review"
          >
            {showReview ? "▲" : "✎"}
          </button>
        </div>

        <div className={styles.tags}>
          {movie.matchTags?.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>

        {showReview && <ReviewSection title={movie.title} year={movie.year} />}
      </div>
    </article>
  );
}
