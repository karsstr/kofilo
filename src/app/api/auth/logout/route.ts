// =============================================================
// API Auth — /api/auth/logout/route.ts
// GET: Logout — hapus session cookie dan redirect ke login
// =============================================================

import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  );

  // Hapus cookie session
  response.cookies.set("pos_session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
