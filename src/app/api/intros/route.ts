import { NextRequest, NextResponse } from "next/server";
import db, { initDb, rowToIntro, hashPassword } from "@/lib/db";
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
  const passwordHash = data.password ? await hashPassword(data.password) : null;

  const result = await db.execute({
    sql: `INSERT INTO intros (name, icon, avatar, bio, links, freeform, color, email, password_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.name,
      data.icon || "folder",
      data.avatar || null,
      data.bio || null,
      linksJson,
      data.freeform || null,
      data.color || null,
      data.email || null,
      passwordHash,
    ],
  });

  const inserted = await db.execute({
    sql: "SELECT * FROM intros WHERE id = ?",
    args: [result.lastInsertRowid!],
  });

  const intro = rowToIntro(inserted.rows[0]);
  return NextResponse.json(intro, { status: 201 });
}
