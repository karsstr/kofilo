// =============================================================
// Admin Layout — (admin)/layout.tsx
// Wrapper untuk semua halaman CMS (hanya SUPER_ADMIN)
// =============================================================

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add Auth check here
  // Middleware sudah handle redirect, ini sebagai double-guard di Server Component
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
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
