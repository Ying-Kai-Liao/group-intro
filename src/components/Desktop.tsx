"use client";

import { useState, useCallback, useRef } from "react";
import type { Intro } from "@/lib/types";
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import IntroView from "./IntroView";
import IntroForm from "./IntroForm";
import BrowserWindow from "./BrowserWindow";
import Taskbar from "./Taskbar";
import styles from "./Desktop.module.css";

interface OpenWindow {
  id: string;
  type: "intro" | "form" | "browser";
  intro?: Intro;
  browserUrl?: string;
  browserLabel?: string;
  zIndex: number;
  x: number;
  y: number;
}

interface DesktopProps {
  initialIntros: Intro[];
}

export default function Desktop({ initialIntros }: DesktopProps) {
  const [intros, setIntros] = useState<Intro[]>(initialIntros);
  const [windows, setWindows] = useState<OpenWindow[]>([]);
  const zCounter = useRef(10);

  const nextZ = () => {
    zCounter.current += 1;
    return zCounter.current;
  };

  const openIntroWindow = useCallback(
    (intro: Intro) => {
      const existing = windows.find((w) => w.id === `intro-${intro.id}`);
      if (existing) {
        // Focus existing window
        setWindows((prev) =>
          prev.map((w) =>
            w.id === existing.id ? { ...w, zIndex: nextZ() } : w
          )
        );
        return;
      }

      // Offset new windows slightly so they don't stack exactly
      const offset = (windows.length % 8) * 24;
      setWindows((prev) => [
        ...prev,
        {
          id: `intro-${intro.id}`,
          type: "intro",
          intro,
          zIndex: nextZ(),
          x: 120 + offset,
          y: 60 + offset,
        },
      ]);
    },
    [windows]
  );

  const openFormWindow = useCallback(() => {
    const existing = windows.find((w) => w.id === "form");
    if (existing) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === "form" ? { ...w, zIndex: nextZ() } : w
        )
      );
      return;
    }

    setWindows((prev) => [
      ...prev,
      {
        id: "form",
        type: "form",
        zIndex: nextZ(),
        x: 160,
        y: 40,
      },
    ]);
  }, [windows]);

  const openBrowserWindow = useCallback((url: string, label: string) => {
    const windowId = `browser-${url}`;
    const existing = windows.find((w) => w.id === windowId);
    if (existing) {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextZ() } : w))
      );
      return;
    }
    const offset = (windows.length % 8) * 24;
    setWindows((prev) => [
      ...prev,
      {
        id: windowId,
        type: "browser",
        browserUrl: url,
        browserLabel: label,
        zIndex: nextZ(),
        x: 140 + offset,
        y: 50 + offset,
      },
    ]);
  }, [windows]);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ() } : w))
    );
  }, []);

  const handleNewIntro = useCallback((intro: Intro) => {
    setIntros((prev) => [...prev, intro]);
    closeWindow("form");
  }, [closeWindow]);

  const handleDeleteIntro = useCallback((id: number) => {
    setIntros((prev) => prev.filter((intro) => intro.id !== id));
    closeWindow(`intro-${id}`);
  }, [closeWindow]);

  const handleUpdateIntro = useCallback((updated: Intro) => {
    setIntros((prev) =>
      prev.map((intro) => (intro.id === updated.id ? updated : intro))
    );
    setWindows((prev) =>
      prev.map((w) =>
        w.id === `intro-${updated.id}` ? { ...w, intro: updated } : w
      )
    );
  }, []);

  return (
    <>
      <div className={styles.desktop}>
        <div className={styles.iconGrid}>
          {intros.map((intro) => (
            <DesktopIcon
              key={intro.id}
              iconId={intro.icon}
              name={intro.name}
              onClick={() => openIntroWindow(intro)}
            />
          ))}
        </div>

        {windows.map((win) => {
          if (win.type === "intro" && win.intro) {
            return (
              <Window
                key={win.id}
                title={win.intro.name}
                accentColor={win.intro.color || undefined}
                zIndex={win.zIndex}
                onFocus={() => focusWindow(win.id)}
                onClose={() => closeWindow(win.id)}
                initialX={win.x}
                initialY={win.y}
              >
                <IntroView
                  intro={win.intro}
                  onOpenLink={openBrowserWindow}
                  onDelete={handleDeleteIntro}
                  onUpdate={handleUpdateIntro}
                />
              </Window>
            );
          }
          if (win.type === "form") {
            return (
              <Window
                key={win.id}
                title="Add Yourself"
                zIndex={win.zIndex}
                onFocus={() => focusWindow(win.id)}
                onClose={() => closeWindow(win.id)}
                initialX={win.x}
                initialY={win.y}
              >
                <IntroForm onSubmit={handleNewIntro} />
              </Window>
            );
          }
          if (win.type === "browser" && win.browserUrl) {
            return (
              <Window
                key={win.id}
                title={win.browserLabel || win.browserUrl}
                zIndex={win.zIndex}
                onFocus={() => focusWindow(win.id)}
                onClose={() => closeWindow(win.id)}
                initialX={win.x}
                initialY={win.y}
              >
                <BrowserWindow url={win.browserUrl} label={win.browserLabel || win.browserUrl} />
              </Window>
            );
          }
          return null;
        })}
      </div>
      <Taskbar onNewClick={openFormWindow} />
    </>
  );
}
