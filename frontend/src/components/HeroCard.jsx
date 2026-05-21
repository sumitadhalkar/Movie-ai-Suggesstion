import { useState } from "react";
import StarRating from "./StarRating.jsx";
import ReviewSection from "./ReviewSection.jsx";
import { genreGradient } from "../utils/genreGradient.js";
import styles from "./HeroCard.module.css";

export default function HeroCard({ movie }) {
  const [showReview, setShowReview] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.poster} style={{ background: genreGradient(movie.genre) }}>
        <div className={styles.posterOverlay} />
        <div className={styles.posterContent}>
          {movie.isHiddenGem && <span className={styles.gemBadge}>💎 Hidden Gem</span>}
          <div className={styles.playBtn}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.infoTop}>
          <div className={styles.tags}>
            {movie.matchTags?.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
          <span className={styles.rank}>① Featured Pick</span>
        </div>

        <h2 className={styles.title}>{movie.title}</h2>

        <div className={styles.meta}>
          <span className={styles.year}>{movie.year}</span>
          <span className={styles.dot}>·</span>
          <span>{movie.genre}</span>
          <span className={styles.dot}>·</span>
          <span>dir. {movie.director}</span>
        </div>

        <p className={styles.why}>{movie.whyYoullLoveIt}</p>

        <div className={styles.footer}>
          <StarRating value={0} onChange={() => {}} />
          <button
            className={styles.reviewToggle}
            onClick={() => setShowReview((v) => !v)}
          >
            {showReview ? "Hide review" : "Write a review"}
          </button>
        </div>

        {showReview && (
          <div className={styles.reviewWrap}>
            <ReviewSection title={movie.title} year={movie.year} />
          </div>
        )}
      </div>
    </div>
  );
}
