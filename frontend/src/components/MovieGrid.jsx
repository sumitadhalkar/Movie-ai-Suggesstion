import MoviePoster from "./MoviePoster.jsx";
import styles from "./MovieGrid.module.css";

export default function MovieGrid({ movies, onLoadMore, loadingMore }) {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h3 className={styles.title}>More You'll Love</h3>
        <span className={styles.count}>{movies.length} films</span>
      </div>

      <div className={styles.grid}>
        {movies.map((movie, i) => (
          <MoviePoster key={`${movie.title}-${movie.year}`} movie={movie} index={i} />
        ))}
      </div>

      <div className={styles.moreWrap}>
        <button
          className={styles.moreBtn}
          onClick={onLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <><span className={styles.spinner} /> Finding more…</>
          ) : (
            "+ Load 5 more suggestions"
          )}
        </button>
      </div>
    </section>
  );
}
