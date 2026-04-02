# Pixel Desktop Group Intro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pixel-art fantasy OS desktop web app where a small group of friends can add self-introductions that appear as clickable desktop icons opening draggable windows.

**Architecture:** Next.js App Router with API routes for a REST backend, Turso (hosted SQLite) for persistence, and a custom pixel CSS design system. Single-page experience — the desktop is the entire app.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, `@libsql/client` (Turso), CSS Modules, "Press Start 2P" font, Vercel deployment.

**Spec:** `docs/superpowers/specs/2026-04-02-pixel-desktop-intros-design.md`

---

## File Structure

```
group-intro/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout — loads Press Start 2P font, global styles
│   │   ├── page.tsx            # Main page — renders <Desktop />
│   │   ├── globals.css         # Global CSS — reset, pixel font, CSS variables for palette
│   │   └── api/
│   │       └── intros/
│   │           └── route.ts    # GET and POST /api/intros
│   ├── components/
│   │   ├── Desktop.tsx         # Full-screen desktop: wallpaper, icon grid, windows, taskbar
│   │   ├── Desktop.module.css
│   │   ├── Taskbar.tsx         # Bottom bar: OS name, clock, "New" button
│   │   ├── Taskbar.module.css
│   │   ├── DesktopIcon.tsx     # Single icon + name label
│   │   ├── DesktopIcon.module.css
│   │   ├── Window.tsx          # Draggable window shell: title bar, close, content slot
│   │   ├── Window.module.css
│   │   ├── IntroView.tsx       # Window content: avatar, name, bio, links, freeform
│   │   ├── IntroView.module.css
│   │   ├── IntroForm.tsx       # Submission form: all fields + submit
│   │   ├── IntroForm.module.css
│   │   ├── IconPicker.tsx      # Grid of pixel icon presets
│   │   ├── IconPicker.module.css
│   │   ├── ColorPicker.tsx     # Accent color palette grid
│   │   └── ColorPicker.module.css
│   ├── lib/
│   │   ├── db.ts               # Turso client singleton + schema init
│   │   ├── validation.ts       # Shared validation logic for intro fields
│   │   └── types.ts            # TypeScript types: Intro, IntroInput, etc.
│   └── data/
│       ├── icons.ts            # Pixel icon preset definitions (name, SVG/pixel data)
│       └── colors.ts           # Accent color palette definitions
├── public/
│   └── icons/                  # Pixel icon sprite PNGs (32x32)
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local                  # TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
```

---

### Task 1: Project Scaffolding & Turso Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.env.local`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/lib/db.ts`, `src/lib/types.ts`

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest . --typescript --app --src-dir --no-tailwind --no-eslint --import-alias "@/*"
```

Accept defaults. This creates the scaffolding.

- [ ] **Step 2: Install dependencies**

```bash
npm install @libsql/client
```

- [ ] **Step 3: Create `.env.local`**

```env
TURSO_DATABASE_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

(Developer fills in real values from Turso dashboard)

- [ ] **Step 4: Create `src/lib/types.ts`**

```typescript
export interface Intro {
  id: number;
  name: string;
  icon: string;
  avatar: string | null;
  bio: string | null;
  links: string | null; // JSON string of {label: string, url: string}[]
  freeform: string | null;
  color: string | null;
  created_at: string;
}

export interface IntroInput {
  name: string;
  icon?: string;
  avatar?: string | null;
  bio?: string | null;
  links?: { label: string; url: string }[];
  freeform?: string | null;
  color?: string | null;
}

export interface LinkItem {
  label: string;
  url: string;
}
```

- [ ] **Step 5: Create `src/lib/db.ts`**

```typescript
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS intros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'folder',
      avatar TEXT,
      bio TEXT,
      links TEXT,
      freeform TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function rowToIntro(row: Record<string, unknown>): Intro {
  return {
    id: row.id as number,
    name: row.name as string,
    icon: row.icon as string,
    avatar: (row.avatar as string) || null,
    bio: (row.bio as string) || null,
    links: (row.links as string) || null,
    freeform: (row.freeform as string) || null,
    color: (row.color as string) || null,
    created_at: row.created_at as string,
  };
}

export default db;
```

- [ ] **Step 6: Update `src/app/layout.tsx` with Press Start 2P font**

```tsx
import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "PixelDesk — Group Intro",
  description: "A pixel-art desktop where friends introduce themselves",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={pixelFont.variable}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create `src/app/globals.css` with pixel design system variables**

```css
:root {
  --font-pixel: "Press Start 2P", monospace;

  /* Fantasy OS palette — 16 colors */
  --color-bg: #1a1a2e;
  --color-surface: #2d2d44;
  --color-surface-light: #3d3d5c;
  --color-border-light: #5a5a8a;
  --color-border-dark: #12121f;
  --color-text: #e0e0f0;
  --color-text-muted: #8888aa;
  --color-shadow: rgba(0, 0, 0, 0.5);

  /* Accent palette (user-selectable for window title bars) */
  --accent-coral: #ff6b6b;
  --accent-gold: #ffd93d;
  --accent-mint: #6bcb77;
  --accent-sky: #4d96ff;
  --accent-lavender: #b088f9;
  --accent-peach: #ff9a76;
  --accent-cyan: #00d2d3;
  --accent-pink: #ff6b9d;
  --accent-lime: #c7f464;
  --accent-default: #5a5a8a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: var(--font-pixel);
  background: var(--color-bg);
  color: var(--color-text);
  image-rendering: pixelated;
}
```

- [ ] **Step 8: Verify the app runs**

```bash
npm run dev
```

Visit `http://localhost:3000` — should show the default page with pixel font applied.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Turso client and pixel design system"
```

---

### Task 2: Validation Logic

**Files:**
- Create: `src/lib/validation.ts`

- [ ] **Step 1: Create `src/lib/validation.ts`**

```typescript
import { IntroInput } from "./types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateIntroInput(input: unknown): {
  data: IntroInput | null;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return { data: null, errors: [{ field: "body", message: "Invalid request body" }] };
  }

  const body = input as Record<string, unknown>;

  // Name: required, ≤ 50 chars
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (body.name.length > 50) {
    errors.push({ field: "name", message: "Name must be 50 characters or less" });
  }

  // Bio: optional, ≤ 280 chars
  if (body.bio !== undefined && body.bio !== null) {
    if (typeof body.bio !== "string" || body.bio.length > 280) {
      errors.push({ field: "bio", message: "Bio must be 280 characters or less" });
    }
  }

  // Freeform: optional, ≤ 2000 chars
  if (body.freeform !== undefined && body.freeform !== null) {
    if (typeof body.freeform !== "string" || body.freeform.length > 2000) {
      errors.push({ field: "freeform", message: "Freeform must be 2000 characters or less" });
    }
  }

  // Links: optional, max 5, each label ≤ 50, URL ≤ 500
  if (body.links !== undefined && body.links !== null) {
    if (!Array.isArray(body.links)) {
      errors.push({ field: "links", message: "Links must be an array" });
    } else if (body.links.length > 5) {
      errors.push({ field: "links", message: "Maximum 5 links allowed" });
    } else {
      for (let i = 0; i < body.links.length; i++) {
        const link = body.links[i];
        if (!link.label || typeof link.label !== "string" || link.label.length > 50) {
          errors.push({ field: `links[${i}].label`, message: "Link label must be 1-50 characters" });
        }
        if (!link.url || typeof link.url !== "string" || link.url.length > 500) {
          errors.push({ field: `links[${i}].url`, message: "Link URL must be 1-500 characters" });
        }
      }
    }
  }

  // Avatar: optional, base64, ≤ 270KB
  if (body.avatar !== undefined && body.avatar !== null) {
    if (typeof body.avatar !== "string") {
      errors.push({ field: "avatar", message: "Avatar must be a string" });
    } else if (body.avatar.length > 270 * 1024) {
      errors.push({ field: "avatar", message: "Avatar data must be under 270KB (encode a file under 200KB)" });
    }
  }

  // Icon: optional string
  if (body.icon !== undefined && body.icon !== null && typeof body.icon !== "string") {
    errors.push({ field: "icon", message: "Icon must be a string" });
  }

  // Color: optional hex string
  if (body.color !== undefined && body.color !== null) {
    if (typeof body.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.color)) {
      errors.push({ field: "color", message: "Color must be a valid hex color (e.g. #ff6b6b)" });
    }
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      name: (body.name as string).trim(),
      icon: (body.icon as string) || undefined,
      avatar: (body.avatar as string) || null,
      bio: (body.bio as string) || null,
      links: body.links as { label: string; url: string }[] | undefined,
      freeform: (body.freeform as string) || null,
      color: (body.color as string) || null,
    },
    errors: [],
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validation.ts
git commit -m "feat: add intro input validation logic"
```

---

### Task 3: API Routes

**Files:**
- Create: `src/app/api/intros/route.ts`

- [ ] **Step 1: Create `src/app/api/intros/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import db, { initDb, rowToIntro } from "@/lib/db";
import { validateIntroInput } from "@/lib/validation";

let initialized = false;

async function ensureDb() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
}

export async function GET() {
  await ensureDb();
  const result = await db.execute("SELECT * FROM intros ORDER BY created_at ASC");
  const intros = result.rows.map(rowToIntro);
  return NextResponse.json(intros);
}

export async function POST(request: NextRequest) {
  await ensureDb();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data, errors } = validateIntroInput(body);
  if (!data) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const linksJson = data.links ? JSON.stringify(data.links) : null;

  const result = await db.execute({
    sql: `INSERT INTO intros (name, icon, avatar, bio, links, freeform, color)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.name,
      data.icon || "folder",
      data.avatar || null,
      data.bio || null,
      linksJson,
      data.freeform || null,
      data.color || null,
    ],
  });

  const inserted = await db.execute({
    sql: "SELECT * FROM intros WHERE id = ?",
    args: [result.lastInsertRowid!],
  });

  const intro = rowToIntro(inserted.rows[0]);
  return NextResponse.json(intro, { status: 201 });
}
```

- [ ] **Step 2: Test the API manually**

```bash
npm run dev &
# In another terminal:
curl http://localhost:3000/api/intros
# Should return []

curl -X POST http://localhost:3000/api/intros \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "bio": "Hello!"}'
# Should return the created intro with id, created_at, etc.

curl http://localhost:3000/api/intros
# Should return [the created intro]
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/intros/route.ts
git commit -m "feat: add GET and POST API routes for intros"
```

---

### Task 4: Pixel Icon Presets

**Files:**
- Create: `src/data/icons.ts`
- Create: `public/icons/` (12 PNG files, 32x32 pixel art)

- [ ] **Step 1: Create `src/data/icons.ts`**

```typescript
export interface PixelIcon {
  id: string;
  label: string;
  src: string; // path in /public/icons/
}

export const PIXEL_ICONS: PixelIcon[] = [
  { id: "folder", label: "Folder", src: "/icons/folder.png" },
  { id: "floppy", label: "Floppy Disk", src: "/icons/floppy.png" },
  { id: "terminal", label: "Terminal", src: "/icons/terminal.png" },
  { id: "gameboy", label: "Gameboy", src: "/icons/gameboy.png" },
  { id: "cassette", label: "Cassette", src: "/icons/cassette.png" },
  { id: "star", label: "Star", src: "/icons/star.png" },
  { id: "skull", label: "Skull", src: "/icons/skull.png" },
  { id: "heart", label: "Heart", src: "/icons/heart.png" },
  { id: "potion", label: "Potion", src: "/icons/potion.png" },
  { id: "sword", label: "Sword", src: "/icons/sword.png" },
  { id: "gem", label: "Gem", src: "/icons/gem.png" },
  { id: "mushroom", label: "Mushroom", src: "/icons/mushroom.png" },
];

export const DEFAULT_ICON = "folder";

export function getIconById(id: string): PixelIcon {
  return PIXEL_ICONS.find((icon) => icon.id === id) || PIXEL_ICONS[0];
}
```

- [ ] **Step 2: Create pixel icon PNGs**

Create 12 pixel art icons at 32x32 as PNG files in `public/icons/`. These should be simple, recognizable pixel sprites with transparent backgrounds. Use the fantasy OS color palette.

Files to create: `folder.png`, `floppy.png`, `terminal.png`, `gameboy.png`, `cassette.png`, `star.png`, `skull.png`, `heart.png`, `potion.png`, `sword.png`, `gem.png`, `mushroom.png`.

For initial development, generate simple placeholder SVG-based icons or use inline pixel data. These can be replaced with polished art later.

- [ ] **Step 3: Commit**

```bash
git add src/data/icons.ts public/icons/
git commit -m "feat: add pixel icon presets and sprite assets"
```

---

### Task 5: Accent Color Palette

**Files:**
- Create: `src/data/colors.ts`

- [ ] **Step 1: Create `src/data/colors.ts`**

```typescript
export interface AccentColor {
  id: string;
  hex: string;
  label: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { id: "coral", hex: "#ff6b6b", label: "Coral" },
  { id: "gold", hex: "#ffd93d", label: "Gold" },
  { id: "mint", hex: "#6bcb77", label: "Mint" },
  { id: "sky", hex: "#4d96ff", label: "Sky" },
  { id: "lavender", hex: "#b088f9", label: "Lavender" },
  { id: "peach", hex: "#ff9a76", label: "Peach" },
  { id: "cyan", hex: "#00d2d3", label: "Cyan" },
  { id: "pink", hex: "#ff6b9d", label: "Pink" },
  { id: "lime", hex: "#c7f464", label: "Lime" },
];

export const DEFAULT_COLOR = "#5a5a8a";
```

- [ ] **Step 2: Commit**

```bash
git add src/data/colors.ts
git commit -m "feat: add accent color palette definitions"
```

---

### Task 6: Window Component (Draggable)

**Files:**
- Create: `src/components/Window.tsx`
- Create: `src/components/Window.module.css`

- [ ] **Step 1: Create `src/components/Window.module.css`**

```css
.window {
  position: absolute;
  width: 420px;
  min-height: 200px;
  background: var(--color-surface);
  border: 4px solid var(--color-border-light);
  border-right-color: var(--color-border-dark);
  border-bottom-color: var(--color-border-dark);
  box-shadow: 4px 4px 0 var(--color-shadow);
  display: flex;
  flex-direction: column;
  image-rendering: pixelated;
}

.titleBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  cursor: grab;
  user-select: none;
}

.titleBar:active {
  cursor: grabbing;
}

.titleText {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: #fff;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 30px);
}

.closeButton {
  background: none;
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  font-family: var(--font-pixel);
  font-size: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.closeButton:hover {
  background: rgba(255, 255, 255, 0.2);
}

.content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  max-height: 400px;
}
```

- [ ] **Step 2: Create `src/components/Window.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify Window renders**

Temporarily render a `<Window>` in `page.tsx` to confirm it displays and drags correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/Window.tsx src/components/Window.module.css
git commit -m "feat: add draggable pixel Window component"
```

---

### Task 7: DesktopIcon Component

**Files:**
- Create: `src/components/DesktopIcon.tsx`
- Create: `src/components/DesktopIcon.module.css`

- [ ] **Step 1: Create `src/components/DesktopIcon.module.css`**

```css
.icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 80px;
  padding: 8px 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: none;
}

.icon:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.iconImage {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
}

.label {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: var(--color-text);
  text-align: center;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.8);
  max-width: 76px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 2: Create `src/components/DesktopIcon.tsx`**

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DesktopIcon.tsx src/components/DesktopIcon.module.css
git commit -m "feat: add DesktopIcon component"
```

---

### Task 8: Taskbar Component

**Files:**
- Create: `src/components/Taskbar.tsx`
- Create: `src/components/Taskbar.module.css`

- [ ] **Step 1: Create `src/components/Taskbar.module.css`**

```css
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: var(--color-surface);
  border-top: 4px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 9999;
}

.logo {
  font-family: var(--font-pixel);
  font-size: 10px;
  color: var(--color-text);
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clock {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: var(--color-text-muted);
}

.newButton {
  font-family: var(--font-pixel);
  font-size: 8px;
  background: var(--color-surface-light);
  color: var(--color-text);
  border: 3px solid var(--color-border-light);
  border-right-color: var(--color-border-dark);
  border-bottom-color: var(--color-border-dark);
  padding: 4px 10px;
  cursor: pointer;
}

.newButton:hover {
  background: var(--color-border-light);
}

.newButton:active {
  border: 3px solid var(--color-border-dark);
  border-right-color: var(--color-border-light);
  border-bottom-color: var(--color-border-light);
}
```

- [ ] **Step 2: Create `src/components/Taskbar.tsx`**

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Taskbar.tsx src/components/Taskbar.module.css
git commit -m "feat: add Taskbar component with clock and New button"
```

---

### Task 9: IconPicker & ColorPicker Components

**Files:**
- Create: `src/components/IconPicker.tsx`, `src/components/IconPicker.module.css`
- Create: `src/components/ColorPicker.tsx`, `src/components/ColorPicker.module.css`

- [ ] **Step 1: Create `src/components/IconPicker.module.css`**

```css
.picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.option {
  width: 44px;
  height: 44px;
  padding: 4px;
  border: 2px solid transparent;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option:hover {
  border-color: var(--color-border-light);
}

.selected {
  border-color: var(--color-text);
  background: var(--color-surface-light);
}

.optionImage {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}
```

- [ ] **Step 2: Create `src/components/IconPicker.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `src/components/ColorPicker.module.css`**

```css
.picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.swatch {
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  cursor: pointer;
}

.swatch:hover {
  border-color: var(--color-text);
}

.selected {
  border-color: #fff;
  outline: 2px solid var(--color-border-dark);
}
```

- [ ] **Step 4: Create `src/components/ColorPicker.tsx`**

```tsx
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
```

- [ ] **Step 5: Commit**

```bash
git add src/components/IconPicker.tsx src/components/IconPicker.module.css src/components/ColorPicker.tsx src/components/ColorPicker.module.css
git commit -m "feat: add IconPicker and ColorPicker components"
```

---

### Task 10: IntroView Component

**Files:**
- Create: `src/components/IntroView.tsx`
- Create: `src/components/IntroView.module.css`

- [ ] **Step 1: Create `src/components/IntroView.module.css`**

```css
.intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
  border: 2px solid var(--color-border-light);
}

.name {
  font-family: var(--font-pixel);
  font-size: 14px;
}

.bio {
  font-family: var(--font-pixel);
  font-size: 8px;
  line-height: 1.6;
  color: var(--color-text);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.link {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: var(--color-text);
  background: var(--color-surface-light);
  border: 2px solid var(--color-border-light);
  border-right-color: var(--color-border-dark);
  border-bottom-color: var(--color-border-dark);
  padding: 4px 8px;
  text-decoration: none;
}

.link:hover {
  background: var(--color-border-light);
}

.freeform {
  font-family: var(--font-pixel);
  font-size: 8px;
  line-height: 1.6;
  color: var(--color-text-muted);
  white-space: pre-wrap;
  border-top: 2px solid var(--color-border-dark);
  padding-top: 10px;
}
```

- [ ] **Step 2: Create `src/components/IntroView.tsx`**

```tsx
import type { Intro, LinkItem } from "@/lib/types";
import styles from "./IntroView.module.css";

interface IntroViewProps {
  intro: Intro;
}

export default function IntroView({ intro }: IntroViewProps) {
  const links: LinkItem[] = intro.links ? JSON.parse(intro.links) : [];

  return (
    <div className={styles.intro}>
      {intro.avatar && (
        <img src={intro.avatar} alt={intro.name} className={styles.avatar} />
      )}
      <h2 className={styles.name}>{intro.name}</h2>
      {intro.bio && <p className={styles.bio}>{intro.bio}</p>}
      {links.length > 0 && (
        <div className={styles.links}>
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
      {intro.freeform && <p className={styles.freeform}>{intro.freeform}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/IntroView.tsx src/components/IntroView.module.css
git commit -m "feat: add IntroView component for displaying intro content"
```

---

### Task 11: IntroForm Component

**Files:**
- Create: `src/components/IntroForm.tsx`
- Create: `src/components/IntroForm.module.css`

- [ ] **Step 1: Create `src/components/IntroForm.module.css`**

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: var(--color-text-muted);
}

.input,
.textarea {
  font-family: var(--font-pixel);
  font-size: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  border: 2px solid var(--color-border-dark);
  border-right-color: var(--color-border-light);
  border-bottom-color: var(--color-border-light);
  padding: 6px 8px;
  outline: none;
}

.textarea {
  resize: vertical;
  min-height: 60px;
}

.input:focus,
.textarea:focus {
  border-color: var(--accent-sky);
}

.charCount {
  font-family: var(--font-pixel);
  font-size: 7px;
  color: var(--color-text-muted);
  text-align: right;
}

.linkRow {
  display: flex;
  gap: 4px;
  align-items: center;
}

.linkInput {
  flex: 1;
}

.removeLink {
  font-family: var(--font-pixel);
  font-size: 8px;
  background: none;
  border: none;
  color: var(--accent-coral);
  cursor: pointer;
  padding: 4px;
}

.addLink {
  font-family: var(--font-pixel);
  font-size: 8px;
  background: none;
  border: 2px solid var(--color-border-light);
  color: var(--color-text-muted);
  padding: 4px 8px;
  cursor: pointer;
}

.addLink:hover {
  color: var(--color-text);
}

.avatarPreview {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
  border: 2px solid var(--color-border-light);
}

.submitButton {
  font-family: var(--font-pixel);
  font-size: 10px;
  background: var(--color-surface-light);
  color: var(--color-text);
  border: 3px solid var(--color-border-light);
  border-right-color: var(--color-border-dark);
  border-bottom-color: var(--color-border-dark);
  padding: 8px 16px;
  cursor: pointer;
  align-self: flex-end;
}

.submitButton:hover {
  background: var(--color-border-light);
}

.submitButton:active {
  border: 3px solid var(--color-border-dark);
  border-right-color: var(--color-border-light);
  border-bottom-color: var(--color-border-light);
}

.submitButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  font-family: var(--font-pixel);
  font-size: 8px;
  color: var(--accent-coral);
}
```

- [ ] **Step 2: Create `src/components/IntroForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Intro, IntroInput } from "@/lib/types";
import IconPicker from "./IconPicker";
import ColorPicker from "./ColorPicker";
import { DEFAULT_COLOR } from "@/data/colors";
import styles from "./IntroForm.module.css";

interface IntroFormProps {
  onSubmit: (intro: Intro) => void;
}

export default function IntroForm({ onSubmit }: IntroFormProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("folder");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [freeform, setFreeform] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      setError("Avatar must be under 200KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    if (links.length >= 5) return;
    setLinks([...links, { label: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload: IntroInput = {
      name: name.trim(),
      icon,
      avatar,
      bio: bio.trim() || null,
      links: links.filter((l) => l.label.trim() && l.url.trim()),
      freeform: freeform.trim() || null,
      color,
    };

    try {
      const res = await fetch("/api/intros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.[0]?.message || "Something went wrong");
        return;
      }

      const intro: Intro = await res.json();
      onSubmit(intro);
    } catch {
      setError("Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>Name *</label>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
        />
        <span className={styles.charCount}>{name.length}/50</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Icon</label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Avatar (under 200KB)</label>
        {avatar && <img src={avatar} alt="Preview" className={styles.avatarPreview} />}
        <input type="file" accept="image/*" onChange={handleAvatarChange} className={styles.input} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Bio</label>
        <textarea
          className={styles.textarea}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
        />
        <span className={styles.charCount}>{bio.length}/280</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Links ({links.length}/5)</label>
        {links.map((link, i) => (
          <div key={i} className={styles.linkRow}>
            <input
              className={`${styles.input} ${styles.linkInput}`}
              placeholder="Label"
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              maxLength={50}
            />
            <input
              className={`${styles.input} ${styles.linkInput}`}
              placeholder="URL"
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              maxLength={500}
            />
            <button type="button" className={styles.removeLink} onClick={() => removeLink(i)}>
              X
            </button>
          </div>
        ))}
        {links.length < 5 && (
          <button type="button" className={styles.addLink} onClick={addLink}>
            + Add link
          </button>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Freeform</label>
        <textarea
          className={styles.textarea}
          value={freeform}
          onChange={(e) => setFreeform(e.target.value)}
          maxLength={2000}
          rows={4}
        />
        <span className={styles.charCount}>{freeform.length}/2000</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Window Color</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submitButton} disabled={submitting || !name.trim()}>
        {submitting ? "Saving..." : "Submit"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/IntroForm.tsx src/components/IntroForm.module.css
git commit -m "feat: add IntroForm component with all fields"
```

---

### Task 12: Desktop Component (Orchestrator)

**Files:**
- Create: `src/components/Desktop.tsx`
- Create: `src/components/Desktop.module.css`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create `src/components/Desktop.module.css`**

```css
.desktop {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 48px; /* space for taskbar */
  background: var(--color-bg);
}

/* Pixel starfield wallpaper pattern */
.desktop::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4), transparent),
    radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 90% 80%, rgba(255,255,255,0.4), transparent),
    radial-gradient(2px 2px at 20% 50%, rgba(255,255,255,0.15), transparent),
    radial-gradient(2px 2px at 60% 90%, rgba(255,255,255,0.15), transparent),
    radial-gradient(1px 1px at 80% 15%, rgba(255,255,255,0.3), transparent),
    radial-gradient(1px 1px at 15% 85%, rgba(255,255,255,0.35), transparent),
    radial-gradient(1px 1px at 45% 45%, rgba(255,255,255,0.25), transparent);
  pointer-events: none;
  z-index: 0;
}

.iconGrid {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  padding: 16px;
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 2: Create `src/components/Desktop.tsx`**

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import type { Intro } from "@/lib/types";
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import IntroView from "./IntroView";
import IntroForm from "./IntroForm";
import Taskbar from "./Taskbar";
import styles from "./Desktop.module.css";

interface OpenWindow {
  id: string;
  type: "intro" | "form";
  intro?: Intro;
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
                <IntroView intro={win.intro} />
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
          return null;
        })}
      </div>
      <Taskbar onNewClick={openFormWindow} />
    </>
  );
}
```

- [ ] **Step 3: Update `src/app/page.tsx` to fetch intros server-side and render Desktop**

```tsx
import db, { initDb, rowToIntro } from "@/lib/db";
import Desktop from "@/components/Desktop";

export const dynamic = "force-dynamic";

export default async function Home() {
  await initDb();
  const result = await db.execute("SELECT * FROM intros ORDER BY created_at ASC");
  const intros = result.rows.map(rowToIntro);

  return <Desktop initialIntros={intros} />;
}
```

- [ ] **Step 4: Run `npm run dev` and verify the full desktop experience**

- Open http://localhost:3000 — should see pixel desktop with starfield wallpaper and taskbar
- Click "+ New" — form window should open
- Fill out the form and submit — new icon should appear on desktop
- Click the new icon — intro window should open
- Drag windows — should move smoothly
- Click between windows — z-index stacking should work
- Close windows with X — should disappear

- [ ] **Step 5: Commit**

```bash
git add src/components/Desktop.tsx src/components/Desktop.module.css src/app/page.tsx
git commit -m "feat: add Desktop orchestrator with window management and data fetching"
```

---

### Task 13: Final Polish & Deployment Prep

**Files:**
- Modify: `next.config.ts` (if needed for image config)
- Verify: `.gitignore` includes `.env.local`

- [ ] **Step 1: Update `next.config.ts` for image handling**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // pixel art should not be optimized/blurred
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify `.gitignore` includes `.env.local`**

Ensure `.env.local` is in `.gitignore` (create-next-app should have added it).

- [ ] **Step 3: Run a full build to check for errors**

```bash
npm run build
```

Fix any TypeScript or build errors.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat: configure Next.js for pixel art images and finalize deployment setup"
```

- [ ] **Step 5: Deploy to Vercel**

```bash
npx vercel --prod
```

Set environment variables `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in the Vercel dashboard before deploying.
