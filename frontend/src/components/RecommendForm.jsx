import { useState } from "react";
import styles from "./RecommendForm.module.css";

const MOODS = [
  { value: "thrilled", label: "Thrilled", emoji: "⚡" },
  { value: "contemplative", label: "Contemplative", emoji: "🌙" },
  { value: "adventurous", label: "Adventurous", emoji: "🗺️" },
  { value: "emotional", label: "Emotional", emoji: "💫" },
  { value: "tense", label: "Tense", emoji: "🔪" },
  { value: "inspired", label: "Inspired", emoji: "✨" },
  { value: "nostalgic", label: "Nostalgic", emoji: "📼" },
  { value: "lighthearted", label: "Lighthearted", emoji: "😄" },
];

const GENRES = ["Any","Action","Drama","Thriller","Sci-Fi","Horror","Comedy","Romance","Mystery","Animation","Fantasy","Crime","Documentary"];

export default function RecommendForm({ onSubmit, loading }) {
  const [favoriteMovies, setFavoriteMovies] = useState("");
  const [mood, setMood] = useState("");
  const [genre, setGenre] = useState("Any");

  function handleSubmit(e) {
    e.preventDefault();
    if (!favoriteMovies.trim() || !mood) return;
    onSubmit({ favoriteMovies: favoriteMovies.trim(), mood, genre });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.heroText}>
        <h1 className={styles.headline}>
          Discover your next<br />
          <span className={styles.accent}>favourite film.</span>
        </h1>
        <p className={styles.sub}>Tell us what you love and your mood — AI does the rest.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Movies you love</label>
          <textarea
            className={styles.textarea}
            placeholder="e.g. Inception, Interstellar, Blade Runner 2049…"
            value={favoriteMovies}
            onChange={(e) => setFavoriteMovies(e.target.value)}
            rows={3}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label className={styles.label}>Your mood right now</label>
            <div className={styles.moodGrid}>
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`${styles.moodBtn} ${mood === m.value ? styles.moodActive : ""}`}
                  onClick={() => setMood(m.value)}
                  disabled={loading}
                >
                  <span className={styles.emoji}>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label className={styles.label}>Preferred genre</label>
            <div className={styles.genreGrid}>
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`${styles.genreBtn} ${genre === g ? styles.genreActive : ""}`}
                  onClick={() => setGenre(g)}
                  disabled={loading}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!favoriteMovies.trim() || !mood || loading}
        >
          {loading ? (
            <><span className={styles.spinner} /> Finding your films…</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
              Get Recommendations
            </>
          )}
        </button>
      </form>
    </div>
  );
}
