// =============================================================
// Admin Layout — (admin)/layout.tsx
// Wrapper untuk semua halaman CMS (SUPER_ADMIN & MANAGER)
// =============================================================

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware sudah handle redirect, ini sebagai double-guard di Server Component
  const session = await getSession();
  const isAuthorized = session?.role === "SUPER_ADMIN" || session?.role === "MANAGER"

  // 🔥 Izinkan SUPER_ADMIN dan MANAGER masuk 🔥
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MANAGER")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar navigasi admin */}
      <Sidebar user={session} />

      {/* Konten utama */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}