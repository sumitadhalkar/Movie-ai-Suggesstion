import { useState, useEffect } from "react";
import StarRating from "./StarRating.jsx";
import styles from "./ReviewSection.module.css";

function storageKey(title, year) {
  return `cinematch_review_${title}_${year}`.replace(/\s+/g, "_");
}

export default function ReviewSection({ title, year }) {
  const key = storageKey(title, year);
  const saved = JSON.parse(localStorage.getItem(key) || "null");

  const [rating, setRating] = useState(saved?.rating || 0);
  const [note, setNote] = useState(saved?.note || "");
  const [editing, setEditing] = useState(!saved);
  const [saved_, setSaved_] = useState(!!saved);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem(key) || "null");
    if (s) { setRating(s.rating); setNote(s.note); setEditing(false); setSaved_(true); }
  }, [key]);

  function handleSave() {
    if (!rating) return;
    localStorage.setItem(key, JSON.stringify({ rating, note }));
    setSaved_(true);
    setEditing(false);
  }

  function handleEdit() {
    setEditing(true);
    setSaved_(false);
  }

  function handleClear() {
    localStorage.removeItem(key);
    setRating(0);
    setNote("");
    setEditing(true);
    setSaved_(false);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <span className={styles.label}>Your rating</span>
        <StarRating value={rating} onChange={setRating} readonly={!editing} />
        {saved_ && !editing && (
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={handleEdit}>Edit</button>
            <button className={styles.actionBtn} onClick={handleClear}>Clear</button>
          </div>
        )}
      </div>

      {editing && (
        <>
          <textarea
            className={styles.noteInput}
            placeholder="Add a note… (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!rating}
          >
            Save review
          </button>
        </>
      )}

      {!editing && note && (
        <p className={styles.savedNote}>"{note}"</p>
      )}
    </div>
  );
}
