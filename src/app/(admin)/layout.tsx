// =============================================================
// Admin Layout — (admin)/layout.tsx
// Wrapper untuk semua halaman CMS (SUPER_ADMIN & MANAGER)
// =============================================================

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession();

      // 🔥 Izinkan SUPER_ADMIN dan MANAGER masuk 🔥
      if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MANAGER")) {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar navigasi admin */}
      <Sidebar />

      {/* Konten utama */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
