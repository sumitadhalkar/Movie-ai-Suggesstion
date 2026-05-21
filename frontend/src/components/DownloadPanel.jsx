import { useState } from "react";
import styles from "./DownloadPanel.module.css";

export default function DownloadPanel({ movies, query }) {
  const [copied, setCopied] = useState(false);

  function downloadCSV() {
    const headers = ["Title", "Year", "Genre", "Director", "Hidden Gem", "Tags", "Why You'll Love It", "Favourite Movies", "Mood", "Date"];
    const rows = movies.map((m) => [
      m.title,
      m.year,
      m.genre,
      m.director,
      m.isHiddenGem ? "Yes" : "No",
      (m.matchTags || []).join(" | "),
      m.whyYoullLoveIt,
      query?.favoriteMovies || "",
      query?.mood || "",
      new Date().toLocaleDateString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movieai-${query?.mood || "picks"}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadJSON() {
    const data = {
      generatedAt: new Date().toISOString(),
      query: { favoriteMovies: query?.favoriteMovies, mood: query?.mood, genre: query?.genre },
      recommendations: movies,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movieai-${query?.mood || "picks"}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyText() {
    const lines = movies.map((m, i) =>
      `${i + 1}. ${m.title} (${m.year})\n   ${m.genre} · dir. ${m.director}\n   ${m.whyYoullLoveIt}`
    ).join("\n\n");

    const full = `MOVIE AI — Recommendations\nMood: ${query?.mood} | Genre: ${query?.genre}\n\n${lines}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hiddenGems = movies.filter((m) => m.isHiddenGem).length;
  const genres = [...new Set(movies.map((m) => m.genre))];

  return (
    <aside className={styles.panel}>
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Export</p>
        <p className={styles.hint}>Download your picks to open in Google Sheets, Excel, or Notion.</p>

        <div className={styles.btnStack}>
          <button className={styles.primaryBtn} onClick={downloadCSV}>
            <CSVIcon />
            Download CSV
          </button>
          <button className={styles.secondaryBtn} onClick={downloadJSON}>
            <JSONIcon />
            Download JSON
          </button>
          <button className={`${styles.secondaryBtn} ${copied ? styles.copied : ""}`} onClick={copyText}>
            {copied ? "✓ Copied!" : <><CopyIcon /> Copy as text</>}
          </button>
        </div>

        <p className={styles.sheetsTip}>
          💡 Open Google Sheets → File → Import → upload the CSV
        </p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Summary</p>
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{movies.length}</span>
            <span className={styles.statLabel}>Films</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{hiddenGems}</span>
            <span className={styles.statLabel}>Hidden Gems</span>
          </div>
        </div>
        <div className={styles.genreList}>
          {genres.map((g) => (
            <span key={g} className={styles.genreChip}>{g}</span>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Your Picks</p>
        <div className={styles.movieList}>
          {movies.map((m, i) => (
            <div key={`${m.title}-${i}`} className={styles.movieRow}>
              <span className={styles.movieNum}>{i + 1}</span>
              <div className={styles.movieInfo}>
                <span className={styles.movieTitle}>{m.title}</span>
                <span className={styles.movieYear}>{m.year}</span>
              </div>
              {m.isHiddenGem && <span className={styles.gem} title="Hidden Gem">💎</span>}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function CSVIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  );
}

function JSONIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}
