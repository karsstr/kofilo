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

    // Gunakan atob (bawaan web) untuk decode base64
    const session = JSON.parse(atob(raw));
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
