"use client";

import { ACCENT_COLORS } from "@/data/colors";
import styles from "./ColorPicker.module.css";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className={styles.picker}>
      {ACCENT_COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          className={`${styles.swatch} ${value === color.hex ? styles.selected : ""}`}
          style={{ background: color.hex }}
          onClick={() => onChange(color.hex)}
          title={color.label}
        />
      ))}
    </div>
  );
}
