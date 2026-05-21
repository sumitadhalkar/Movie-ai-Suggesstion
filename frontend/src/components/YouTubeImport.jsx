import { useState } from "react";
import styles from "./YouTubeImport.module.css";

export default function YouTubeImport({ googleToken, onImport }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");

  async function fetchLiked() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=LL&maxResults=50",
        { headers: { Authorization: `Bearer ${googleToken}` } }
      );
      if (!res.ok) throw new Error("Could not fetch liked videos");
      const data = await res.json();
      const items = (data.items || []).map((item) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        channel: item.snippet.videoOwnerChannelTitle,
        thumb: item.snippet.thumbnails?.default?.url,
      }));
      setVideos(items);
      setOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const titles = videos
      .filter((v) => selected.has(v.id))
      .map((v) => v.title)
      .join(", ");
    onImport(titles);
    setOpen(false);
    setSelected(new Set());
  }

  if (!googleToken) return null;

  return (
    <div className={styles.wrapper}>
      <button className={styles.triggerBtn} onClick={fetchLiked} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : "▶"}
        {loading ? "Loading…" : "Import from YouTube Likes"}
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Pick movies from your liked videos</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.list}>
            {videos.length === 0 && (
              <p className={styles.empty}>No liked videos found.</p>
            )}
            {videos.map((v) => (
              <label key={v.id} className={`${styles.item} ${selected.has(v.id) ? styles.itemSelected : ""}`}>
                <input
                  type="checkbox"
                  checked={selected.has(v.id)}
                  onChange={() => toggle(v.id)}
                  className={styles.checkbox}
                />
                {v.thumb && <img src={v.thumb} alt="" className={styles.thumb} />}
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitle}>{v.title}</span>
                  <span className={styles.itemChannel}>{v.channel}</span>
                </div>
              </label>
            ))}
          </div>

          {selected.size > 0 && (
            <div className={styles.panelFooter}>
              <button className={styles.addBtn} onClick={handleAdd}>
                Add {selected.size} to favourites
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
