// =============================================================
// API PWA Rewards — /api/v1/pwa/rewards/route.ts
// GET: Mengambil daftar reward untuk pelanggan (Public)
// =============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rewards = await prisma.rewardProduct.findMany({
      orderBy: { pointCost: 'asc' }, // Mengurutkan dari poin paling murah
    });
    
    return NextResponse.json({ rewards });
  } catch (error) {
    console.error("[GET /api/v1/pwa/rewards]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}