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

async function verifyAuth(
  id: string,
  email: string,
  password: string
): Promise<{ ok: boolean; notFound?: boolean }> {
  const result = await db.execute({
    sql: "SELECT email, password_hash FROM intros WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return { ok: false, notFound: true };
  }

  const row = result.rows[0] as Record<string, unknown>;
  const storedEmail = row.email as string | null;
  const storedHash = row.password_hash as string | null;

  if (!storedEmail || !storedHash) {
    // No credentials set — cannot authenticate
    return { ok: false };
  }

  const providedHash = await hashPassword(password);
  const emailMatch = storedEmail === email;
  const hashMatch = storedHash === providedHash;

  return { ok: emailMatch && hashMatch };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDb();

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bodyRecord = body as Record<string, unknown>;
  const email = bodyRecord.email as string | undefined;
  const password = bodyRecord.password as string | undefined;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 401 }
    );
  }

  const auth = await verifyAuth(id, email, password);
  if (auth.notFound) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!auth.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const { data, errors } = validateIntroInput(body);
  if (!data) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const linksJson = data.links ? JSON.stringify(data.links) : null;

  await db.execute({
    sql: `UPDATE intros
          SET name = ?, icon = ?, avatar = ?, bio = ?, links = ?, freeform = ?, color = ?
          WHERE id = ?`,
    args: [
      data.name,
      data.icon || "folder",
      data.avatar || null,
      data.bio || null,
      linksJson,
      data.freeform || null,
      data.color || null,
      id,
    ],
  });

  const updated = await db.execute({
    sql: "SELECT * FROM intros WHERE id = ?",
    args: [id],
  });

  const intro = rowToIntro(updated.rows[0] as Record<string, unknown>);
  return NextResponse.json(intro);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDb();

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bodyRecord = body as Record<string, unknown>;
  const email = bodyRecord.email as string | undefined;
  const password = bodyRecord.password as string | undefined;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 401 }
    );
  }

  const auth = await verifyAuth(id, email, password);
  if (auth.notFound) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!auth.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await db.execute({
    sql: "DELETE FROM intros WHERE id = ?",
    args: [id],
  });

  return new NextResponse(null, { status: 204 });
}
