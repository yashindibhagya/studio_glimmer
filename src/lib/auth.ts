import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "@/lib/session";

export async function getAdmin() {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

// Simple in-memory brute-force protection (per server instance).
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export function isLockedOut(key: string) {
  const a = attempts.get(key);
  return Boolean(a && a.count >= MAX_ATTEMPTS && a.until > Date.now());
}

function recordFailure(key: string) {
  const a = attempts.get(key);
  const fresh = !a || a.until < Date.now();
  attempts.set(key, { count: fresh ? 1 : a.count + 1, until: Date.now() + LOCK_MS });
}

export async function checkCredentials(email: string, password: string, key: string) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !hash) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD_HASH must be set.");
  }
  // Always run bcrypt so response time doesn't reveal whether the email matched.
  const passwordOk = await bcrypt.compare(password, hash);
  const ok = passwordOk && email.trim().toLowerCase() === adminEmail;
  if (ok) attempts.delete(key);
  else recordFailure(key);
  return ok;
}

export async function startSession(email: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
