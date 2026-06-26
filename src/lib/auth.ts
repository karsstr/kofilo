// =============================================================
// Auth Helpers — MVP Session Simulation
// TODO: Ganti dengan NextAuth.js / Auth.js untuk production
// =============================================================

import { Role } from "@prisma/client";
import { cookies } from "next/headers";

// ─── Type Definitions ───────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: Role;
}

// ─── Cookie Keys ─────────────────────────────────────────────

const SESSION_COOKIE = "pos_session";

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Ambil session dari cookie (Server Component / Route Handler).
 * TODO: Ganti dengan JWT verification atau NextAuth getServerSession()
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;

    // Support both base64-encoded dan raw JSON (untuk backward compatibility)
    let session: SessionUser;
    if (raw.startsWith("{") || raw.startsWith("[")) {
      session = JSON.parse(raw);
    } else {
      session = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
    }
    return session as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Serialize session ke base64 string (simulasi — ganti dengan JWT di production)
 */
export function serializeSession(user: SessionUser): string {
  // TODO: Ganti dengan JWT signing menggunakan AUTH_SECRET
  return Buffer.from(JSON.stringify(user)).toString("base64");
}

/**
 * Cek apakah user memiliki role tertentu
 */
export function hasRole(user: SessionUser | null, ...roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
