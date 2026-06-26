// =============================================================
// Auth Helpers — CLIENT SIDE (untuk Client Components)
// =============================================================

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: string;
}

const SESSION_COOKIE = "pos_session";

export function getSessionClient(): SessionUser | null {
  try {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${SESSION_COOKIE}=`))
      ?.split("=")[1];

    if (!raw) return null;

    // Support both raw JSON and base64
    let parsed: SessionUser;
    if (raw.startsWith("{") || raw.startsWith("[")) {
      parsed = JSON.parse(decodeURIComponent(raw));
    } else {
      parsed = JSON.parse(atob(raw));
    }
    return parsed;
  } catch {
    return null;
  }
}