// =============================================================
// Middleware — RBAC (Role-Based Access Control)
// File ini dijalankan SEBELUM setiap request masuk ke halaman/API
// =============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Route Configuration ──────────────────────────────────────

/**
 * Route yang hanya bisa diakses oleh SUPER_ADMIN
 */
const ADMIN_ROUTES = ["/cms"];

/**
 * Route yang hanya bisa diakses oleh CASHIER (atau semua role yang login)
 */
const CASHIER_ROUTES = ["/cashier"];

/**
 * Route publik — tidak perlu autentikasi
 */
const PUBLIC_ROUTES = ["/login", "/api/auth"];

// ─── Middleware Function ──────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati route publik
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isPublicRoute) return NextResponse.next();

  // ─── TODO: Ganti dengan JWT verification yang sesungguhnya ───
  // Contoh menggunakan cookie session (simulasi MVP):
  const sessionCookie = request.cookies.get("pos_session")?.value;

  // Jika tidak ada session → redirect ke login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Parse session (TODO: verifikasi JWT di sini)
  let session: { role: string } | null = null;
  try {
    session = JSON.parse(
      Buffer.from(sessionCookie, "base64").toString("utf-8")
    );
  } catch {
    // Session tidak valid → redirect ke login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = session?.role;

  // ─── Guard Admin Routes ───────────────────────────────────
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (isAdminRoute && role !== "SUPER_ADMIN") {
    // Kasir tidak boleh masuk halaman admin
    return NextResponse.redirect(new URL("/cashier", request.url));
  }

  // ─── Guard Cashier Routes ─────────────────────────────────
  const isCashierRoute = CASHIER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isCashierRoute && role !== "CASHIER" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// ─── Matcher — Route yang dikenai middleware ──────────────────
export const config = {
  matcher: [
    /*
     * Jalankan middleware untuk semua route KECUALI:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, manifest.json, icons/
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-).*)",
  ],
};
