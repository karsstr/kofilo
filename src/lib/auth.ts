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
    if (!raw) {
      console.log("[getSession] No cookie found");
      return null;
    }

    console.log("[getSession] Raw cookie value:", raw);
    
    // Cookie stored as plain JSON string
    const parsed = JSON.parse(raw) as SessionUser;
    console.log("[getSession] Parsed session:", parsed);
    return parsed;
  } catch (e) {
    console.error("[getSession] Parse error:", e);
    return null;
  }
}

/**
 * Serialize session ke base64 string (simulasi — ganti dengan JWT di production)
 */
export function serializeSession(user: SessionUser): string {
  // SIMPLIFIED: Store as plain JSON (readable + backward compatible)
  return JSON.stringify(user);
}

/**
 * Cek apakah user memiliki role tertentu
 */
export function hasRole(user: SessionUser | null, ...roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
