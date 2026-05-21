import styles from "./StarRating.module.css";

export default function StarRating({ value, onChange, readonly }) {
  return (
    <div className={styles.stars} aria-label={`Rating: ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= value ? styles.filled : ""}`}
          onClick={() => !readonly && onChange(star)}
          disabled={readonly}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
