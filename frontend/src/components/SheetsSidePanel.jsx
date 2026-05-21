import { useState, useEffect } from "react";
import GoogleAuth from "./GoogleAuth.jsx";
import styles from "./SheetsSidePanel.module.css";

const SHEET_ID_KEY = "cinematch_sheet_id";
const HISTORY_KEY = "cinematch_history";
const HEADERS = ["Date","Favourite Movies","Mood","Genre","Title","Year","Director","Hidden Gem","Tags","Why You'll Love It"];

export default function SheetsSidePanel({ googleToken, setGoogleToken, userInfo, setUserInfo, movies, query }) {
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | saving | saved | error
  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem(SHEET_ID_KEY + "_url") || "");
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));

  useEffect(() => {
    setSheetUrl(localStorage.getItem(SHEET_ID_KEY + "_url") || "");
  }, []);

  async function handleSync() {
    if (!googleToken) return;
    setSyncStatus("saving");

    try {
      let spreadsheetId = localStorage.getItem(SHEET_ID_KEY);

      if (!spreadsheetId) {
        const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
          method: "POST",
          headers: { Authorization: `Bearer ${googleToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ properties: { title: "CineMatch AI — Movie Suggestions" }, sheets: [{ properties: { title: "Suggestions" } }] }),
        });
        const sheet = await res.json();
        spreadsheetId = sheet.spreadsheetId;
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
        localStorage.setItem(SHEET_ID_KEY, spreadsheetId);
        localStorage.setItem(SHEET_ID_KEY + "_url", url);
        setSheetUrl(url);
        await appendRows(googleToken, spreadsheetId, [HEADERS]);
      }

      const date = new Date().toLocaleDateString();
      const rows = movies.map((m) => [
        date, query?.favoriteMovies || "", query?.mood || "", query?.genre || "",
        m.title, m.year, m.director, m.isHiddenGem ? "Yes" : "No",
        (m.matchTags || []).join(", "), m.whyYoullLoveIt,
      ]);

      await appendRows(googleToken, spreadsheetId, rows);

      const entry = { date, mood: query?.mood, genre: query?.genre, count: movies.length };
      const newHistory = [entry, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      setSyncStatus("saved");
    } catch (err) {
      console.error(err);
      setSyncStatus("error");
    }
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Google Sheets</p>

        {!googleToken ? (
          <div className={styles.connectBox}>
            <SheetsIcon />
            <p className={styles.connectText}>Connect Google to save your movie suggestions to a spreadsheet.</p>
            <GoogleAuth token={googleToken} setToken={setGoogleToken} userInfo={userInfo} setUserInfo={setUserInfo} compact />
          </div>
        ) : (
          <div className={styles.syncBox}>
            {userInfo && (
              <div className={styles.userRow}>
                {userInfo.picture && <img src={userInfo.picture} className={styles.avatar} alt="" referrerPolicy="no-referrer" />}
                <span className={styles.userName}>{userInfo.given_name || userInfo.name}</span>
              </div>
            )}

            {syncStatus === "saved" ? (
              <div className={styles.savedRow}>
                <span className={styles.savedTick}>✓</span>
                <span className={styles.savedText}>{movies.length} films saved</span>
                {sheetUrl && (
                  <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className={styles.openLink}>
                    Open ↗
                  </a>
                )}
              </div>
            ) : (
              <button className={styles.syncBtn} onClick={handleSync} disabled={syncStatus === "saving" || !movies.length}>
                {syncStatus === "saving" ? (
                  <><span className={styles.spinner} /> Saving…</>
                ) : (
                  <><SheetsIcon small /> Save {movies.length} suggestions</>
                )}
              </button>
            )}

            {syncStatus === "error" && <p className={styles.errorText}>Save failed — try again</p>}

            {sheetUrl && syncStatus !== "saved" && (
              <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className={styles.viewSheet}>
                View spreadsheet ↗
              </a>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Saved Sessions</p>
          <div className={styles.historyList}>
            {history.map((h, i) => (
              <div key={i} className={styles.historyItem}>
                <div className={styles.historyMeta}>
                  <span className={styles.historyDate}>{h.date}</span>
                  <span className={styles.historyCount}>{h.count} films</span>
                </div>
                <p className={styles.historyDetail}>{h.mood} · {h.genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Stats</p>
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{history.reduce((a, h) => a + h.count, 0)}</span>
            <span className={styles.statLabel}>Films saved</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{history.length}</span>
            <span className={styles.statLabel}>Sessions</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

async function appendRows(token, id, rows) {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Suggestions!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values: rows }) }
  );
}

function SheetsIcon({ small }) {
  const s = small ? 14 : 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#34A853" opacity="0.2"/>
      <path d="M3 9h18M3 15h18M9 3v18" stroke="#34A853" strokeWidth="1.8"/>
    </svg>
  );
}
