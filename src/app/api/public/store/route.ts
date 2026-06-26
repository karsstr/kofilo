import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ambil data yang aman untuk publik (nama, deskripsi, logo, banner) 
    // + Ditambah data untuk PWA Landing Page & Struk Universal
    let settings = await prisma.storeSetting.findFirst({
      select: {
        storeName: true,
        description: true,
        logo: true,
        pwaBanners: true,
        isStoreOpen: true,
        pwaWelcomeBg: true,
        pwaWelcomeSubtitle: true,
        pwaFooterText: true,
        receiptFooter: true,
        wifiPassword: true,
      }
    });

    if (!settings) {
      // Tambahkan nilai default (fallback) jika database masih kosong
      settings = { 
        storeName: "Kofilo Craft Coffee", 
        description: null, 
        logo: null, 
        pwaBanners: null as any,
        isStoreOpen: true,
        pwaWelcomeBg: null,
        pwaWelcomeSubtitle: "TABLE DASHBOARD",
        pwaFooterText: "© 2026 KOFILO. PREMIUM EXPERIENCE.",
        receiptFooter: "Terima kasih atas kunjungannya!",
        wifiPassword: null
      };
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}