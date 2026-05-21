import { useEffect, useRef } from "react";
import styles from "./ThinkingStream.module.css";

export default function ThinkingStream({ text }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.pulse} />
        Gemini is thinking…
      </div>
      <div className={styles.stream} ref={containerRef}>
        <span className={styles.text}>{text || "Analysing your taste…"}</span>
        <span className={styles.cursor} />
      </div>
    </div>
  );
}
