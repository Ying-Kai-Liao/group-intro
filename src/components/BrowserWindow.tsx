"use client";

import { useState } from "react";
import styles from "./BrowserWindow.module.css";

interface BrowserWindowProps {
  url: string;
  label: string;
}

export default function BrowserWindow({ url, label }: BrowserWindowProps) {
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className={styles.browser}>
      <div className={styles.addressBar}>
        <span className={styles.urlText}>{url}</span>
      </div>
      {!iframeError ? (
        <iframe
          src={url}
          className={styles.frame}
          sandbox="allow-scripts allow-same-origin allow-popups"
          onError={() => setIframeError(true)}
          title={label}
        />
      ) : null}
      <div className={styles.fallback}>
        <p className={styles.fallbackText}>
          {iframeError ? "This site can't be embedded." : "If the page doesn't load:"}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.openButton}
        >
          Open &ldquo;{label}&rdquo; in New Tab
        </a>
      </div>
    </div>
  );
}
