"use client";

import Image from "next/image";
import { getIconById } from "@/data/icons";
import styles from "./DesktopIcon.module.css";

interface DesktopIconProps {
  iconId: string;
  name: string;
  onClick: () => void;
}

export default function DesktopIcon({ iconId, name, onClick }: DesktopIconProps) {
  const icon = getIconById(iconId);

  return (
    <button className={styles.icon} onClick={onClick} title={name}>
      <Image
        src={icon.src}
        alt={icon.label}
        width={48}
        height={48}
        className={styles.iconImage}
      />
      <span className={styles.label}>{name}</span>
    </button>
  );
}
