import { NextRequest, NextResponse } from "next/server";
import db, { initDb, hashPassword } from "@/lib/db";

let initialized = false;
async function ensureDb() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
}

export async function POST(request: NextRequest) {
  await ensureDb();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, password } = body as Record<string, unknown>;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
  }

  const result = await db.execute({
    sql: "SELECT id, intro_id, expires_at FROM password_reset_tokens WHERE token = ?",
    args: [token],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const row = result.rows[0] as Record<string, unknown>;
  const expiresAt = new Date(row.expires_at as string);

  if (expiresAt < new Date()) {
    await db.execute({
      sql: "DELETE FROM password_reset_tokens WHERE token = ?",
      args: [token],
    });
    return NextResponse.json({ error: "Token has expired" }, { status: 400 });
  }

  const introId = row.intro_id as number;
  const newHash = await hashPassword(password);

  await db.execute({
    sql: "UPDATE intros SET password_hash = ? WHERE id = ?",
    args: [newHash, introId],
  });

  await db.execute({
    sql: "DELETE FROM password_reset_tokens WHERE token = ?",
    args: [token],
  });

  return NextResponse.json({ ok: true });
}
