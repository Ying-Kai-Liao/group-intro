"use client";

import { useState, useEffect } from "react";
import styles from "./Taskbar.module.css";

interface TaskbarProps {
  onNewClick: () => void;
}

export default function Taskbar({ onNewClick }: TaskbarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.taskbar}>
      <span className={styles.logo}>PixelDesk</span>
      <div className={styles.right}>
        <button className={styles.newButton} onClick={onNewClick}>
          + New
        </button>
        <span className={styles.clock}>{time}</span>
      </div>
    </div>
  );
}
