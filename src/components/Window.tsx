"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import styles from "./Window.module.css";

interface WindowProps {
  title: string;
  accentColor?: string;
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
  initialX?: number;
  initialY?: number;
  children: React.ReactNode;
}

export default function Window({
  title,
  accentColor = "#5a5a8a",
  zIndex,
  onFocus,
  onClose,
  initialX = 100,
  initialY = 80,
  children,
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      onFocus();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: position.x,
        offsetY: position.y,
      };
    },
    [onFocus, position]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.offsetX + dx,
        y: dragRef.current.offsetY + dy,
      });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={windowRef}
      className={styles.window}
      style={{ left: position.x, top: position.y, zIndex }}
      onMouseDown={onFocus}
    >
      <div
        className={styles.titleBar}
        style={{ background: accentColor }}
        onMouseDown={handleMouseDown}
      >
        <span className={styles.titleText}>{title}</span>
        <button className={styles.closeButton} onClick={onClose}>
          X
        </button>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
