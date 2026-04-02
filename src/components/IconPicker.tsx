"use client";

import Image from "next/image";
import { PIXEL_ICONS } from "@/data/icons";
import styles from "./IconPicker.module.css";

interface IconPickerProps {
  value: string;
  onChange: (iconId: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className={styles.picker}>
      {PIXEL_ICONS.map((icon) => (
        <button
          key={icon.id}
          type="button"
          className={`${styles.option} ${value === icon.id ? styles.selected : ""}`}
          onClick={() => onChange(icon.id)}
          title={icon.label}
        >
          <Image
            src={icon.src}
            alt={icon.label}
            width={32}
            height={32}
            className={styles.optionImage}
          />
        </button>
      ))}
    </div>
  );
}
