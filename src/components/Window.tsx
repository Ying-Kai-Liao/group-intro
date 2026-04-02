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

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      onFocus();
      dragRef.current = {
        startX: clientX,
        startY: clientY,
        offsetX: position.x,
        offsetY: position.y,
      };
    },
    [onFocus, position]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => startDrag(e.clientX, e.clientY),
    [startDrag]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    },
    [startDrag]
  );

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!dragRef.current) return;
      const dx = clientX - dragRef.current.startX;
      const dy = clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.offsetX + dx,
        y: dragRef.current.offsetY + dy,
      });
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current) return;
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleEnd = () => { dragRef.current = null; };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, []);

  return (
    <div
      ref={windowRef}
      className={styles.window}
      style={{ left: position.x, top: position.y, zIndex }}
      onMouseDown={onFocus}
      onTouchStart={onFocus}
    >
      <div
        className={styles.titleBar}
        style={{ background: accentColor }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
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
