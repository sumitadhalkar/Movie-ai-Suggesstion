import { useState, useRef } from "react";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import RecommendForm from "./components/RecommendForm.jsx";
import ThinkingStream from "./components/ThinkingStream.jsx";
import HeroCard from "./components/HeroCard.jsx";
import MovieGrid from "./components/MovieGrid.jsx";
import DownloadPanel from "./components/DownloadPanel.jsx";
import styles from "./App.module.css";

export default function App() {
  const [nav, setNav] = useState("home");
  const [movies, setMovies] = useState([]);
  const [streamText, setStreamText] = useState("");
  const [status, setStatus] = useState("idle");
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastQuery, setLastQuery] = useState(null);
  const abortRef = useRef(null);

  async function fetchMovies({ favoriteMovies, mood, genre, excludeTitles = [], append = false }) {
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favoriteMovies, mood, genre, excludeTitles }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Request failed");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop();
      for (const part of parts) {
        if (!part.startsWith("data: ")) continue;
        try {
          const payload = JSON.parse(part.slice(6));
          if (payload.chunk && !append) setStreamText((prev) => prev + payload.chunk);
          if (payload.done) {
            const incoming = payload.movies || [];
            setMovies((prev) => append ? [...prev, ...incoming] : incoming);
          }
        } catch {}
      }
    }
  }

  async function handleSubmit({ favoriteMovies, mood, genre }) {
    if (abortRef.current) abortRef.current.abort();
    setMovies([]);
    setStreamText("");
    setErrorMsg("");
    setStatus("loading");
    setLastQuery({ favoriteMovies, mood, genre });

    try {
      await fetchMovies({ favoriteMovies, mood, genre });
      setStatus("done");
    } catch (err) {
      if (err.name === "AbortError") return;
      setErrorMsg(err.message || "Something went wrong.");
      setStatus("error");
    }
  }

  async function handleLoadMore() {
    if (!lastQuery) return;
    setLoadingMore(true);
    try {
      await fetchMovies({ ...lastQuery, excludeTitles: movies.map((m) => m.title), append: true });
    } catch (err) {
      if (err.name !== "AbortError") setErrorMsg(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  function handleNewSearch() {
    if (abortRef.current) abortRef.current.abort();
    setMovies([]);
    setStreamText("");
    setErrorMsg("");
    setStatus("idle");
  }

  const hasResults = status === "done" && movies.length > 0;

  return (
    <div className={styles.shell}>
      <Sidebar active={nav} onChange={setNav} />

      <div className={styles.body}>
        <TopBar onNewSearch={handleNewSearch} hasResults={hasResults} />

        <div className={styles.content}>
          <main className={styles.main}>
            {status === "idle" && <RecommendForm onSubmit={handleSubmit} loading={false} />}

            {status === "loading" && (
              <div className={styles.loadingWrap}>
                <ThinkingStream text={streamText} />
              </div>
            )}

            {status === "error" && (
              <div className={styles.errorWrap}>
                <div className={styles.errorBox}>
                  <span>⚠</span>
                  <div>
                    <p className={styles.errorTitle}>Something went wrong</p>
                    <p className={styles.errorMsg}>{errorMsg}</p>
                  </div>
                  <button className={styles.retryBtn} onClick={handleNewSearch}>Try again</button>
                </div>
              </div>
            )}

            {hasResults && (
              <div className={styles.results}>
                <div className={styles.resultsHeader}>
                  <h2 className={styles.nowShowing}>Now Showing</h2>
                  <span className={styles.queryChip}>{lastQuery?.mood} · {lastQuery?.genre}</span>
                </div>
                <HeroCard movie={movies[0]} />
                {movies.length > 1 && (
                  <MovieGrid
                    movies={movies.slice(1)}
                    onLoadMore={handleLoadMore}
                    loadingMore={loadingMore}
                  />
                )}
              </div>
            )}
          </main>

          {hasResults && (
            <DownloadPanel movies={movies} query={lastQuery} />
          )}
        </div>
      </div>
    </div>
  );
}
