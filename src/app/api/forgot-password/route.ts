import { NextRequest, NextResponse } from "next/server";
import db, { initDb } from "@/lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

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

  const email = (body as Record<string, unknown>).email as string | undefined;
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const result = await db.execute({
    sql: "SELECT id, name FROM intros WHERE email = ? LIMIT 1",
    args: [email],
  });

  // Always return success to prevent email enumeration
  if (result.rows.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const row = result.rows[0] as Record<string, unknown>;
  const introId = row.id as number;
  const introName = row.name as string;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await db.execute({
    sql: "DELETE FROM password_reset_tokens WHERE intro_id = ?",
    args: [introId],
  });

  await db.execute({
    sql: "INSERT INTO password_reset_tokens (intro_id, token, expires_at) VALUES (?, ?, ?)",
    args: [introId, token, expiresAt],
  });

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const resetUrl = `${origin}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: email,
    subject: "Reset your Group Intro password",
    html: `
      <p>Hi ${introName},</p>
      <p>You requested a password reset for your Group Intro entry.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
