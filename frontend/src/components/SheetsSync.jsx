import { useState } from "react";
import styles from "./SheetsSync.module.css";

const SHEET_ID_KEY = "cinematch_sheet_id";
const HEADERS = ["Date", "Favourite Movies", "Mood", "Genre", "Title", "Year", "Director", "Hidden Gem", "Tags", "Why You'll Love It"];

export default function SheetsSync({ googleToken, movies, query }) {
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem(SHEET_ID_KEY + "_url") || "");

  async function saveToSheets() {
    setStatus("saving");
    try {
      let spreadsheetId = localStorage.getItem(SHEET_ID_KEY);

      if (!spreadsheetId) {
        const created = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: { title: "CineMatch AI — Recommendations" },
            sheets: [{ properties: { title: "Recommendations" } }],
          }),
        });
        const sheet = await created.json();
        spreadsheetId = sheet.spreadsheetId;
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
        localStorage.setItem(SHEET_ID_KEY, spreadsheetId);
        localStorage.setItem(SHEET_ID_KEY + "_url", url);
        setSheetUrl(url);

        // Write header row
        await appendRows(googleToken, spreadsheetId, [HEADERS]);
      }

      const date = new Date().toLocaleDateString();
      const rows = movies.map((m) => [
        date,
        query?.favoriteMovies || "",
        query?.mood || "",
        query?.genre || "",
        m.title,
        m.year,
        m.director,
        m.isHiddenGem ? "Yes" : "No",
        (m.matchTags || []).join(", "),
        m.whyYoullLoveIt,
      ]);

      await appendRows(googleToken, spreadsheetId, rows);
      setStatus("saved");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  if (!googleToken) return null;

  return (
    <div className={styles.wrapper}>
      {status === "saved" ? (
        <div className={styles.saved}>
          ✓ Saved to Sheets
          {sheetUrl && (
            <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
              Open Sheet ↗
            </a>
          )}
        </div>
      ) : (
        <button
          className={styles.btn}
          onClick={saveToSheets}
          disabled={status === "saving"}
        >
          {status === "saving" ? (
            <><span className={styles.spinner} /> Saving…</>
          ) : (
            <><SheetsIcon /> Save to Google Sheets</>
          )}
        </button>
      )}
      {status === "error" && <span className={styles.error}>Failed to save</span>}
    </div>
  );
}

async function appendRows(token, spreadsheetId, rows) {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Recommendations!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    }
  );
}

function SheetsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#34A853" opacity="0.2"/>
      <path d="M3 9h18M3 15h18M9 3v18" stroke="#34A853" strokeWidth="1.8"/>
    </svg>
  );
}
