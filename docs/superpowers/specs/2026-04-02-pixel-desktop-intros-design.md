# Pixel Desktop Group Intro — Design Spec

## Overview

A web app styled as a custom pixel-art fantasy OS desktop. Friends/small group members add their self-introductions via a form, and each person appears as a clickable pixel icon on the desktop. Clicking an icon opens a draggable window showing that person's intro.

## Audience & Access

- Small friend group / team (~5-20 people)
- Anyone with the link can add themselves — no auth, no invite codes
- Trusted environment, no moderation needed

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Database | Turso (hosted SQLite) via `@libsql/client` |
| Styling | CSS (custom pixel design system) |
| Font | "Press Start 2P" (Google Fonts) |
| Deployment | Vercel |
| Avatar storage | Base64 in DB (images must be under 200KB before encoding; rejected at API layer if over limit) |

## Data Model

Single `intros` table:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | INTEGER | Yes | Auto-increment primary key |
| `name` | TEXT | Yes | Display name |
| `icon` | TEXT | No | Preset pixel icon identifier, defaults to "folder" |
| `avatar` | TEXT | No | Base64 encoded image or preset identifier |
| `bio` | TEXT | No | Max 280 chars, enforced server-side |
| `links` | TEXT | No | JSON string — array of `{label, url}`, max 5 links, label ≤ 50 chars, URL ≤ 500 chars |
| `freeform` | TEXT | No | Plain text (no markdown rendering), max 2000 chars |
| `color` | TEXT | No | Accent color hex for window title bar |
| `created_at` | DATETIME | Yes | Auto-set on insert |

## API Routes

- `GET /api/intros` — returns all intros as JSON array
- `POST /api/intros` — creates a new intro. Returns the created intro. Validation: name required (≤ 50 chars), bio ≤ 280 chars, freeform ≤ 2000 chars, max 5 links (label ≤ 50, URL ≤ 500), avatar base64 ≤ 270KB. Sanitize all text inputs.

## Desktop Experience

### Main Screen

- Full-screen pixel-art desktop
- Pixel wallpaper background (starfield, gradient dither, or tiled pixel pattern)
- Desktop icons arranged in a grid (left-to-right, top-to-bottom, auto-wrapping). If icons overflow the viewport, the desktop area scrolls vertically.
- Taskbar fixed at bottom

### Taskbar

- ~40px tall, pixel-styled
- Left: fantasy OS logo/name
- Right: pixel clock (current time)
- "New" button to open the intro submission form

### Desktop Icons

- 32x32 or 48x48 pixel art sprites
- ~10-15 preset options: folder, floppy disk, terminal, gameboy, cassette, star, skull, heart, etc.
- Person's name displayed underneath, truncated if long
- Hover: subtle highlight or bounce effect

### Windows

- Open when clicking a desktop icon
- Pixel-art window chrome: double-pixel inset/outset borders
- Title bar: person's name, colored with their chosen accent color
- Close [X] button, top right
- Drop shadow (2-4px offset, pixel-aligned)
- Draggable by title bar
- Multiple windows can be open simultaneously
- Click a window to bring it to front (z-index managed by a shared incrementing counter starting at 10; each focus or open increments and assigns)
- Fixed size (not resizable in MVP)

### Window Content (Intro View)

- Avatar (if provided) displayed at top
- Name as heading
- Bio text
- Links as clickable pixel-styled buttons/badges
- Freeform section below for personal expression

### Intro Form

- Opens as a pixel-art window on the desktop (not a separate page)
- Fields: name (text input), icon picker (grid of pixel presets), avatar (upload or preset), bio (textarea), links (add/remove label+url pairs), freeform (textarea), accent color (palette of ~8-10 colors)
- Submit button saves via POST /api/intros
- After a successful POST, append the returned intro record to client-side state — no full refetch needed

## Pixel Design System

### Typography

- "Press Start 2P" for all UI text
- 8-12px for body/labels, 14-16px for headings

### Color Palette

- Limited to 16-20 colors max
- Muted pastels + a few bold accents
- ~8-10 selectable accent colors for window title bars

### Visual Style

- Double-pixel borders (inset/outset)
- Pixel-aligned drop shadows
- No anti-aliasing — crisp pixel edges
- Custom fantasy OS aesthetic (not mimicking Windows 95 or Mac OS)

## React Component Structure

- `Desktop` — full-screen container, renders wallpaper, icons, taskbar, windows
- `Taskbar` — bottom bar with OS name, clock, "New" button
- `DesktopIcon` — single icon + name label, click handler
- `Window` — draggable window shell (title bar, close button, content area)
- `IntroView` — window content for viewing someone's intro
- `IntroForm` — window content for the submission form
- `IconPicker` — grid of pixel icon presets
- `ColorPicker` — palette grid for accent color selection

## Scope

### MVP

- Pixel desktop with wallpaper, taskbar, and auto-layout icon grid
- Clickable icons opening draggable, stackable windows
- Intro form as a window with all fields
- ~10-15 preset pixel icons to choose from
- API routes for save/fetch
- Turso SQLite database
- Vercel deployment

### Explicitly NOT in MVP

- No authentication or edit/delete
- No drag-to-rearrange desktop icons
- No resizable windows
- No sound effects
- No mobile-optimized layout
- No rate limiting / spam protection
- No rich text editor for freeform

### Nice-to-haves for Later

- Edit/delete with secret code
- Draggable desktop icon positions
- Window resize
- Pixel sound effects
- "Start menu" with extras / easter eggs
- Mobile responsive version
