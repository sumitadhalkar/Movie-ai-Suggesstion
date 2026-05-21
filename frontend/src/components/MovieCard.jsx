import { useState } from "react";
import ReviewSection from "./ReviewSection.jsx";
import styles from "./MovieCard.module.css";

export default function MovieCard({ movie, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className={styles.card} style={{ animationDelay: `${index * 0.08}s` }}>
      <div className={styles.top}>
        <div className={styles.rank}>{index + 1}</div>

        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{movie.title}</h3>
            <span className={styles.year}>{movie.year}</span>
            {movie.isHiddenGem && (
              <span className={styles.gem}>💎 Hidden Gem</span>
            )}
          </div>

          <div className={styles.meta}>
            <span>{movie.genre}</span>
            <span className={styles.dot}>·</span>
            <span>dir. {movie.director}</span>
          </div>

          <div className={styles.tags}>
            {movie.matchTags?.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>

        <button
          className={styles.toggle}
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse" : "Why you'll love it"}
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {expanded && (
        <div className={styles.body}>
          <p className={styles.why}>
            <span className={styles.whyLabel}>Why you'll love it — </span>
            {movie.whyYoullLoveIt}
          </p>
        </div>
      )}

      <ReviewSection title={movie.title} year={movie.year} />
    </article>
  );
}
