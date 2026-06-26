// =============================================================
// Admin Layout — (admin)/layout.tsx
// Wrapper untuk semua halaman CMS (SUPER_ADMIN & MANAGER)
// =============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionClient } from "@/lib/auth-client";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    function checkAuth() {
      const s = getSessionClient();

      // 🔥 Izinkan SUPER_ADMIN dan MANAGER masuk 🔥
      const role = s?.role as string | undefined;
      const allowedRoles: string[] = ["SUPER_ADMIN", "MANAGER"];
      if (!role || !allowedRoles.includes(role)) {
        router.push("/login");
      } else {
        setSession(s);
      }
    }
    checkAuth();
  }, [router]);

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
