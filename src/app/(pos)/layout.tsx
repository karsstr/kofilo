// =============================================================
// POS Layout — (pos)/layout.tsx
// Wrapper untuk halaman kasir (CASHIER & SUPER_ADMIN bisa akses)
// =============================================================

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add Auth check here
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Super admin juga bisa lihat tampilan kasir untuk monitoring
  // if (session.role !== "CASHIER") redirect("/cms/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header kasir */}
      <header className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shadow">
        <h1 className="font-bold text-lg">🍽️ POS Kasir</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-green-700 px-2 py-1 rounded text-xs">
            {session.role}
          </span>
          <span>{session.name}</span>
          <a
            href="/api/auth/logout"
            className="bg-white text-green-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100"
          >
            Keluar
          </a>
        </div>
      </header>
      {children}
    </div>
  );
}
