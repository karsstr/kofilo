import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Hanya ambil data yang aman untuk publik (nama, deskripsi, logo, banner)
    let settings = await prisma.storeSetting.findFirst({
      select: {
        storeName: true,
        description: true,
        logo: true,
        pwaBanners: true,
      }
    });

    if (!settings) {
      settings = { storeName: "Kofilo Craft Coffee", description: null, logo: null, pwaBanners: null };
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}