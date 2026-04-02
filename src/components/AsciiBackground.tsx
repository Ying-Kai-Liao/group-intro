"use client";

import { useEffect, useRef } from "react";

const CHARS = "01{}[]<>/\\|#@$%&*~^=+-.,:;!?ABCDEFabcdef";
const COLUMN_WIDTH = 18;
const FONT_SIZE = 14;

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let columns: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const colCount = Math.ceil(canvas.width / COLUMN_WIDTH);
      // Preserve existing drop positions, fill new columns randomly
      const newColumns = Array.from({ length: colCount }, (_, i) =>
        columns[i] ?? Math.random() * -100
      );
      columns = newColumns;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      // Semi-transparent overlay to create trail effect
      ctx.fillStyle = "rgba(26, 26, 46, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px "SF Mono", "Fira Code", monospace`;

      for (let i = 0; i < columns.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * COLUMN_WIDTH;
        const y = columns[i] * FONT_SIZE;

        // Vary brightness per character
        const brightness = Math.random();
        if (brightness > 0.7) {
          ctx.fillStyle = "rgba(90, 90, 138, 0.35)"; // bright — border-light color
        } else if (brightness > 0.3) {
          ctx.fillStyle = "rgba(61, 61, 92, 0.3)"; // mid — surface-light
        } else {
          ctx.fillStyle = "rgba(45, 45, 68, 0.25)"; // dim — surface
        }

        ctx.fillText(char, x, y);

        // Reset column to top when it goes off screen, with randomness
        if (y > canvas.height && Math.random() > 0.98) {
          columns[i] = 0;
        }
        columns[i] += 0.3 + Math.random() * 0.2; // slow fall
      }

      animationId = requestAnimationFrame(draw);
    };

    // Initial fill with background color
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
