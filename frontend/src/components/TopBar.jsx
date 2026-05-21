import styles from "./TopBar.module.css";

export default function TopBar({ onNewSearch, hasResults }) {
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        {hasResults ? (
          <button className={styles.newSearchBtn} onClick={onNewSearch}>
            ← New Search
          </button>
        ) : (
          <div className={styles.appName}>
            <span className={styles.appNameAccent}>MOVIE</span> AI
          </div>
        )}
      </div>
    </header>
  );
}
