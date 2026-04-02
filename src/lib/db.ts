import { createClient } from "@libsql/client";
import type { Intro } from "./types";

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
      email TEXT,
      password_hash TEXT,
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

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default db;
